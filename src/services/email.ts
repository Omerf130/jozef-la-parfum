import { Resend } from "resend";
import type { OrderDTO } from "@/types";
import { formatILS } from "@/lib/format";
import { SITE_NAME } from "@/lib/siteName";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

function resolveEmailFrom(): string {
  const raw = process.env.EMAIL_FROM?.trim();
  if (raw) {
    if (
      (raw.startsWith('"') && raw.endsWith('"')) ||
      (raw.startsWith("'") && raw.endsWith("'"))
    ) {
      return raw.slice(1, -1).trim();
    }
    return raw;
  }
  if (process.env.NODE_ENV !== "production") {
    return `${SITE_NAME} <noreply@example.com>`;
  }
  return "";
}

function fromDomain(from: string): string {
  const match = from.match(/<([^>]+)>/) ?? from.match(/([\w.-]+@[\w.-]+)/);
  const email = match?.[1] ?? match?.[0] ?? from;
  return email.split("@")[1] ?? "unknown";
}

interface SendViaResendInput {
  type: "contact" | "order_confirmation" | "admin_order_notification";
  from: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

async function sendViaResend(input: SendViaResendInput) {
  const hasApiKey = Boolean(resendApiKey);
  console.log("[email] send attempt", {
    type: input.type,
    to: input.to,
    fromDomain: fromDomain(input.from),
    hasApiKey,
  });

  if (!resend) {
    const message = "RESEND_API_KEY not set";
    console.error("[email] Resend error", { type: input.type, name: "missing_api_key", message });
    throw new Error(message);
  }

  const result = await resend.emails.send({
    from: input.from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    replyTo: input.replyTo,
  });

  if (result.error) {
    console.error("[email] Resend error", {
      type: input.type,
      name: result.error.name,
      message: result.error.message,
    });
    throw new Error(`Resend: ${result.error.message}`);
  }

  console.log("[email] Resend sent", {
    type: input.type,
    id: result.data?.id,
    to: input.to,
  });

  return result;
}

interface ContactEmailInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  to?: string;
}

export async function sendContactEmail(input: ContactEmailInput) {
  const from = resolveEmailFrom();
  if (!from) {
    throw new Error("EMAIL_FROM not set");
  }

  const to = input.to || process.env.SUPPORT_EMAIL || from;
  const html = `
    <div dir="rtl" style="font-family: 'Segoe UI', Arial, sans-serif; line-height:1.7; color:#222;">
      <h2 style="color:#0d0d0d; margin:0 0 16px;">פנייה חדשה מאתר הבוטיק</h2>
      <p><strong>שם:</strong> ${escape(input.name)}</p>
      <p><strong>דוא&quot;ל:</strong> ${escape(input.email)}</p>
      ${input.phone ? `<p><strong>טלפון:</strong> ${escape(input.phone)}</p>` : ""}
      <p><strong>נושא:</strong> ${escape(input.subject)}</p>
      <hr style="border:none; border-top:1px solid #eee; margin:16px 0;" />
      <p style="white-space:pre-wrap;">${escape(input.message)}</p>
    </div>
  `;

  return sendViaResend({
    type: "contact",
    from,
    to,
    replyTo: input.email,
    subject: `פנייה חדשה: ${input.subject}`,
    html,
  });
}

