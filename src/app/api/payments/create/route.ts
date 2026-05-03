import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { createPaymentPage } from "@/services/payplus";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { orderId?: string };
    if (!body?.orderId || !mongoose.isValidObjectId(body.orderId)) {
      return NextResponse.json({ error: "orderId חסר או לא תקין" }, { status: 400 });
    }

    await connectDB();
    const order = await OrderModel.findById(body.orderId);
    if (!order) {
      return NextResponse.json({ error: "הזמנה לא נמצאה" }, { status: 404 });
    }
    if (order.paymentStatus === "paid") {
      return NextResponse.json({ error: "ההזמנה כבר שולמה" }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const webhookUrl = `${origin}/api/payments/webhook`;

    const { url, pageRequestUid } = await createPaymentPage({ order, webhookUrl });

    order.payplusPageUid = pageRequestUid;
    await order.save();

    return NextResponse.json({ url });
  } catch (e) {
    console.error("[api/payments/create]", e);
    const message = e instanceof Error ? e.message : "שגיאת שרת";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
