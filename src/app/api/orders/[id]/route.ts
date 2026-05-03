import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { auth } from "@/lib/auth";
import { serializeOrder } from "@/lib/serializers";

const updateSchema = z.object({
  orderStatus: z
    .enum(["new", "processing", "shipped", "delivered", "cancelled"])
    .optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });
  }
  await connectDB();
  const order = await OrderModel.findById(id).lean();
  if (!order) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  return NextResponse.json({ order: serializeOrder(order) });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });
  }
  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ולידציה נכשלה", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    await connectDB();
    const updated = await OrderModel.findByIdAndUpdate(id, parsed.data, {
      new: true,
    }).lean();
    if (!updated) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
    return NextResponse.json({ order: serializeOrder(updated) });
  } catch (e) {
    console.error("[api/orders PATCH]", e);
    const message = e instanceof Error ? e.message : "שגיאת שרת";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
