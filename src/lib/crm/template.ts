/** Client-safe template rendering + WhatsApp link helpers. */
import { WHATSAPP_DISPLAY } from "@/lib/constants";
import { PUBLIC_SITE_URL } from "./config";

export type LeadForTemplate = { name: string; business: string; service: string; agent_name?: string | null };

export function renderTemplate(text: string, lead: LeadForTemplate) {
  const first = lead.name.trim().split(/\s+/)[0] || "there";
  const vars: Record<string, string> = {
    first_name: first,
    name: lead.name.trim() || "there",
    business: lead.business.trim() || "your business",
    service: lead.service.trim() || "a website",
    agent: lead.agent_name?.trim() || "Team WEBORA",
    website: PUBLIC_SITE_URL,
    pricing_link: `${PUBLIC_SITE_URL}/pricing`,
    whatsapp: WHATSAPP_DISPLAY,
  };
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, key: string) => vars[key] ?? m);
}

/** Normalises Indian-style numbers to E.164 digits (no +) for wa.me / Cloud API. */
export function normalisePhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  if (d.length === 10) d = `91${d}`;
  return d;
}

export function waLink(phone: string, text: string) {
  return `https://wa.me/${normalisePhone(phone)}?text=${encodeURIComponent(text)}`;
}

export function mailtoLink(email: string, subject: string, body: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
