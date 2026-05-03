import { NextResponse } from "next/server";
import type { HydratedDocument } from "mongoose";
import { connectDB } from "@/lib/db";
import { OrderModel, type OrderDoc } from "@/models/Order";
import { ProductModel } from "@/models/Product";
import { verifyWebhookSignature, parseWebhookPayload } from "@/services/payplus";
import { sendOrderConfirmation } from "@/services/email";
import { serializeOrder } from "@/lib/serializers";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    // TODO(PayPlus): confirm exact header name in your merchant docs.
    const signatureHeader =
      request.headers.get("x-payplus-signature") ||
      request.headers.get("hash") ||
      request.headers.get("signature");

    if (!verifyWebhookSignature(rawBody, signatureHeader)) {
      console.warn("[payplus webhook] invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const event = parseWebhookPayload(payload);

    await connectDB();

    let order: HydratedDocument<OrderDoc> | null = null;
    if (event.more_info) {
      order = await OrderModel.findById(event.more_info);
    }
    if (!order && event.pageRequestUid) {
      order = await OrderModel.findOne({ payplusPageUid: event.pageRequestUid });
    }
    if (!order) {
      console.warn("[payplus webhook] order not found", event);
      return NextResponse.json({ ok: true });
    }

    if (event.status === "approved" && order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      order.orderStatus = "processing";
      if (event.transactionUid) order.paymentTransactionId = event.transactionUid;
      await order.save();

      await Promise.all(
        order.items.map((it) =>
          ProductModel.updateOne(
            { _id: it.productId, "sizes.ml": it.ml },
            { $inc: { "sizes.$.stock": -it.quantity } },
          ),
        ),
      );

      try {
        await sendOrderConfirmation(serializeOrder(order.toObject()));
      } catch (e) {
        console.error("[payplus webhook] email failed", e);
      }
    } else if (event.status === "failed") {
      order.paymentStatus = "failed";
      await order.save();
    } else if (event.status === "cancelled") {
      order.paymentStatus = "failed";
      order.orderStatus = "cancelled";
      await order.save();
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/payments/webhook]", e);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
