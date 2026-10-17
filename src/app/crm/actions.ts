"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { changePassword, hashPassword, login, logout, makeResetToken, requireUser, resetPasswordWithToken } from "@/lib/crm/auth";
import { q, q1 } from "@/lib/crm/db";
import { leadWhere, type LeadFilter } from "@/lib/crm/leadQuery";
import { channelStatus, renderTemplate, sendEmail } from "@/lib/crm/messaging";
import { PUBLIC_SITE_URL } from "@/lib/crm/config";
import { CHANNELS, STAGE_IDS, TRIGGERS, type SequenceStep, type StageId } from "@/lib/crm/config";
import {
  changeStage,
  createOrMergeLead,
  deliver,
  enroll,
  getLead,
  importLeads,
  LEAD_SELECT,
  logActivity,
  type Lead,
  recordMessage,
  runDueFollowups,
  runScheduledEmails,
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

type PwState = { error: string; ok?: string } | null;

function checkNewPassword(fd: FormData): { error: string } | { next: string } {
  const next = String(fd.get("new_password") ?? "");
  if (next.length < 8) return { error: "New password must be at least 8 characters." };
  if (next !== String(fd.get("confirm_password") ?? "")) return { error: "The two new passwords don't match." };
  return { next };
}

export async function changePasswordAction(_prev: PwState, fd: FormData): Promise<PwState> {
  const user = await requireUser();
  const check = checkNewPassword(fd);
  if ("error" in check) return { error: check.error };
  const current = String(fd.get("current_password") ?? "");
  if (current === check.next) return { error: "Pick a password different from the current one." };
  if (!(await changePassword(user.id, current, check.next))) return { error: "Current password is wrong." };
  return { error: "", ok: "Password changed. Use the new one next time you sign in." };
}

/** Emails a 30-minute reset link. Same reply whether or not the email exists. */
export async function requestPasswordResetAction(_prev: PwState, fd: FormData): Promise<PwState> {
  const email = str(fd, "email").toLowerCase();
  if (!email.includes("@")) return { error: "Enter your CRM email address." };
  if (!channelStatus().email) return { error: "Email isn't set up for the CRM, so a reset link can't be sent. Ask the owner to set a new password." };
  const r = await makeResetToken(email);
  if (r) {
    const link = `${PUBLIC_SITE_URL}/crm/reset?token=${encodeURIComponent(r.token)}`;
    await sendEmail(
      r.user.email,
      "Reset your WEBORA CRM password",
      `Hi ${r.user.name},\n\nSomeone (hopefully you) asked to reset the password for the WEBORA CRM.\n\nSet a new password here (link works for ${r.minutes} minutes, once):\n${link}\n\nIf you didn't ask for this, just ignore this email — your password stays the same.\n\n— WEBORA CRM`,
    ).catch((e) => console.error("reset email failed", e));
  }
  return { error: "", ok: `If ${email} has a CRM account, a reset link is on its way. Check the inbox (and spam).` };
}

export async function resetPasswordAction(_prev: PwState, fd: FormData): Promise<PwState> {
  const check = checkNewPassword(fd);
  if ("error" in check) return { error: check.error };
  if (!(await resetPasswordWithToken(String(fd.get("token") ?? ""), check.next))) {
    return { error: "This reset link has expired or was already used. Request a new one from the sign-in page." };
  }
  return { error: "", ok: "Password updated — you can sign in now." };
}

export async function setMemberPasswordAction(id: number, password: string) {
  const user = await requireUser();
  if (user.role !== "owner") return { error: "Only the owner can do this." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  await q("UPDATE crm_users SET password_hash = $2 WHERE id = $1 AND role <> 'owner'", [id, await hashPassword(password)]);
  return { error: "" };
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
      domain: str(fd, "domain"),
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
  await rememberDomains([str(fd, "domain")]);
  await runDueFollowups({ leadId: id });
  refresh(id);
  redirect(str(fd, "then") === "another" ? `/crm/leads/new?added=${id}` : `/crm/leads/${id}`);
}

export async function updateLeadAction(id: number, fd: FormData) {
  const user = await requireUser();
  const followup = str(fd, "next_followup_at");
  await q(
    `UPDATE crm_leads SET name=$2, business=$3, email=$4, phone=$5, service=$6, source=$7, value=$8, tags=$9,
       notes=$10, assigned_to=$11, next_followup_at=$12, lost_reason=$13, domain=$14, updated_at=now() WHERE id=$1`,
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
      str(fd, "domain"),
    ],
  );
  await rememberDomains([str(fd, "domain")]);
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

export async function deleteLeadsAction(input: { ids: number[] | null; filter: LeadFilter | null }) {
  await requireUser();
  let rows: { id: number }[];
  if (input.filter) {
    const w = leadWhere(input.filter);
    rows = await q<{ id: number }>(`DELETE FROM crm_leads WHERE id IN (SELECT l.id FROM crm_leads l ${w.sql}) RETURNING id`, w.params);
  } else {
    const ids = (input.ids ?? []).map(Number).filter(Boolean);
    if (!ids.length) return { deleted: 0 };
    rows = await q<{ id: number }>("DELETE FROM crm_leads WHERE id = ANY($1::int[]) RETURNING id", [ids]);
  }
  refresh();
  return { deleted: rows.length };
}

/* ---------- domains ---------- */

const cleanDomain = (s: string) => s.trim().replace(/\s+/g, " ").slice(0, 60);

/** Saves domain names so they stay listed even when no lead uses them any more. */
async function rememberDomains(names: string[]) {
  const list = [...new Set(names.map(cleanDomain).filter(Boolean))];
  if (list.length) await q("INSERT INTO crm_domains (name) SELECT unnest($1::text[]) ON CONFLICT DO NOTHING", [list]);
}

export async function createDomainAction(name: string) {
  await requireUser();
  const d = cleanDomain(name);
  if (!d) return { error: "Type a domain name." };
  const taken = await q("SELECT 1 FROM crm_domains WHERE lower(name) = lower($1) UNION ALL SELECT 1 FROM crm_leads WHERE lower(trim(domain)) = lower($1) LIMIT 1", [d]);
  if (taken.length) return { error: `“${d}” already exists.` };
  await q("INSERT INTO crm_domains (name) VALUES ($1) ON CONFLICT DO NOTHING", [d]);
  refresh();
  return { error: "" };
}

/** Renames a domain on every lead in it. Renaming onto an existing domain merges the two. */
export async function renameDomainAction(from: string, to: string) {
  await requireUser();
  const d = cleanDomain(to);
  if (!d) return { error: "Type the new name.", updated: 0 };
  const moved = await q("UPDATE crm_leads SET domain = $2, updated_at = now() WHERE lower(trim(domain)) = lower(trim($1)) RETURNING id", [from, d]);
  await q("DELETE FROM crm_domains WHERE lower(name) = lower(trim($1))", [from]);
  await q("INSERT INTO crm_domains (name) VALUES ($1) ON CONFLICT DO NOTHING", [d]);
  refresh();
  return { error: "", updated: moved.length };
}

/** Removes a domain; its leads stay, with no domain set. */
export async function deleteDomainAction(name: string) {
  await requireUser();
  const cleared = await q("UPDATE crm_leads SET domain = '', updated_at = now() WHERE lower(trim(domain)) = lower(trim($1)) RETURNING id", [name]);
  await q("DELETE FROM crm_domains WHERE lower(name) = lower(trim($1))", [name]);
  refresh();
  return { cleared: cleared.length };
}

export async function setDomainAction(input: { ids: number[] | null; filter: LeadFilter | null }, domain: string) {
  await requireUser();
  const d = cleanDomain(domain);
  await rememberDomains([d]);
  let n: number;
  if (input.filter) {
    const w = leadWhere(input.filter);
    w.params.push(d);
    n = (await q(`UPDATE crm_leads SET domain = $${w.params.length}, updated_at = now() WHERE id IN (SELECT l.id FROM crm_leads l ${w.sql}) RETURNING id`, w.params)).length;
  } else {
    const ids = (input.ids ?? []).map(Number).filter(Boolean);
    n = ids.length ? (await q("UPDATE crm_leads SET domain = $2, updated_at = now() WHERE id = ANY($1::int[]) RETURNING id", [ids, d])).length : 0;
  }
  refresh();
  return { updated: n };
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

/**
 * One batch of a CSV import. The browser sends the file in small batches and
 * refreshes once at the end, so large files never hit a request timeout.
 */
export async function importLeadsAction(rows: Record<string, string>[], startFollowups = true) {
  const user = await requireUser();
  await rememberDomains(rows.slice(0, 200).map((r) => r.domain ?? ""));
  return importLeads(
    rows.slice(0, 200).map((r) => ({
      name: r.name ?? "",
      business: r.business ?? "",
      domain: r.domain ?? "",
      email: r.email ?? "",
      phone: r.phone ?? "",
      service: r.service ?? "",
      source: r.source ?? "",
      value: Number((r.value ?? "").replace(/[^\d.]/g, "")) || 0,
      tags: tags(r.tags ?? ""),
      notes: r.notes ?? "",
    })),
    { userId: user.id, startFollowups },
  );
}

export async function finishImportAction() {
  await requireUser();
  refresh();
}

/* ---------- scheduled emails ---------- */

/**
 * Schedules one email format to each selected lead for a chosen day/time. The
 * message is filled in per lead now; it goes out from the connected Gmail
 * (webora99@gmail.com) on the next automation tick after `when`.
 */
export async function scheduleEmailAction(input: { ids: number[] | null; filter: LeadFilter | null; templateId: number; when: string }) {
  const user = await requireUser();
  const tpl = await q1<{ name: string; subject: string; body: string; channel: string }>("SELECT name, subject, body, channel FROM crm_templates WHERE id = $1", [input.templateId]);
  if (!tpl || tpl.channel !== "email") return { error: "Pick an email format.", scheduled: 0, skipped: 0 };
  const when = new Date(input.when);
  if (Number.isNaN(when.getTime())) return { error: "Pick a valid day and time.", scheduled: 0, skipped: 0 };

  let leads: Lead[];
  if (input.filter) {
    const w = leadWhere(input.filter);
    leads = await q<Lead>(`${LEAD_SELECT} ${w.sql} ORDER BY l.id LIMIT 5000`, w.params);
  } else {
    const ids = (input.ids ?? []).map(Number).filter(Boolean).slice(0, 5000);
    if (!ids.length) return { error: "Select at least one lead.", scheduled: 0, skipped: 0 };
    leads = await q<Lead>(`${LEAD_SELECT} WHERE l.id = ANY($1::int[])`, [ids]);
  }
  const withEmail = leads.filter((l) => l.email.includes("@"));
  if (withEmail.length) {
    const rows = withEmail.map((l) => ({
      lead_id: l.id,
      to_addr: l.email,
      subject: renderTemplate(tpl.subject, l),
      body: renderTemplate(tpl.body, l),
    }));
    await q(
      `INSERT INTO crm_messages (lead_id, channel, to_addr, subject, body, status, scheduled_for)
       SELECT x.lead_id, 'email', x.to_addr, x.subject, x.body, 'scheduled', $2
       FROM jsonb_to_recordset($1::jsonb) AS x(lead_id int, to_addr text, subject text, body text)`,
      [JSON.stringify(rows), when],
    );
    const label = when.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
    await q("INSERT INTO crm_activities (lead_id, user_id, type, body) SELECT unnest($1::int[]), $2, 'email', $3", [
      withEmail.map((l) => l.id),
      user.id,
      `Email “${tpl.name}” scheduled for ${label}`,
    ]);
  }
  // Anything due right now goes out straight after this response.
  if (when.getTime() <= Date.now() + 60_000) after(() => runScheduledEmails({ deadline: Date.now() + 25_000 }).catch(() => {}));
  refresh();
  return { error: "", scheduled: withEmail.length, skipped: leads.length - withEmail.length, emailReady: channelStatus().email };
}

export async function cancelScheduledAction(ids: number[]) {
  await requireUser();
  await q("UPDATE crm_messages SET status = 'skipped', error = 'cancelled' WHERE id = ANY($1::int[]) AND status = 'scheduled'", [ids]);
  refresh();
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
  const deadline = Date.now() + 20_000;
  await runScheduledEmails({ deadline });
  await runDueFollowups({ deadline });
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

/** Deletes several formats at once; ones still used by a sequence are kept and named. */
export async function deleteTemplatesAction(ids: number[]) {
  await requireUser();
  const clean = ids.map(Number).filter(Boolean);
  if (!clean.length) return { deleted: 0, kept: [] as string[] };
  const used = await q<{ id: number; name: string }>(
    `SELECT t.id, t.name FROM crm_templates t WHERE t.id = ANY($1::int[]) AND EXISTS (
       SELECT 1 FROM crm_sequences s, jsonb_array_elements(s.steps) st WHERE (st->>'templateId')::int = t.id)`,
    [clean],
  );
  const keep = new Set(used.map((u) => u.id));
  const del = clean.filter((id) => !keep.has(id));
  if (del.length) await q("DELETE FROM crm_templates WHERE id = ANY($1::int[])", [del]);
  refresh();
  return { deleted: del.length, kept: used.map((u) => u.name) };
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
  if (!name) return { error: "Name can't be empty." };
  await q("UPDATE crm_users SET name = $2 WHERE id = $1", [user.id, name]);
  refresh();
  return { error: "", ok: "Saved." };
}

export async function removeUserAction(id: number) {
  const user = await requireUser();
  if (user.role !== "owner" || id === user.id) return;
  await q("DELETE FROM crm_users WHERE id = $1 AND role <> 'owner'", [id]);
  refresh();
}
