import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { CouponModel, type CouponDoc } from "@/models/Coupon";
import { OrderModel } from "@/models/Order";
import { ProductModel } from "@/models/Product";
import { getShippingConfig } from "@/lib/siteSettings";

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

export function calculateDiscount(
  coupon: Pick<CouponDoc, "discountType" | "discountValue" | "appliesTo">,
  amounts: { subtotal: number; shippingPrice: number },
): number {
  const base = coupon.appliesTo === "shipping" ? amounts.shippingPrice : amounts.subtotal;
  if (base <= 0) return 0;

  const discount =
    coupon.discountType === "percent"
      ? Math.round((base * coupon.discountValue) / 100)
      : Math.round(coupon.discountValue);

  return Math.min(discount, base);
}

export interface OrderPricingInput {
  subtotal: number;
  shippingPriceILS: number;
  freeShippingThreshold: number;
  coupon?: Pick<CouponDoc, "appliesTo" | "discountType" | "discountValue"> | null;
}

export interface OrderPricingResult {
  subtotal: number;
  shippingPrice: number;
  discountAmount: number;
  total: number;
}

export function computeOrderTotals(input: OrderPricingInput): OrderPricingResult {
  const { subtotal, shippingPriceILS, freeShippingThreshold, coupon } = input;

  if (!coupon) {
    const shippingPrice = subtotal >= freeShippingThreshold ? 0 : shippingPriceILS;
    return {
      subtotal,
      shippingPrice,
      discountAmount: 0,
      total: subtotal + shippingPrice,
    };
  }

  if (coupon.appliesTo === "products") {
    const discountAmount = calculateDiscount(coupon, { subtotal, shippingPrice: 0 });
    const discountedSubtotal = subtotal - discountAmount;
    const shippingPrice =
      discountedSubtotal >= freeShippingThreshold ? 0 : shippingPriceILS;
    return {
      subtotal,
      shippingPrice,
      discountAmount,
      total: discountedSubtotal + shippingPrice,
    };
  }

  const shippingPrice = subtotal >= freeShippingThreshold ? 0 : shippingPriceILS;
  const discountAmount = calculateDiscount(coupon, { subtotal, shippingPrice });
  return {
    subtotal,
    shippingPrice,
    discountAmount,
    total: subtotal + shippingPrice - discountAmount,
  };
}

export type CouponValidationError =
  | "NOT_FOUND"
  | "INACTIVE"
  | "EXPIRED"
  | "MIN_ORDER"
  | "GLOBAL_LIMIT"
  | "CUSTOMER_LIMIT"
  | "SHIPPING_FREE";

const ERROR_MESSAGES: Record<CouponValidationError, string> = {
  NOT_FOUND: "קוד קופון לא תקין",
  INACTIVE: "הקופון אינו פעיל",
  EXPIRED: "תוקף הקופון פג",
  MIN_ORDER: "סכום ההזמנה נמוך מהמינימום הנדרש לקופון",
  GLOBAL_LIMIT: "הקופון מוצה",
  CUSTOMER_LIMIT: "כבר השתמשת בקופון זה",
  SHIPPING_FREE: "הקופון חל על משלוח בלבד — אין עלות משלוח להנחה",
};

export function couponErrorMessage(code: CouponValidationError): string {
  return ERROR_MESSAGES[code];
}

interface ValidateCouponParams {
  coupon: CouponDoc;
  subtotal: number;
  shippingPrice: number;
  customerEmail?: string;
  checkCustomerLimit?: boolean;
}

export async function validateCouponRules(
  params: ValidateCouponParams,
): Promise<{ valid: true } | { valid: false; error: CouponValidationError }> {
  const { coupon, subtotal, shippingPrice, customerEmail, checkCustomerLimit = true } = params;

  if (!coupon.isActive) {
    return { valid: false, error: "INACTIVE" };
  }

  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return { valid: false, error: "EXPIRED" };
  }

  if (coupon.minOrderAmount != null && subtotal < coupon.minOrderAmount) {
    return { valid: false, error: "MIN_ORDER" };
  }

  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "GLOBAL_LIMIT" };
  }

  if (coupon.appliesTo === "shipping" && shippingPrice <= 0) {
    return { valid: false, error: "SHIPPING_FREE" };
  }

  if (checkCustomerLimit && customerEmail && coupon.maxUsesPerCustomer != null) {
    await connectDB();
    const email = customerEmail.trim().toLowerCase();
    const usedByCustomer = await OrderModel.countDocuments({
      couponId: coupon._id,
      customerEmail: email,
      paymentStatus: { $in: ["pending", "paid"] },
    });
    if (usedByCustomer >= coupon.maxUsesPerCustomer) {
      return { valid: false, error: "CUSTOMER_LIMIT" };
    }
  }

  return { valid: true };
}

