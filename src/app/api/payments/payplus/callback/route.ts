import { NextResponse } from "next/server";
import { processPayPlusPaymentNotification } from "@/lib/payplusWebhookProcessor";
import { createRateLimiter } from "@/lib/rateLimit";

export const runtime = "nodejs";

const limiter = createRateLimiter({ name: "callback", max: 30, windowSec: 60 });

const BODY_LOG_MAX = 2000;

function isManualTestPayload(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const o = payload as Record<string, unknown>;
  return o.test === true && Object.keys(o).length === 1;
}

export async function POST(request: Request) {
  const rl = limiter.check(request);
  if (rl.limited) return rl.response!;

  const token = new URL(request.url).searchParams.get("token");
  const expected = process.env.PAYPLUS_WEBHOOK_SECRET;

  if (!expected || token !== expected) {
    console.warn("[payplus] PAYPLUS CALLBACK UNAUTHORIZED", {
      hasToken: Boolean(token),
      hasExpectedSecret: Boolean(expected),
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[payplus] PAYPLUS CALLBACK HIT");

  const rawBody = await request.text();
  const preview =
    rawBody.length > BODY_LOG_MAX ? `${rawBody.slice(0, BODY_LOG_MAX)}…` : rawBody;
  console.log("[payplus] PAYPLUS CALLBACK BODY", preview);

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (isManualTestPayload(parsed)) {
    return NextResponse.json({ ok: true });
  }

  try {
    await processPayPlusPaymentNotification(rawBody);
  } catch (e) {
    console.error("[payplus] PAYPLUS CALLBACK process error", e);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
