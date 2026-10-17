import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bot, Mail, MessageCircle, MessageSquare, Phone, Sparkles, StickyNote, Users, Workflow } from "lucide-react";
import { listUsers, requireUser } from "@/lib/crm/auth";
import { q } from "@/lib/crm/db";
import { getLead } from "@/lib/crm/engine";
import { STAGES, sourceLabel, type SequenceStep } from "@/lib/crm/config";
import { channelStatus } from "@/lib/crm/messaging";
import { fmtDate, inr, timeAgo, toLocalInput } from "@/lib/crm/format";
import { Card, PageTitle, StageBadge } from "@/components/crm/ui";
import { LeadFields } from "@/components/crm/LeadFields";
import { domainNames } from "@/lib/crm/domains";
import { Composer, ConfirmSubmit, QuickActions, StageBar } from "@/components/crm/LeadControls";
import { TaskList } from "@/components/crm/TaskList";
import { addActivityAction, deleteLeadAction, enrollAction, stopSequenceAction, updateLeadAction } from "../../../actions";

const ICONS: Record<string, typeof StickyNote> = {
  note: StickyNote, call: Phone, meeting: Users, email: Mail, whatsapp: MessageCircle, followup: Bot,
  automation: Workflow, stage: Sparkles, created: Sparkles, enquiry: MessageSquare, reply: MessageSquare,
};

export async function generateMetadata({ params }: PageProps<"/crm/leads/[id]">) {
  const lead = await getLead(Number((await params).id));
  return { title: lead?.name ?? "Lead" };
}

