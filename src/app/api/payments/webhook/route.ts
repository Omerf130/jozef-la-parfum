import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/services/payplus";
import { processPayPlusPaymentNotification } from "@/lib/payplusWebhookProcessor";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    const signatureHeader =
      request.headers.get("x-payplus-signature") ||
      request.headers.get("hash") ||
      request.headers.get("signature");

    if (!verifyWebhookSignature(rawBody, signatureHeader)) {
      console.warn("[payplus webhook] invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    try {
      await processPayPlusPaymentNotification(rawBody);
    } catch (e) {
      if (e instanceof Error && e.message === "Invalid JSON") {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
      }
      throw e;
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/payments/webhook]", e);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