export async function sendOrderConfirmation(order: OrderDTO) {
  const from = resolveEmailFrom();
  if (!from) {
    throw new Error("EMAIL_FROM not set");
  }

  const itemsHtml = order.items
    .map(
      (it) => `
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">${escape(it.name)} (${it.ml} מ״ל)</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; text-align:center;">${it.quantity}</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; text-align:left;">${formatILS(it.unitPrice * it.quantity)}</td>
        </tr>
      `,
    )
    .join("");

  const floorApartmentLine = [
    order.shippingAddress.floor ? `קומה ${escape(order.shippingAddress.floor)}` : "",
    order.shippingAddress.apartment ? `דירה ${escape(order.shippingAddress.apartment)}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const html = `
    <div dir="rtl" style="font-family: 'Segoe UI', Arial, sans-serif; line-height:1.7; color:#222; max-width:640px; margin:auto;">
      <div style="background:#0d0d0d; color:#c9a96e; padding:20px; text-align:center;">
        <h1 style="margin:0; font-size:24px; letter-spacing:0.05em;">${SITE_NAME}</h1>
      </div>
      <div style="padding:24px; background:#f5efe6;">
        <h2 style="color:#0d0d0d; margin:0 0 12px;">תודה על הזמנתך, ${escape(order.customerName)}!</h2>
        <p style="margin:0 0 16px;">
          ההזמנה שלך התקבלה בהצלחה. מספר הזמנה: <strong>${order._id}</strong>
        </p>
        <p style="margin:0 0 24px;">
          אנו נארוז את ההזמנה ונשלח אליך בהקדם. תוכל להתעדכן במצב ההזמנה בכל עת.
        </p>

        <table style="width:100%; border-collapse:collapse; background:#fff; border:1px solid #eee;">
          <thead>
            <tr style="background:#ece3d3;">
              <th style="text-align:right; padding:10px 12px;">פריט</th>
              <th style="text-align:center; padding:10px 12px;">כמות</th>
              <th style="text-align:left; padding:10px 12px;">סה״כ</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="margin-top:18px; background:#fff; border:1px solid #eee; padding:14px 18px;">
          <div style="display:flex; justify-content:space-between; padding:4px 0;">
            <span>סכום ביניים</span><span>${formatILS(order.subtotal)}</span>
          </div>
          ${
            order.discountAmount > 0
              ? `<div style="display:flex; justify-content:space-between; padding:4px 0; color:#2d6a4f;">
            <span>הנחה${order.couponCode ? ` (${escape(order.couponCode)})` : ""}</span><span>-${formatILS(order.discountAmount)}</span>
          </div>`
              : ""
          }
          <div style="display:flex; justify-content:space-between; padding:4px 0;">
            <span>משלוח</span><span>${formatILS(order.shippingPrice)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:8px 0 0; border-top:1px solid #eee; font-weight:600; color:#0d0d0d;">
            <span>סה״כ לתשלום</span><span>${formatILS(order.total)}</span>
          </div>
        </div>

        <h3 style="color:#0d0d0d; margin:24px 0 8px;">פרטי משלוח</h3>
        <p style="margin:0;">
          ${escape(order.shippingAddress.street)}<br/>
          ${floorApartmentLine ? `${floorApartmentLine}<br/>` : ""}
          ${escape(order.shippingAddress.city)}, ${escape(order.shippingAddress.zip)}<br/>
          ${escape(order.shippingAddress.country)}
        </p>

        <p style="margin:32px 0 0; color:#6b6357; font-size:13px;">
          לכל שאלה – אנו כאן: <a href="mailto:${escape(process.env.SUPPORT_EMAIL || "support@example.com")}">${escape(process.env.SUPPORT_EMAIL || "support@example.com")}</a>
        </p>
      </div>
      <div style="background:#0d0d0d; color:rgba(245,239,230,0.6); padding:14px; text-align:center; font-size:12px;">
        © ${new Date().getFullYear()} ${SITE_NAME}
      </div>
    </div>
  `;

  return sendViaResend({
    type: "order_confirmation",
    from,
    to: order.customerEmail,
    subject: `אישור הזמנה #${order._id.slice(-8).toUpperCase()}`,
    html,
  });
}