export default async function LeadPage({ params }: PageProps<"/crm/leads/[id]">) {
  await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const lead = await getLead(id);
  if (!lead) notFound();

  const [activities, users, templates, sequences, enrollments, tasks, domains] = await Promise.all([
    q<{ id: number; type: string; body: string; created_at: Date; user_name: string | null }>(
      "SELECT a.id, a.type, a.body, a.created_at, u.name AS user_name FROM crm_activities a LEFT JOIN crm_users u ON u.id = a.user_id WHERE a.lead_id = $1 ORDER BY a.created_at DESC, a.id DESC LIMIT 200",
      [id],
    ),
    listUsers(),
    q<{ id: number; name: string; channel: string; subject: string; body: string }>("SELECT id, name, channel, subject, body FROM crm_templates ORDER BY name"),
    q<{ id: number; name: string; active: boolean }>("SELECT id, name, active FROM crm_sequences ORDER BY name"),
    q<{ sequence_id: number; name: string; status: string; step_index: number; next_run_at: Date | null; stopped_reason: string; steps: SequenceStep[] }>(
      "SELECT e.sequence_id, s.name, e.status, e.step_index, e.next_run_at, e.stopped_reason, s.steps FROM crm_enrollments e JOIN crm_sequences s ON s.id = e.sequence_id WHERE e.lead_id = $1 ORDER BY e.enrolled_at DESC",
      [id],
    ),
    q<{ id: number; title: string; due_at: Date | null; done: boolean; lead_id: number | null }>(
      "SELECT id, title, due_at, done, lead_id FROM crm_tasks WHERE lead_id = $1 ORDER BY done, due_at NULLS LAST, id",
      [id],
    ),
    domainNames(),
  ]);
  const lite = { id: lead.id, name: lead.name, business: lead.business, service: lead.service, agent_name: lead.agent_name, phone: lead.phone, email: lead.email, stage: lead.stage };
  const notEnrolled = sequences.filter((s) => s.active && !enrollments.some((e) => e.sequence_id === s.id && e.status === "active"));

  return (
    <>
      <Link href="/crm/leads" className="mb-3 inline-flex items-center gap-1.5 text-xs text-[var(--crm-ink-3)] hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> All leads</Link>
      <PageTitle
        title={lead.name}
        sub={[lead.business, lead.service, `via ${sourceLabel(lead.source)}`, `added ${fmtDate(lead.created_at)}`].filter(Boolean).join(" · ")}
        actions={<QuickActions lead={lite} />}
      />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <StageBar id={lead.id} stage={lead.stage} />
        {lead.value > 0 && <span className="text-sm tabular-nums text-[var(--crm-ink-2)]">{inr(lead.value)}</span>}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-4">
          <Card title="Send a message">
            <Composer lead={lite} templates={templates} emailReady={channelStatus().email} />
          </Card>

          <Card title="Timeline">
            <form action={addActivityAction.bind(null, lead.id)} className="mb-5 flex flex-wrap gap-2">
              <select name="type" className="crm-input w-auto" aria-label="Activity type">
                <option value="note">Note</option>
                <option value="call">Call</option>
                <option value="meeting">Meeting</option>
              </select>
              <input name="body" required placeholder="What happened? e.g. Called, wants 6 pages by Diwali" className="crm-input min-w-0 flex-1 basis-56" />
              <button className="crm-btn crm-btn-ghost">Log</button>
            </form>
            <ol className="relative space-y-4 border-l border-[var(--crm-line)] pl-5">
              {activities.map((a) => {
                const Icon = ICONS[a.type] ?? StickyNote;
                return (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[31px] top-0 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--crm-line)] bg-[var(--crm-panel-2)]">
                      <Icon className="h-3 w-3 text-[var(--crm-ink-2)]" />
                    </span>
                    <p className="whitespace-pre-wrap text-sm text-[var(--crm-ink)]">{a.body}</p>
                    <p className="mt-0.5 text-xs text-[var(--crm-ink-3)]" title={fmtDate(a.created_at, true)}>
                      {timeAgo(a.created_at)}{a.user_name ? ` · ${a.user_name}` : a.type === "followup" ? " · automation" : ""}
                    </p>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Automated follow-ups">
            {enrollments.length === 0 && <p className="mb-3 text-sm text-[var(--crm-ink-3)]">Not in any sequence.</p>}
            <ul className="mb-3 space-y-2">
              {enrollments.map((e) => (
                <li key={e.sequence_id} className="rounded-lg border border-[var(--crm-line)] p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{e.name}</span>
                    <span className={`text-xs ${e.status === "active" ? "text-[#5ee39a]" : "text-[var(--crm-ink-3)]"}`}>{e.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--crm-ink-3)]">
                    {e.status === "active"
                      ? `Step ${e.step_index + 1} of ${e.steps.length} · next ${fmtDate(e.next_run_at, true)}`
                      : e.status === "completed" ? `All ${e.steps.length} steps done` : e.stopped_reason || e.status}
                  </p>
                  {e.status === "active" && (
                    <form action={stopSequenceAction.bind(null, lead.id, e.sequence_id)} className="mt-2">
                      <button className="crm-btn crm-btn-ghost crm-btn-sm">Stop</button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
            {notEnrolled.length > 0 && (
              <form action={async (fd: FormData) => { "use server"; await enrollAction(lead.id, Number(fd.get("sequence"))); }} className="flex gap-2">
                <select name="sequence" className="crm-input min-w-0 flex-1" aria-label="Sequence">
                  {notEnrolled.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <button className="crm-btn crm-btn-ghost">Start</button>
              </form>
            )}
          </Card>

          <Card title="Tasks">
            <TaskList tasks={tasks} leadId={lead.id} />
          </Card>

          <Card title="Details">
            <form id="edit" action={updateLeadAction.bind(null, lead.id)} className="scroll-mt-24">
              <LeadFields d={lead} users={users} domains={domains} />
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label>
                  <span className="crm-label">Stage</span>
                  <select name="stage" defaultValue={lead.stage} className="crm-input">
                    {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </label>
                <label>
                  <span className="crm-label">Next follow-up (reminder)</span>
                  <input name="next_followup_at" type="datetime-local" defaultValue={toLocalInput(lead.next_followup_at)} className="crm-input" />
                </label>
                {lead.stage === "lost" && (
                  <label className="sm:col-span-2">
                    <span className="crm-label">Why lost?</span>
                    <input name="lost_reason" defaultValue={lead.lost_reason} placeholder="Budget, went with someone else, no response…" className="crm-input" />
                  </label>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="text-xs text-[var(--crm-ink-3)]">Updated {timeAgo(lead.updated_at)} · <StageBadge stage={lead.stage} /></span>
                <button className="crm-btn crm-btn-primary">Save</button>
              </div>
            </form>
          </Card>

          <form action={deleteLeadAction.bind(null, lead.id)} className="text-right">
            <ConfirmSubmit label="Delete lead" message={`Delete ${lead.name} and their whole history? This can't be undone.`} className="crm-btn crm-btn-danger crm-btn-sm" />
          </form>
        </div>
      </div>
    </>
  );
}
