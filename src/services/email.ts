import { Resend } from "resend";
import type { OrderDTO } from "@/types";
import { formatILS } from "@/lib/format";

const resendApiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.EMAIL_FROM || "jozef la perfume <noreply@example.com>";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface ContactEmailInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  to?: string;
}

export async function sendContactEmail(input: ContactEmailInput) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping contact email");
    return { skipped: true };
  }
  const to = input.to || process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || "";
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
  return resend.emails.send({
    from: fromAddress,
    to,
    replyTo: input.email,
    subject: `פנייה חדשה: ${input.subject}`,
    html,
  });
}

export async function sendOrderConfirmation(order: OrderDTO) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping order confirmation");
    return { skipped: true };
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

  const html = `
    <div dir="rtl" style="font-family: 'Segoe UI', Arial, sans-serif; line-height:1.7; color:#222; max-width:640px; margin:auto;">
      <div style="background:#0d0d0d; color:#c9a96e; padding:20px; text-align:center;">
        <h1 style="margin:0; font-size:24px; letter-spacing:0.05em;">jozef la perfume</h1>
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
          ${escape(order.shippingAddress.city)}, ${escape(order.shippingAddress.zip)}<br/>
          ${escape(order.shippingAddress.country)}
        </p>

        <p style="margin:32px 0 0; color:#6b6357; font-size:13px;">
          לכל שאלה – אנו כאן: <a href="mailto:${escape(process.env.SUPPORT_EMAIL || "support@example.com")}">${escape(process.env.SUPPORT_EMAIL || "support@example.com")}</a>
        </p>
      </div>
      <div style="background:#0d0d0d; color:rgba(245,239,230,0.6); padding:14px; text-align:center; font-size:12px;">
        © ${new Date().getFullYear()} jozef la perfume
      </div>
    </div>
  `;

  return resend.emails.send({
    from: fromAddress,
    to: order.customerEmail,
    subject: `אישור הזמנה #${order._id.slice(-8).toUpperCase()}`,
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
