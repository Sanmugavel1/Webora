"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hashPassword, login, logout, requireUser } from "@/lib/crm/auth";
import { q, q1 } from "@/lib/crm/db";
import { CHANNELS, STAGE_IDS, TRIGGERS, type SequenceStep, type StageId } from "@/lib/crm/config";
import {
  changeStage,
  createOrMergeLead,
  deliver,
  enroll,
  getLead,
  logActivity,
  recordMessage,
  runDueFollowups,
  stopEnrollments,
} from "@/lib/crm/engine";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string) => Number(String(fd.get(k) ?? "").replace(/[^\d.]/g, "")) || 0;
const tags = (raw: string) =>
  [...new Set(raw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 12);

function refresh(leadId?: number) {
  revalidatePath("/crm", "layout");
  if (leadId) revalidatePath(`/crm/leads/${leadId}`);
}

/* ---------- auth ---------- */

export async function loginAction(_prev: { error: string; email: string } | null, fd: FormData) {
  const ok = await login(str(fd, "email"), String(fd.get("password") ?? ""));
  if (!ok) return { error: "Wrong email or password.", email: str(fd, "email") };
  redirect("/crm");
}

export async function logoutAction() {
  await logout();
  redirect("/crm/login");
}

/* ---------- leads ---------- */

export async function createLeadAction(fd: FormData) {
  const user = await requireUser();
  const name = str(fd, "name");
  if (!name) throw new Error("Name is required");
  const { id } = await createOrMergeLead(
    {
      name,
      business: str(fd, "business"),
      email: str(fd, "email"),
      phone: str(fd, "phone"),
      service: str(fd, "service"),
      source: str(fd, "source") || "manual",
      value: num(fd, "value"),
      tags: tags(str(fd, "tags")),
      notes: str(fd, "notes"),
      assigned_to: Number(fd.get("assigned_to")) || user.id,
    },
    { userId: user.id },
  );
  await runDueFollowups({ leadId: id });
  refresh(id);
  redirect(`/crm/leads/${id}`);
}

export async function updateLeadAction(id: number, fd: FormData) {
  const user = await requireUser();
  const followup = str(fd, "next_followup_at");
  await q(
    `UPDATE crm_leads SET name=$2, business=$3, email=$4, phone=$5, service=$6, source=$7, value=$8, tags=$9,
       notes=$10, assigned_to=$11, next_followup_at=$12, lost_reason=$13, updated_at=now() WHERE id=$1`,
    [
      id,
      str(fd, "name"),
      str(fd, "business"),
      str(fd, "email").toLowerCase(),
      str(fd, "phone").replace(/[^\d+]/g, ""),
      str(fd, "service"),
      str(fd, "source"),
      Math.round(num(fd, "value")),
      tags(str(fd, "tags")),
      str(fd, "notes"),
      Number(fd.get("assigned_to")) || null,
      followup ? new Date(`${followup}:00+05:30`) : null,
      str(fd, "lost_reason"),
    ],
  );
  const stage = str(fd, "stage") as StageId;
  if (STAGE_IDS.includes(stage)) await changeStage(id, stage, user.id);
  refresh(id);
}

export async function deleteLeadAction(id: number) {
  await requireUser();
  await q("DELETE FROM crm_leads WHERE id = $1", [id]);
  refresh();
  redirect("/crm/leads");
}

export async function moveStageAction(id: number, stage: StageId) {
  const user = await requireUser();
  if (!STAGE_IDS.includes(stage)) return;
  await changeStage(id, stage, user.id);
  await runDueFollowups({ leadId: id });
  refresh(id);
}

export async function addActivityAction(id: number, fd: FormData) {
  const user = await requireUser();
  const body = str(fd, "body");
  const type = ["note", "call", "meeting"].includes(str(fd, "type")) ? str(fd, "type") : "note";
  if (!body) return;
  await logActivity(id, type, body, user.id);
  await q("UPDATE crm_leads SET updated_at = now() WHERE id = $1", [id]);
  refresh(id);
}

export async function markRepliedAction(id: number) {
  const user = await requireUser();
  await logActivity(id, "reply", "Lead replied — automated follow-ups paused", user.id);
  await stopEnrollments(id, "lead replied", user.id);
  const lead = await getLead(id);
  if (lead?.stage === "new") await changeStage(id, "contacted", user.id);
  refresh(id);
}

export async function setFollowupAction(id: number, when: string | null) {
  await requireUser();
  await q("UPDATE crm_leads SET next_followup_at = $2, updated_at = now() WHERE id = $1", [
    id,
    when ? new Date(when) : null,
  ]);
  refresh(id);
}

/**
 * One-off message from the lead page. Email goes out over SMTP when it's
 * connected; WhatsApp is opened on the agent's phone by the client and we just
 * record that it was sent.
 */
export async function sendMessageAction(input: { leadId: number; channel: string; subject: string; body: string; manual: boolean }) {
  const user = await requireUser();
  const lead = await getLead(input.leadId);
  if (!lead || !input.body.trim()) return { status: "failed" as const, error: "Nothing to send" };
  const d = input.manual
    ? { status: "sent" as const, error: "", to: input.channel === "email" ? lead.email : lead.phone }
    : await deliver(lead, input.channel, input.subject, input.body);
  await recordMessage(lead, input.channel, input.subject, input.body, d, null);
  await logActivity(
    lead.id,
    input.channel === "email" ? "email" : "whatsapp",
    `${input.channel === "email" ? `Email “${input.subject}”` : "WhatsApp message"} ${d.status === "sent" ? "sent" : d.status}${d.error ? ` (${d.error})` : ""}:\n${input.body}`,
    user.id,
  );
  if (lead.stage === "new" && d.status === "sent") await changeStage(lead.id, "contacted", user.id);
  refresh(lead.id);
  return { status: d.status, error: d.error };
}

export async function enrollAction(leadId: number, sequenceId: number) {
  const user = await requireUser();
  await enroll(leadId, sequenceId, user.id);
  await runDueFollowups({ leadId });
  refresh(leadId);
}

export async function stopSequenceAction(leadId: number, sequenceId: number) {
  const user = await requireUser();
  await stopEnrollments(leadId, "stopped manually", user.id, sequenceId);
  refresh(leadId);
}

export async function importLeadsAction(rows: Record<string, string>[]) {
  const user = await requireUser();
  let created = 0;
  let merged = 0;
  for (const r of rows.slice(0, 1000)) {
    const name = (r.name ?? "").trim();
    if (!name) continue;
    const res = await createOrMergeLead(
      {
        name,
        business: r.business,
        email: r.email,
        phone: r.phone,
        service: r.service,
        source: r.source || "manual",
        value: Number((r.value ?? "").replace(/[^\d.]/g, "")) || 0,
        tags: tags(r.tags ?? ""),
        notes: r.notes,
        assigned_to: user.id,
      },
      { userId: user.id },
    );
    if (res.created) created++;
    else merged++;
  }
  refresh();
  return { created, merged };
}

/* ---------- tasks ---------- */

export async function addTaskAction(fd: FormData) {
  const user = await requireUser();
  const title = str(fd, "title");
  const due = str(fd, "due_at");
  const leadId = Number(fd.get("lead_id")) || null;
  if (!title) return;
  await q("INSERT INTO crm_tasks (lead_id, user_id, title, due_at) VALUES ($1,$2,$3,$4)", [
    leadId,
    user.id,
    title,
    due ? new Date(`${due}:00+05:30`) : null,
  ]);
  refresh(leadId ?? undefined);
}

export async function toggleTaskAction(id: number, done: boolean) {
  await requireUser();
  const t = await q1<{ lead_id: number | null }>("UPDATE crm_tasks SET done = $2 WHERE id = $1 RETURNING lead_id", [id, done]);
  refresh(t?.lead_id ?? undefined);
}

/* ---------- outbox ---------- */

export async function markMessageSentAction(id: number) {
  const user = await requireUser();
  const m = await q1<{ lead_id: number; channel: string }>(
    "UPDATE crm_messages SET status = 'sent', sent_at = now() WHERE id = $1 RETURNING lead_id, channel",
    [id],
  );
  if (m) {
    await logActivity(m.lead_id, m.channel, `Follow-up ${m.channel === "email" ? "email" : "WhatsApp"} sent from Outbox`, user.id);
    const lead = await getLead(m.lead_id);
    if (lead?.stage === "new") await changeStage(m.lead_id, "contacted", user.id);
  }
  refresh(m?.lead_id);
}

export async function dismissMessageAction(id: number) {
  await requireUser();
  await q("UPDATE crm_messages SET status = 'skipped', error = 'dismissed' WHERE id = $1", [id]);
  refresh();
}

export async function runAutomationNowAction() {
  await requireUser();
  await runDueFollowups();
  refresh();
}

/* ---------- templates ---------- */

export async function saveTemplateAction(fd: FormData) {
  await requireUser();
  const id = Number(fd.get("id")) || null;
  const channel = CHANNELS.some((c) => c.id === str(fd, "channel")) ? str(fd, "channel") : "whatsapp";
  const name = str(fd, "name");
  const body = String(fd.get("body") ?? "").trim();
  if (!name || !body) throw new Error("Name and message are required");
  if (id) {
    await q("UPDATE crm_templates SET name=$2, channel=$3, subject=$4, body=$5, updated_at=now() WHERE id=$1", [
      id,
      name,
      channel,
      str(fd, "subject"),
      body,
    ]);
  } else {
    await q("INSERT INTO crm_templates (name, channel, subject, body) VALUES ($1,$2,$3,$4)", [name, channel, str(fd, "subject"), body]);
  }
  refresh();
  redirect("/crm/templates");
}

export async function deleteTemplateAction(id: number) {
  await requireUser();
  const used = await q1<{ name: string }>(
    "SELECT name FROM crm_sequences WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(steps) s WHERE (s->>'templateId')::int = $1) LIMIT 1",
    [id],
  );
  if (used) return { error: `Used by the “${used.name}” sequence — remove it there first.` };
  await q("DELETE FROM crm_templates WHERE id = $1", [id]);
  refresh();
  return { error: "" };
}

/* ---------- sequences ---------- */

export async function saveSequenceAction(input: {
  id: number | null;
  name: string;
  description: string;
  trigger: string;
  active: boolean;
  steps: SequenceStep[];
}) {
  await requireUser();
  const name = input.name.trim();
  if (!name) return { error: "Give the sequence a name." };
  if (!TRIGGERS.some((t) => t.id === input.trigger)) return { error: "Pick when it should start." };
  const steps = input.steps
    .filter((s) => s.templateId && CHANNELS.some((c) => c.id === s.channel))
    .map((s) => ({ day: Math.max(0, Math.min(365, Math.round(Number(s.day) || 0))), channel: s.channel, templateId: Number(s.templateId) }))
    .sort((a, b) => a.day - b.day);
  if (steps.length === 0) return { error: "Add at least one step." };
  if (input.id) {
    await q("UPDATE crm_sequences SET name=$2, description=$3, trigger=$4, active=$5, steps=$6, updated_at=now() WHERE id=$1", [
      input.id,
      name,
      input.description.trim(),
      input.trigger,
      input.active,
      JSON.stringify(steps),
    ]);
  } else {
    await q("INSERT INTO crm_sequences (name, description, trigger, active, steps) VALUES ($1,$2,$3,$4,$5)", [
      name,
      input.description.trim(),
      input.trigger,
      input.active,
      JSON.stringify(steps),
    ]);
  }
  refresh();
  return { error: "" };
}

export async function toggleSequenceAction(id: number, active: boolean) {
  await requireUser();
  await q("UPDATE crm_sequences SET active = $2, updated_at = now() WHERE id = $1", [id, active]);
  // Resuming re-activates enrollments that were paused while it was off.
  if (active) await q("UPDATE crm_enrollments SET status = 'active', next_run_at = now() WHERE sequence_id = $1 AND status = 'paused'", [id]);
  refresh();
}

export async function deleteSequenceAction(id: number) {
  await requireUser();
  await q("DELETE FROM crm_sequences WHERE id = $1", [id]);
  refresh();
}

/* ---------- team ---------- */

export async function addUserAction(_prev: { error: string; ok?: string } | null, fd: FormData) {
  const user = await requireUser();
  if (user.role !== "owner") return { error: "Only the owner can add team members." };
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!str(fd, "name") || !email.includes("@")) return { error: "Name and a valid email are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  const exists = await q1("SELECT 1 FROM crm_users WHERE email = $1", [email]);
  if (exists) return { error: "That email already has an account." };
  await q("INSERT INTO crm_users (name, email, password_hash, role) VALUES ($1,$2,$3,'member')", [
    str(fd, "name"),
    email,
    await hashPassword(password),
  ]);
  refresh();
  return { error: "", ok: `Added ${str(fd, "name")}.` };
}

export async function updateProfileAction(_prev: { error: string; ok?: string } | null, fd: FormData) {
  const user = await requireUser();
  const name = str(fd, "name");
  const password = String(fd.get("password") ?? "");
  if (password && password.length < 8) return { error: "New password must be at least 8 characters." };
  if (name) await q("UPDATE crm_users SET name = $2 WHERE id = $1", [user.id, name]);
  if (password) await q("UPDATE crm_users SET password_hash = $2 WHERE id = $1", [user.id, await hashPassword(password)]);
  refresh();
  return { error: "", ok: password ? "Saved — password changed." : "Saved." };
}

export async function removeUserAction(id: number) {
  const user = await requireUser();
  if (user.role !== "owner" || id === user.id) return;
  await q("DELETE FROM crm_users WHERE id = $1 AND role <> 'owner'", [id]);
  refresh();
}
