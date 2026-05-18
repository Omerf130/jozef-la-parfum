import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { createPaymentPage } from "@/services/payplus";

function isProductionDeploy(): boolean {
  return (
    process.env.VERCEL_ENV === "production" ||
    (process.env.NODE_ENV === "production" && process.env.VERCEL === "1")
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { orderId?: string };
    if (!body?.orderId || !mongoose.isValidObjectId(body.orderId)) {
      return NextResponse.json({ error: "orderId חסר או לא תקין" }, { status: 400 });
    }

    const successUrl = process.env.PAYPLUS_SUCCESS_URL || "";
    const cancelUrl = process.env.PAYPLUS_CANCEL_URL || "";
    if (isProductionDeploy()) {
      if (successUrl.includes("localhost") || cancelUrl.includes("localhost")) {
        console.warn(
          "[payplus] PAYPLUS CREATE PAYMENT — production deploy but PAYPLUS_SUCCESS_URL or PAYPLUS_CANCEL_URL contains localhost",
        );
      }
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
    const secret = process.env.PAYPLUS_WEBHOOK_SECRET;
    const webhookUrl = secret
      ? `${origin}/api/payments/payplus/callback?token=${encodeURIComponent(secret)}`
      : `${origin}/api/payments/webhook`;

    if (!secret) {
      console.warn(
        "[payplus] PAYPLUS CREATE PAYMENT — PAYPLUS_WEBHOOK_SECRET empty; using /api/payments/webhook without token",
      );
    }

    console.log("[payplus] PAYPLUS CREATE PAYMENT START", {
      orderId: body.orderId,
      origin,
      callbackPath: "/api/payments/payplus/callback",
    });

    const { url, pageRequestUid } = await createPaymentPage({ order, webhookUrl });

    console.log("[payplus] PAYPLUS CREATE PAYMENT RESPONSE", {
      orderId: body.orderId,
      pageRequestUid,
      paymentPageHost: (() => {
        try {
          return new URL(url).host;
        } catch {
          return "(invalid url)";
        }
      })(),
    });

    order.payplusPageUid = pageRequestUid;
    await order.save();

    return NextResponse.json({ url });
  } catch (e) {
    console.error("[api/payments/create]", e);
    const message = e instanceof Error ? e.message : "שגיאת שרת";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
