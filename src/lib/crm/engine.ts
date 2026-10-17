import "server-only";
import { q, q1 } from "./db";
import { STAGE_IDS, stageOf, type SequenceStep, type StageId } from "./config";
import { channelStatus, renderTemplate, sendEmail, sendWhatsAppApi } from "./messaging";

export type Lead = {
  id: number;
  name: string;
  business: string;
  email: string;
  phone: string;
  service: string;
  source: string;
  stage: StageId;
  value: number;
  tags: string[];
  notes: string;
  assigned_to: number | null;
  agent_name: string | null;
  next_followup_at: Date | null;
  lost_reason: string;
  created_at: Date;
  updated_at: Date;
  stage_changed_at: Date;
};

export const LEAD_SELECT = `SELECT l.*, u.name AS agent_name FROM crm_leads l LEFT JOIN crm_users u ON u.id = l.assigned_to`;

export function getLead(id: number) {
  return q1<Lead>(`${LEAD_SELECT} WHERE l.id = $1`, [id]);
}

export function logActivity(leadId: number, type: string, body: string, userId: number | null = null) {
  return q("INSERT INTO crm_activities (lead_id, user_id, type, body) VALUES ($1,$2,$3,$4)", [leadId, userId, type, body]);
}

export type LeadInput = {
  name: string;
  business?: string;
  email?: string;
  phone?: string;
  service?: string;
  source?: string;
  value?: number;
  tags?: string[];
  notes?: string;
  assigned_to?: number | null;
  stage?: StageId;
};

/**
 * Creates a lead, or — if someone with the same email/phone already exists —
 * attaches the new enquiry to that lead instead of duplicating it.
 * Returns the lead id and whether it was new.
 */
