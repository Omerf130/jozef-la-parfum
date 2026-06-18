import { NextResponse } from "next/server";
import { couponValidateSchema } from "@/lib/validation/coupon";
import { validateCouponForCheckout } from "@/lib/coupons";
import { createRateLimiter } from "@/lib/rateLimit";

const validateLimiter = createRateLimiter({ name: "coupon-validate", max: 20, windowSec: 60 });

export async function POST(request: Request) {
  const rl = validateLimiter.check(request);
  if (rl.limited) return rl.response!;

  try {
    const body = await request.json();
    const parsed = couponValidateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ולידציה נכשלה", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await validateCouponForCheckout({
      code: parsed.data.code,
      items: parsed.data.items,
      customerEmail: parsed.data.customerEmail,
      checkCustomerLimit: !!parsed.data.customerEmail,
    });

    if (!result.valid) {
      return NextResponse.json({
        valid: false,
        message: result.message,
      });
    }

    return NextResponse.json({
      valid: true,
      message: result.message,
      discountAmount: result.discountAmount,
      appliesTo: result.appliesTo,
      couponCode: result.couponCode,
      preview: result.preview,
    });
  } catch (e) {
    console.error("[api/coupons/validate POST]", e);
    const message = e instanceof Error ? e.message : "שגיאת שרת";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
