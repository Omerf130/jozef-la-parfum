import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CouponModel, type CouponDoc } from "@/models/Coupon";

export interface PublicCouponDTO {
  code: string;
  appliesTo: CouponDoc["appliesTo"];
  discountType: CouponDoc["discountType"];
  discountValue: number;
  minOrderAmount?: number;
  description?: string;
  label: string;
}

function buildCouponLabel(coupon: Pick<CouponDoc, "appliesTo" | "discountType" | "discountValue">): string {
  const target = coupon.appliesTo === "shipping" ? "משלוח" : "מוצרים";
  if (coupon.discountType === "percent") {
    if (coupon.appliesTo === "shipping" && coupon.discountValue >= 100) {
      return "משלוח חינם";
    }
    return `${coupon.discountValue}% הנחה על ${target}`;
  }
  return `₪${coupon.discountValue} הנחה על ${target}`;
}

export async function GET() {
  await connectDB();
  const now = new Date();

  const docs = await CouponModel.find({
    isActive: true,
    isPublic: true,
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }],
    $and: [
      {
        $or: [
          { maxUses: { $exists: false } },
          { maxUses: null },
          { $expr: { $lt: ["$usedCount", "$maxUses"] } },
        ],
      },
    ],
  })
    .sort({ createdAt: -1 })
    .lean();

  const coupons: PublicCouponDTO[] = docs.map((c) => ({
    code: c.code,
    appliesTo: c.appliesTo,
    discountType: c.discountType,
    discountValue: c.discountValue,
    minOrderAmount: c.minOrderAmount,
    description: c.description || undefined,
    label: buildCouponLabel(c),
  }));

  return NextResponse.json(
    { coupons },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    },
  );
}