export async function findCouponByCode(code: string): Promise<CouponDoc | null> {
  await connectDB();
  const normalized = normalizeCouponCode(code);
  return CouponModel.findOne({ code: normalized }).lean() as Promise<CouponDoc | null>;
}

export async function computeSubtotalFromItems(
  items: Array<{ productId: string; ml: number; quantity: number }>,
): Promise<number> {
  await connectDB();
  const productIds = items
    .map((it) => it.productId)
    .filter((id) => mongoose.isValidObjectId(id));
  const products = await ProductModel.find({
    _id: { $in: productIds },
    isActive: true,
  }).lean();
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  let subtotal = 0;
  for (const it of items) {
    const p = productMap.get(it.productId);
    if (!p) continue;
    const size = p.sizes.find((s) => s.ml === it.ml);
    if (!size) continue;
    const unitPrice =
      p.salePrice && p.salePrice < p.price
        ? Math.round((p.salePrice / p.price) * size.price)
        : size.price;
    subtotal += unitPrice * it.quantity;
  }
  return subtotal;
}

export interface ValidateCouponForCheckoutParams {
  code: string;
  items: Array<{ productId: string; ml: number; quantity: number }>;
  customerEmail?: string;
  checkCustomerLimit?: boolean;
}

export interface ValidateCouponForCheckoutResult {
  valid: boolean;
  message: string;
  discountAmount?: number;
  appliesTo?: CouponDoc["appliesTo"];
  couponCode?: string;
  preview?: OrderPricingResult & { subtotal: number };
}

export async function validateCouponForCheckout(
  params: ValidateCouponForCheckoutParams,
): Promise<ValidateCouponForCheckoutResult> {
  const coupon = await findCouponByCode(params.code);
  if (!coupon) {
    return { valid: false, message: couponErrorMessage("NOT_FOUND") };
  }

  const subtotal = await computeSubtotalFromItems(params.items);
  const shippingCfg = await getShippingConfig();
  const baseShippingPrice =
    subtotal >= shippingCfg.freeShippingThreshold ? 0 : shippingCfg.shippingPriceILS;

  const rules = await validateCouponRules({
    coupon,
    subtotal,
    shippingPrice: baseShippingPrice,
    customerEmail: params.customerEmail,
    checkCustomerLimit: params.checkCustomerLimit ?? !!params.customerEmail,
  });

  if (!rules.valid) {
    return { valid: false, message: couponErrorMessage(rules.error) };
  }

  const pricing = computeOrderTotals({
    subtotal,
    shippingPriceILS: shippingCfg.shippingPriceILS,
    freeShippingThreshold: shippingCfg.freeShippingThreshold,
    coupon,
  });

  return {
    valid: true,
    message: "הקופון הוחל בהצלחה",
    discountAmount: pricing.discountAmount,
    appliesTo: coupon.appliesTo,
    couponCode: coupon.code,
    preview: pricing,
  };
}

export async function reserveCouponUsage(params: {
  code: string;
  subtotal: number;
  shippingPrice: number;
  customerEmail: string;
}): Promise<
  | { ok: true; coupon: CouponDoc; discountAmount: number; pricing: OrderPricingResult }
  | { ok: false; error: CouponValidationError }
> {
  await connectDB();
  const normalized = normalizeCouponCode(params.code);
  const existing = await CouponModel.findOne({ code: normalized }).lean();
  if (!existing) {
    return { ok: false, error: "NOT_FOUND" };
  }

  const rules = await validateCouponRules({
    coupon: existing as CouponDoc,
    subtotal: params.subtotal,
    shippingPrice: params.shippingPrice,
    customerEmail: params.customerEmail,
    checkCustomerLimit: true,
  });
  if (!rules.valid) {
    return { ok: false, error: rules.error };
  }

  const coupon = await CouponModel.findOneAndUpdate(
    {
      code: normalized,
      isActive: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      $and: [
        {
          $or: [
            { maxUses: { $exists: false } },
            { maxUses: null },
            { $expr: { $lt: ["$usedCount", "$maxUses"] } },
          ],
        },
      ],
    },
    { $inc: { usedCount: 1 } },
    { new: true },
  ).lean();

  if (!coupon) {
    return { ok: false, error: "GLOBAL_LIMIT" };
  }

  const shippingCfg = await getShippingConfig();
  const pricing = computeOrderTotals({
    subtotal: params.subtotal,
    shippingPriceILS: shippingCfg.shippingPriceILS,
    freeShippingThreshold: shippingCfg.freeShippingThreshold,
    coupon: coupon as CouponDoc,
  });

  return {
    ok: true,
    coupon: coupon as CouponDoc,
    discountAmount: pricing.discountAmount,
    pricing,
  };
}

export async function releaseCouponUsage(couponId: mongoose.Types.ObjectId | string): Promise<void> {
  await connectDB();
  await CouponModel.updateOne(
    { _id: couponId, usedCount: { $gt: 0 } },
    { $inc: { usedCount: -1 } },
  );
}
