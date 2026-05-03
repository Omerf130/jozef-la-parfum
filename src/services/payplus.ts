import crypto from "crypto";
import type { OrderDoc } from "@/models/Order";

/**
 * PayPlus integration — service layer.
 *
 * PayPlus exposes a hosted "Payment Page" API. We post the order details to
 * `/api/v1.0/PaymentPages/generateLink`, receive a `payment_page_link` plus
 * `page_request_uid`, then redirect the user there.
 *
 * On payment, PayPlus posts a webhook to our endpoint. We verify HMAC-SHA256
 * of the raw request body using PAYPLUS_WEBHOOK_SECRET (the "more_info_5" /
 * shared secret configured in the merchant dashboard).
 *
 * NOTE: exact field names and response shape vary slightly between merchant
 * accounts and API versions. TODO comments below mark spots most likely to
 * need adjustment once the sandbox is live.
 */

const PAYPLUS_BASE_URL = process.env.PAYPLUS_BASE_URL || "https://restapi.payplus.co.il";
const API_KEY = process.env.PAYPLUS_API_KEY;
const SECRET_KEY = process.env.PAYPLUS_SECRET_KEY;
const TERMINAL_UID = process.env.PAYPLUS_TERMINAL_UID;
const SUCCESS_URL = process.env.PAYPLUS_SUCCESS_URL || "http://localhost:3000/payment/success";
const CANCEL_URL = process.env.PAYPLUS_CANCEL_URL || "http://localhost:3000/payment/cancel";
const WEBHOOK_SECRET = process.env.PAYPLUS_WEBHOOK_SECRET || "";

interface CreatePaymentPageInput {
  order: OrderDoc;
  webhookUrl: string;
}

export interface CreatePaymentPageResult {
  url: string;
  pageRequestUid: string;
}

export async function createPaymentPage({
  order,
  webhookUrl,
}: CreatePaymentPageInput): Promise<CreatePaymentPageResult> {
  if (!API_KEY || !SECRET_KEY || !TERMINAL_UID) {
    throw new Error("PayPlus credentials are not configured");
  }

  const body = {
    payment_page_uid: TERMINAL_UID,
    amount: Number(order.total.toFixed(2)),
    currency_code: "ILS",
    sendEmailApproval: false,
    sendEmailFailure: false,
    refURL_success: SUCCESS_URL,
    refURL_failure: CANCEL_URL,
    refURL_cancel: CANCEL_URL,
    refURL_callback: webhookUrl,
    // TODO(PayPlus): some terminals expect `charge_method`, `language_code`
    // ("HEB"), or per-item `items` arrays. Adjust to your account's config.
    charge_method: 1,
    language_code: "HEB",
    customer: {
      customer_name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
    },
    more_info: order._id.toString(),
    more_info_1: order.customerEmail,
    items: order.items.map((it) => ({
      name: `${it.name} (${it.ml} ml)`,
      quantity: it.quantity,
      price: Number(it.unitPrice.toFixed(2)),
    })),
  };

  // TODO(PayPlus): the exact endpoint can vary
  // (`/api/v1.0/PaymentPages/generateLink` is the most common).
  const endpoint = `${PAYPLUS_BASE_URL}/api/v1.0/PaymentPages/generateLink`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // PayPlus accepts an `Authorization` header containing JSON-encoded
      // credentials. TODO: some terminals expect separate api/secret headers.
      Authorization: JSON.stringify({
        api_key: API_KEY,
        secret_key: SECRET_KEY,
      }),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPlus error ${res.status}: ${text.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    results?: { status?: string };
    data?: {
      payment_page_link?: string;
      page_request_uid?: string;
    };
  };

  const link = data.data?.payment_page_link;
  const uid = data.data?.page_request_uid;

  if (!link || !uid) {
    throw new Error("PayPlus did not return a payment page link");
  }

  return { url: link, pageRequestUid: uid };
}

/**
 * Verifies the PayPlus webhook signature.
 *
 * PayPlus signs the raw request body with HMAC-SHA256 using the merchant's
 * webhook secret and sends the digest in a header (commonly
 * `x-payplus-signature` or `hash`). TODO: confirm header name in your
 * merchant dashboard / docs.
 */
export function verifyWebhookSignature(rawBody: string, header: string | null): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn("[payplus] PAYPLUS_WEBHOOK_SECRET not set — skipping verification");
    return true;
  }
  if (!header) return false;

  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  // Some integrations send base64. Compare against both representations.
  const expectedB64 = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("base64");

  const candidate = header.trim().toLowerCase();
  if (candidate === expected.toLowerCase()) return true;
  if (header.trim() === expectedB64) return true;
  return false;
}

/**
 * Parses a PayPlus webhook payload into a normalized shape.
 * TODO(PayPlus): adjust field names to match your account's payload.
 */
export interface PayPlusWebhookEvent {
  status: "approved" | "failed" | "cancelled" | "unknown";
  pageRequestUid?: string;
  transactionUid?: string;
  more_info?: string;
  raw: unknown;
}

export function parseWebhookPayload(payload: unknown): PayPlusWebhookEvent {
  const p = (payload ?? {}) as Record<string, unknown>;
  const data = (p.data ?? p) as Record<string, unknown>;

  const statusRaw = String(
    data.status_code ??
      data.transaction_status ??
      data.status ??
      "",
  ).toLowerCase();

  let status: PayPlusWebhookEvent["status"] = "unknown";
  if (statusRaw.includes("approved") || statusRaw === "000" || statusRaw === "ok") {
    status = "approved";
  } else if (statusRaw.includes("cancel")) {
    status = "cancelled";
  } else if (statusRaw.includes("fail") || statusRaw.includes("decline")) {
    status = "failed";
  }

  return {
    status,
    pageRequestUid: (data.page_request_uid as string) ?? (data.payment_request_uid as string),
    transactionUid:
      (data.transaction_uid as string) ??
      (data.transaction_uuid as string) ??
      (data.transaction_id as string),
    more_info: (data.more_info as string) ?? undefined,
    raw: payload,
  };
}
