import type { HydratedDocument } from "mongoose";
import { connectDB } from "@/lib/db";
import { OrderModel, type OrderDoc } from "@/models/Order";
import { ProductModel } from "@/models/Product";
import { parseWebhookPayload } from "@/services/payplus";
import { sendOrderConfirmation } from "@/services/email";
import { serializeOrder } from "@/lib/serializers";

async function releaseStock(order: HydratedDocument<OrderDoc>) {
  await Promise.all(
    order.items.map((it) =>
      ProductModel.updateOne(
        { _id: it.productId, "sizes.ml": it.ml },
        { $inc: { "sizes.$.stock": it.quantity } },
      ),
    ),
  );
}

/**
 * Shared PayPlus IPN body handler (used by /webhook and /payplus/callback).
 * Does not verify auth — caller must verify signature or query token first.
 */
export async function processPayPlusPaymentNotification(rawBody: string): Promise<void> {
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw new Error("Invalid JSON");
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
    console.warn("[payplus] PAYPLUS ORDER NOT MARKED PAID — order not found", {
      pageRequestUid: event.pageRequestUid,
      more_info: event.more_info,
      status: event.status,
    });
    return;
  }

  if (event.status === "approved" && order.paymentStatus !== "paid") {
    if (event.amount !== undefined) {
      const diff = Math.abs(event.amount - order.total);
      if (diff > 1) {
        console.error("[payplus] PAYPLUS ORDER NOT MARKED PAID — amount mismatch", {
          orderId: String(order._id),
          expected: order.total,
          received: event.amount,
          currency: event.currency,
        });
        return;
      }
    }

    order.paymentStatus = "paid";
    order.orderStatus = "processing";
    if (event.transactionUid) order.paymentTransactionId = event.transactionUid;
    await order.save();

    // Stock was already reserved atomically at order creation — no decrement here

    console.log("[payplus] PAYPLUS ORDER MARKED PAID", {
      orderId: String(order._id),
      transactionUid: event.transactionUid,
    });

    try {
      await sendOrderConfirmation(serializeOrder(order.toObject()));
    } catch (e) {
      console.error("[payplus] email failed after paid", e);
    }
    return;
  }

  if (event.status === "approved" && order.paymentStatus === "paid") {
    console.log("[payplus] PAYPLUS ORDER NOT MARKED PAID — already paid", {
      orderId: String(order._id),
    });
    return;
  }

  if (event.status === "failed") {
    order.paymentStatus = "failed";
    await order.save();

    await releaseStock(order);

    console.log("[payplus] PAYPLUS ORDER NOT MARKED PAID — payment failed, stock released", {
      orderId: String(order._id),
    });
    return;
  }

  if (event.status === "cancelled") {
    order.paymentStatus = "failed";
    order.orderStatus = "cancelled";
    await order.save();

    await releaseStock(order);

    console.log("[payplus] PAYPLUS ORDER NOT MARKED PAID — cancelled, stock released", {
      orderId: String(order._id),
    });
    return;
  }

  console.log("[payplus] PAYPLUS ORDER NOT MARKED PAID — status not actionable", {
    orderId: String(order._id),
    status: event.status,
  });
}