export async function sendAdminOrderNotification(order: OrderDTO) {
  const from = resolveEmailFrom();
  if (!from) {
    throw new Error("EMAIL_FROM not set");
  }

  const to = process.env.SUPPORT_EMAIL || from;

  const itemsHtml = order.items
    .map(
      (it) => `
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">${escape(it.name)} (${it.ml} מ״ל)</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; text-align:center;">${it.quantity}</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee; text-align:left;">${formatILS(it.unitPrice * it.quantity)}</td>
        </tr>
      `,
    )
    .join("");

  const floorApartmentLine = [
    order.shippingAddress.floor ? `קומה ${escape(order.shippingAddress.floor)}` : "",
    order.shippingAddress.apartment ? `דירה ${escape(order.shippingAddress.apartment)}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const orderDate = new Date(order.createdAt).toLocaleString("he-IL", {
    timeZone: "Asia/Jerusalem",
  });

  const html = `
    <div dir="rtl" style="font-family: 'Segoe UI', Arial, sans-serif; line-height:1.7; color:#222; max-width:640px; margin:auto;">
      <div style="background:#0d0d0d; color:#c9a96e; padding:20px; text-align:center;">
        <h1 style="margin:0; font-size:22px; letter-spacing:0.05em;">הזמנה חדשה שולמה</h1>
      </div>
      <div style="padding:24px; background:#f5efe6;">
        <p style="margin:0 0 16px;">
          התקבלה הזמנה חדשה ששולמה. מספר הזמנה: <strong>#${order._id.slice(-8).toUpperCase()}</strong><br/>
          מזהה מלא: ${escape(order._id)}<br/>
          תאריך: ${escape(orderDate)}
        </p>

        <h3 style="color:#0d0d0d; margin:16px 0 8px;">פרטי לקוח למשלוח</h3>
        <div style="background:#fff; border:1px solid #eee; padding:14px 18px;">
          <p style="margin:0 0 6px;"><strong>שם:</strong> ${escape(order.customerName)}</p>
          <p style="margin:0 0 6px;"><strong>טלפון:</strong> <a href="tel:${escape(order.customerPhone)}">${escape(order.customerPhone)}</a></p>
          <p style="margin:0 0 6px;"><strong>דוא&quot;ל:</strong> <a href="mailto:${escape(order.customerEmail)}">${escape(order.customerEmail)}</a></p>
          <p style="margin:0;"><strong>כתובת:</strong><br/>
            ${escape(order.shippingAddress.street)}<br/>
            ${floorApartmentLine ? `${floorApartmentLine}<br/>` : ""}
            ${escape(order.shippingAddress.city)}, ${escape(order.shippingAddress.zip)}<br/>
            ${escape(order.shippingAddress.country)}
          </p>
        </div>

        <h3 style="color:#0d0d0d; margin:24px 0 8px;">פריטים</h3>
        <table style="width:100%; border-collapse:collapse; background:#fff; border:1px solid #eee;">
          <thead>
            <tr style="background:#ece3d3;">
              <th style="text-align:right; padding:10px 12px;">פריט</th>
              <th style="text-align:center; padding:10px 12px;">כמות</th>
              <th style="text-align:left; padding:10px 12px;">סה״כ</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="margin-top:18px; background:#fff; border:1px solid #eee; padding:14px 18px;">
          <div style="display:flex; justify-content:space-between; padding:4px 0;">
            <span>סכום ביניים</span><span>${formatILS(order.subtotal)}</span>
          </div>
          ${
            order.discountAmount > 0
              ? `<div style="display:flex; justify-content:space-between; padding:4px 0; color:#2d6a4f;">
            <span>הנחה${order.couponCode ? ` (${escape(order.couponCode)})` : ""}</span><span>-${formatILS(order.discountAmount)}</span>
          </div>`
              : ""
          }
          <div style="display:flex; justify-content:space-between; padding:4px 0;">
            <span>משלוח</span><span>${formatILS(order.shippingPrice)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:8px 0 0; border-top:1px solid #eee; font-weight:600; color:#0d0d0d;">
            <span>סה״כ ששולם</span><span>${formatILS(order.total)}</span>
          </div>
        </div>

        ${
          order.paymentTransactionId
            ? `<p style="margin:16px 0 0; color:#6b6357; font-size:13px;">מזהה עסקה PayPlus: ${escape(order.paymentTransactionId)}</p>`
            : ""
        }
      </div>
    </div>
  `;

  return sendViaResend({
    type: "admin_order_notification",
    from,
    to,
    replyTo: order.customerEmail,
    subject: `הזמנה חדשה שולמה #${order._id.slice(-8).toUpperCase()} — ${order.customerName}`,
    html,
  });
}

function escape(input: string): string {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
