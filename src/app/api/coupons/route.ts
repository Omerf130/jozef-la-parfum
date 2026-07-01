import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { CouponModel } from "@/models/Coupon";
import { auth } from "@/lib/auth";
import { couponSchema } from "@/lib/validation/coupon";
import { serializeCoupon } from "@/lib/serializers";
import { normalizeCouponCode, parseCouponProductIds, validateCouponProductIds } from "@/lib/coupons";
import { parseCouponExpiresAt } from "@/lib/israelDateTime";

function toCouponData(data: ReturnType<typeof couponSchema.parse>) {
  return {
    code: normalizeCouponCode(data.code),
    appliesTo: data.appliesTo,
    discountType: data.discountType,
    discountValue: data.discountValue,
    minOrderAmount: data.minOrderAmount ?? undefined,
    maxUses: data.maxUses ?? undefined,
    maxUsesPerCustomer: data.maxUsesPerCustomer ?? 1,
    expiresAt: parseCouponExpiresAt(data.expiresAt),
    isActive: data.isActive,
    isPublic: data.isPublic,
    description: data.description ?? undefined,
    productIds:
      data.appliesTo === "shipping" ? [] : parseCouponProductIds(data.productIds),
  };
}

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const docs = await CouponModel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ coupons: docs.map(serializeCoupon) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = couponSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ולידציה נכשלה", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const productError = await validateCouponProductIds(parsed.data.productIds ?? []);
    if (productError) {
      return NextResponse.json({ error: productError }, { status: 400 });
    }
    await connectDB();
    const created = await CouponModel.create(toCouponData(parsed.data));
    revalidatePath("/", "layout");
    return NextResponse.json(
      { coupon: serializeCoupon(created.toObject()) },
      { status: 201 },
    );
  } catch (e) {
    console.error("[api/coupons POST]", e);
    if (e && typeof e === "object" && "code" in e && (e as { code: number }).code === 11000) {
      return NextResponse.json({ error: "קוד קופון כבר קיים" }, { status: 400 });
    }
    const message = e instanceof Error ? e.message : "שגיאת שרת";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
