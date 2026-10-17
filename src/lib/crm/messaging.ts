import "server-only";
import nodemailer from "nodemailer";
export { renderTemplate, normalisePhone, waLink } from "./template";
import { normalisePhone } from "./template";

export const channelStatus = () => ({
  email: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
  whatsappApi: Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID),
});

let transport: nodemailer.Transporter | null = null;

export async function sendEmail(to: string, subject: string, body: string) {
  if (!channelStatus().email) throw new Error("Email not configured (SMTP_USER / SMTP_PASS).");
  transport ??= nodemailer.createTransport({
    // Pooled so a batch of scheduled emails reuses one SMTP connection.
    pool: true,
    maxConnections: 1,
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transport.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || "WEBORA"}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text: body,
  });
}

/**
 * Sends a free-form text through the WhatsApp Cloud API. Meta only delivers
 * free-form text inside the 24h customer-service window, so callers must be
 * ready for this to fail and fall back to the manual outbox.
 */
export async function sendWhatsAppApi(phone: string, body: string) {
  if (!channelStatus().whatsappApi) throw new Error("WhatsApp Cloud API not configured.");
  const res = await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: normalisePhone(phone),
      type: "text",
      text: { body, preview_url: true },
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(err?.error?.message || `WhatsApp API error ${res.status}`);
  }
}
