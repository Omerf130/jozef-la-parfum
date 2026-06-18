import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { CouponModel } from "@/models/Coupon";
import { auth } from "@/lib/auth";
import { couponUpdateSchema } from "@/lib/validation/coupon";
import { serializeCoupon } from "@/lib/serializers";
import { normalizeCouponCode } from "@/lib/coupons";

interface Params {
  params: Promise<{ id: string }>;
}

function toCouponUpdate(data: Partial<z.infer<typeof couponUpdateSchema>>) {
  const out: Record<string, unknown> = { ...data };
  if (data.code) out.code = normalizeCouponCode(data.code);
  if (data.expiresAt !== undefined) {
    out.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
  }
  if (data.minOrderAmount === null) out.minOrderAmount = undefined;
  if (data.maxUses === null) out.maxUses = undefined;
  if (data.maxUsesPerCustomer === null) out.maxUsesPerCustomer = undefined;
  if (data.description === null) out.description = undefined;
  return out;
}

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });
  }
  const doc = await CouponModel.findById(id).lean();
  if (!doc) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  return NextResponse.json({ coupon: serializeCoupon(doc) });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });
    }
    const body = await request.json();
    const parsed = couponUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ולידציה נכשלה", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    await connectDB();
    const existing = await CouponModel.findById(id).lean();
    if (!existing) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });

    if (parsed.data.maxUses != null && parsed.data.maxUses < existing.usedCount) {
      return NextResponse.json(
        { error: "לא ניתן להגדיר מקסימום שימושים נמוך ממספר השימושים שכבר בוצעו" },
        { status: 400 },
      );
    }

    const updated = await CouponModel.findByIdAndUpdate(
      id,
      toCouponUpdate(parsed.data),
      { new: true },
    ).lean();
    if (!updated) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
    revalidatePath("/", "layout");
    return NextResponse.json({ coupon: serializeCoupon(updated) });
  } catch (e) {
    console.error("[api/coupons PATCH]", e);
    if (e && typeof e === "object" && "code" in e && (e as { code: number }).code === 11000) {
      return NextResponse.json({ error: "קוד קופון כבר קיים" }, { status: 400 });
    }
    const message = e instanceof Error ? e.message : "שגיאת שרת";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });
  }
  await connectDB();
  const existing = await CouponModel.findById(id).lean();
  if (!existing) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  if (existing.usedCount > 0) {
    return NextResponse.json(
      { error: "לא ניתן למחוק קופון שכבר נוצל — ניתן לבטל אותו במקום" },
      { status: 400 },
    );
  }
  await CouponModel.findByIdAndDelete(id);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