export async function createOrMergeLead(input: LeadInput, opts: { userId?: number | null; message?: string } = {}) {
  const email = (input.email ?? "").trim().toLowerCase();
  const phone = (input.phone ?? "").replace(/[^\d+]/g, "");
  const existing =
    email || phone
      ? await q1<{ id: number }>(
          `SELECT id FROM crm_leads WHERE ($1 <> '' AND lower(email) = $1) OR ($2 <> '' AND phone = $2) ORDER BY id LIMIT 1`,
          [email, phone],
        )
      : undefined;

  if (existing) {
    await q(
      `UPDATE crm_leads SET
         business = CASE WHEN business = '' THEN $2 ELSE business END,
         email = CASE WHEN email = '' THEN $3 ELSE email END,
         phone = CASE WHEN phone = '' THEN $4 ELSE phone END,
         service = CASE WHEN $5 <> '' THEN $5 ELSE service END,
         updated_at = now()
       WHERE id = $1`,
      [existing.id, input.business ?? "", email, phone, input.service ?? ""],
    );
    await logActivity(existing.id, "enquiry", `Enquired again${input.service ? ` about ${input.service}` : ""}${opts.message ? `:\n${opts.message}` : ""}`, opts.userId);
    return { id: existing.id, created: false };
  }

  const stage = input.stage && STAGE_IDS.includes(input.stage) ? input.stage : "new";
  const row = await q1<{ id: number }>(
    `INSERT INTO crm_leads (name, business, email, phone, service, source, stage, value, tags, notes, assigned_to)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
    [
      input.name.trim(),
      (input.business ?? "").trim(),
      email,
      phone,
      (input.service ?? "").trim(),
      input.source || "manual",
      stage,
      Math.max(0, Math.round(input.value ?? 0)),
      input.tags ?? [],
      (input.notes ?? "").trim(),
      input.assigned_to ?? null,
    ],
  );
  const id = row!.id;
  await logActivity(id, "created", `Lead created from ${input.source || "manual entry"}${opts.message ? `:\n${opts.message}` : ""}`, opts.userId);
  await enrollForTrigger(id, input.source === "manual" || !input.source ? ["new_lead", "manual"] : ["new_lead"]);
  return { id, created: true };
}

/** Puts the lead into every active sequence whose trigger matches. */
export async function enrollForTrigger(leadId: number, triggers: string[]) {
  const seqs = await q<{ id: number; name: string }>(
    "SELECT id, name FROM crm_sequences WHERE active AND trigger = ANY($1) AND jsonb_array_length(steps) > 0",
    [triggers],
  );
  for (const s of seqs) await enroll(leadId, s.id);
}

export async function enroll(leadId: number, sequenceId: number, userId: number | null = null) {
  const seq = await q1<{ name: string; steps: SequenceStep[] }>("SELECT name, steps FROM crm_sequences WHERE id = $1", [sequenceId]);
  if (!seq || seq.steps.length === 0) return;
  const firstDay = Number(seq.steps[0].day) || 0;
  // Re-enrolling restarts the sequence from step 1.
  await q(
    `INSERT INTO crm_enrollments (lead_id, sequence_id, step_index, status, enrolled_at, next_run_at, stopped_reason)
     VALUES ($1, $2, 0, 'active', now(), now() + make_interval(days => $3), '')
     ON CONFLICT (lead_id, sequence_id) DO UPDATE SET step_index = 0, status = 'active', enrolled_at = now(),
       next_run_at = now() + make_interval(days => $3), stopped_reason = ''`,
    [leadId, sequenceId, firstDay],
  );
  await logActivity(leadId, "automation", `Started follow-up sequence “${seq.name}”`, userId);
}

export async function stopEnrollments(leadId: number, reason: string, userId: number | null = null, sequenceId?: number) {
  const stopped = await q<{ name: string }>(
    `UPDATE crm_enrollments e SET status = 'stopped', stopped_reason = $2, next_run_at = NULL
     FROM crm_sequences s
     WHERE s.id = e.sequence_id AND e.lead_id = $1 AND e.status = 'active' AND ($3::int IS NULL OR e.sequence_id = $3)
     RETURNING s.name`,
    [leadId, reason, sequenceId ?? null],
  );
  if (stopped.length) {
    await logActivity(leadId, "automation", `Stopped ${stopped.map((s) => `“${s.name}”`).join(", ")} — ${reason}`, userId);
  }
}

/**
 * Moving a lead forward past "Contacted" means a human has taken over, so any
 * running nurture stops; then sequences tied to the new stage start.
 */
export async function changeStage(leadId: number, stage: StageId, userId: number | null) {
  const lead = await q1<{ stage: StageId }>("SELECT stage FROM crm_leads WHERE id = $1", [leadId]);
  if (!lead || lead.stage === stage) return;
  await q("UPDATE crm_leads SET stage = $2, stage_changed_at = now(), updated_at = now() WHERE id = $1", [leadId, stage]);
  await logActivity(leadId, "stage", `${stageOf(lead.stage).label} → ${stageOf(stage).label}`, userId);
  if (stage !== "new" && stage !== "contacted") await stopEnrollments(leadId, `moved to ${stageOf(stage).label}`, userId);
  await enrollForTrigger(leadId, [`stage:${stage}`]);
}

type Delivery = { status: "sent" | "queued" | "failed" | "skipped"; error: string; to: string };

/** Delivers one rendered message, falling back to the manual outbox when a channel isn't connected. */
export async function deliver(lead: Lead, channel: string, subject: string, body: string): Promise<Delivery> {
  const ch = channelStatus();
  if (channel === "email") {
    if (!lead.email) return { status: "skipped", error: "Lead has no email address", to: "" };
    if (!ch.email) return { status: "queued", error: "", to: lead.email };
    try {
      await sendEmail(lead.email, subject, body);
      return { status: "sent", error: "", to: lead.email };
    } catch (e) {
      return { status: "failed", error: (e as Error).message, to: lead.email };
    }
  }
  if (!lead.phone) return { status: "skipped", error: "Lead has no phone number", to: "" };
  if (!ch.whatsappApi) return { status: "queued", error: "", to: lead.phone };
  try {
    await sendWhatsAppApi(lead.phone, body);
    return { status: "sent", error: "", to: lead.phone };
  } catch (e) {
    // Outside Meta's 24h window free text is rejected — hand it to a human.
    return { status: "queued", error: (e as Error).message, to: lead.phone };
  }
}

export async function recordMessage(
  lead: Lead,
  channel: string,
  subject: string,
  body: string,
  d: Delivery,
  enrollmentId: number | null,
) {
  await q(
    `INSERT INTO crm_messages (lead_id, enrollment_id, channel, to_addr, subject, body, status, error, sent_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8, CASE WHEN $7 = 'sent' THEN now() END)`,
    [lead.id, enrollmentId, channel, d.to, subject, body, d.status, d.error],
  );
}

const STATUS_WORDS = { sent: "sent", queued: "ready in Outbox to send", failed: "failed", skipped: "skipped" } as const;

/**
 * Runs every follow-up step that is due. Called by the daily cron, whenever a
 * team member opens the CRM, and right after a new lead arrives — so day-0
 * replies go out instantly without needing a frequent cron.
 */
export async function runDueFollowups(opts: { leadId?: number; limit?: number } = {}) {
  let processed = 0;
  // Several steps can be due at once (e.g. two "day 0" steps), so loop.
  for (let pass = 0; pass < 10; pass++) {
    const claimed = await q<{ id: number; lead_id: number; sequence_id: number; step_index: number; enrolled_at: Date }>(
      `UPDATE crm_enrollments SET next_run_at = now() + interval '10 minutes'
       WHERE id IN (
         SELECT id FROM crm_enrollments
         WHERE status = 'active' AND next_run_at <= now() AND ($1::int IS NULL OR lead_id = $1)
         ORDER BY next_run_at LIMIT $2 FOR UPDATE SKIP LOCKED
       ) RETURNING id, lead_id, sequence_id, step_index, enrolled_at`,
      [opts.leadId ?? null, opts.limit ?? 40],
    );
    if (claimed.length === 0) break;

    for (const e of claimed) {
      const [lead, seq] = await Promise.all([
        getLead(e.lead_id),
        q1<{ name: string; active: boolean; trigger: string; steps: SequenceStep[] }>("SELECT name, active, trigger, steps FROM crm_sequences WHERE id = $1", [e.sequence_id]),
      ]);
      const step = seq?.steps[e.step_index];
      if (!lead || !seq || !seq.active || !step) {
        await q("UPDATE crm_enrollments SET status = $2, next_run_at = NULL WHERE id = $1", [
          e.id,
          seq && !seq.active ? "paused" : "completed",
        ]);
        continue;
      }
      // Closed leads only keep getting their own onboarding / win-back sequence.
      if ((lead.stage === "won" || lead.stage === "lost") && seq.trigger !== `stage:${lead.stage}`) {
        await stopEnrollments(lead.id, `lead is ${stageOf(lead.stage).label}`, null, e.sequence_id);
        continue;
      }

      const tpl = await q1<{ name: string; subject: string; body: string }>("SELECT name, subject, body FROM crm_templates WHERE id = $1", [step.templateId]);
      if (tpl) {
        const subject = renderTemplate(tpl.subject, lead);
        const body = renderTemplate(tpl.body, lead);
        const d = await deliver(lead, step.channel, subject, body);
        await recordMessage(lead, step.channel, subject, body, d, e.id);
        await logActivity(
          lead.id,
          "followup",
          `${seq.name} · step ${e.step_index + 1}: ${step.channel === "email" ? "Email" : "WhatsApp"} “${tpl.name}” ${STATUS_WORDS[d.status]}${d.error ? ` (${d.error})` : ""}`,
        );
      }

      const next = seq.steps[e.step_index + 1];
      if (next) {
        await q(
          `UPDATE crm_enrollments SET step_index = $2, next_run_at = GREATEST(now(), enrolled_at + make_interval(days => $3)) WHERE id = $1`,
          [e.id, e.step_index + 1, Number(next.day) || 0],
        );
      } else {
        await q("UPDATE crm_enrollments SET step_index = $2, status = 'completed', next_run_at = NULL WHERE id = $1", [e.id, e.step_index + 1]);
      }
      processed++;
    }
  }
  return processed;
}
