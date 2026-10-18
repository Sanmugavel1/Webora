/** Shared (client-safe) CRM vocabulary. */

export const STAGES = [
  { id: "new", label: "New", color: "#4c9aff" },
  { id: "contacted", label: "Contacted", color: "#7c5cff" },
  { id: "qualified", label: "Qualified", color: "#c084fc" },
  { id: "proposal", label: "Proposal Sent", color: "#f5b942" },
  { id: "won", label: "Won", color: "#17d4b8" },
  { id: "lost", label: "Lost", color: "#7e93b3" },
] as const;

export type StageId = (typeof STAGES)[number]["id"];
export const STAGE_IDS = STAGES.map((s) => s.id) as StageId[];
export const OPEN_STAGES: StageId[] = ["new", "contacted", "qualified", "proposal"];

/** Tag put on a lead whose number turned out not to be on WhatsApp. */
export const NO_WHATSAPP_TAG = "no-whatsapp";

export function stageOf(id: string) {
  return STAGES.find((s) => s.id === id) ?? STAGES[0];
}

export const SOURCES = [
  { id: "website", label: "Website form" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "referral", label: "Referral" },
  { id: "walk-in", label: "Walk-in / Call" },
  { id: "payment", label: "Online payment" },
  { id: "manual", label: "Other" },
] as const;

export function sourceLabel(id: string) {
  return SOURCES.find((s) => s.id === id)?.label ?? id;
}

export const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "Email" },
] as const;
export type Channel = (typeof CHANNELS)[number]["id"];

/** When a follow-up sequence starts automatically. */
export const TRIGGERS = [
  { id: "new_lead", label: "When a new lead arrives" },
  { id: "stage:contacted", label: "When lead moves to Contacted" },
  { id: "stage:qualified", label: "When lead moves to Qualified" },
  { id: "stage:proposal", label: "When a proposal is sent" },
  { id: "stage:won", label: "When a deal is won (onboarding)" },
  { id: "stage:lost", label: "When a deal is lost (win-back)" },
  { id: "manual", label: "Only when I add a lead manually" },
] as const;

export function triggerLabel(id: string) {
  return TRIGGERS.find((t) => t.id === id)?.label ?? id;
}

export const TEMPLATE_VARIABLES = [
  { key: "first_name", hint: "Lead's first name" },
  { key: "name", hint: "Lead's full name" },
  { key: "business", hint: "Business name" },
  { key: "service", hint: "Service they asked about" },
  { key: "agent", hint: "Assigned team member" },
  { key: "website", hint: "Webora site link" },
  { key: "pricing_link", hint: "Pricing page link" },
  { key: "whatsapp", hint: "Webora WhatsApp number" },
] as const;

export const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://webora-project.vercel.app").replace(/\/$/, "");

export type SequenceStep = { day: number; channel: Channel; templateId: number };
