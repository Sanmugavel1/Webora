import Link from "next/link";
import { requireUser } from "@/lib/crm/auth";
import { q } from "@/lib/crm/db";
import { triggerLabel, type SequenceStep } from "@/lib/crm/config";
import { channelStatus } from "@/lib/crm/messaging";
import { ChannelBadge, Empty, PageTitle } from "@/components/crm/ui";
import { SequenceToggle } from "@/components/crm/SequenceToggle";

export const metadata = { title: "Follow-ups" };

export default async function FollowupsPage() {
  await requireUser();
  const [seqs, templates] = await Promise.all([
    q<{ id: number; name: string; description: string; trigger: string; active: boolean; steps: SequenceStep[]; running: number; done: number; stopped: number }>(`
      SELECT s.*, count(e.id) FILTER (WHERE e.status = 'active')::int AS running,
        count(e.id) FILTER (WHERE e.status = 'completed')::int AS done,
        count(e.id) FILTER (WHERE e.status = 'stopped')::int AS stopped
      FROM crm_sequences s LEFT JOIN crm_enrollments e ON e.sequence_id = s.id GROUP BY s.id ORDER BY s.id`),
    q<{ id: number; name: string }>("SELECT id, name FROM crm_templates"),
  ]);
  const tplName = (id: number) => templates.find((t) => t.id === id)?.name ?? "(deleted format)";
  const ch = channelStatus();

  return (
    <>
      <PageTitle
        title="Automated follow-ups"
        sub="Set the format once — every matching lead gets each message on schedule until they reply or the deal closes."
        actions={<Link href="/crm/followups/new" className="crm-btn crm-btn-primary">+ New sequence</Link>}
      />
      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-[var(--crm-line)] px-3 py-1">Email: {ch.email ? <b className="text-[#5ee39a]">sends automatically</b> : <span className="text-amber-300">goes to Outbox (connect Gmail)</span>}</span>
        <span className="rounded-full border border-[var(--crm-line)] px-3 py-1">WhatsApp: {ch.whatsappApi ? <b className="text-[#5ee39a]">Cloud API connected</b> : <span>one-tap send from Outbox</span>}</span>
        <Link href="/crm/settings" className="rounded-full px-3 py-1 text-blue-soft hover:underline">Connect channels →</Link>
      </div>

      {seqs.length === 0 ? <Empty href="/crm/followups/new" cta="Create a sequence">No sequences yet.</Empty> : (
        <div className="grid gap-4 md:grid-cols-2">
          {seqs.map((s) => (
            <section key={s.id} className={`crm-card p-5 ${s.active ? "" : "opacity-60"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/crm/followups/${s.id}`} className="font-display text-lg font-semibold hover:underline">{s.name}</Link>
                  <p className="text-xs text-[var(--crm-ink-3)]">{triggerLabel(s.trigger)} · {s.active ? "Active" : "Paused"}</p>
                </div>
                <SequenceToggle id={s.id} active={s.active} />
              </div>
              {s.description && <p className="mt-2 text-sm text-[var(--crm-ink-2)]">{s.description}</p>}
              <ol className="mt-4 space-y-1.5">
                {s.steps.map((st, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-14 shrink-0 text-xs font-semibold text-[var(--crm-ink-3)]">Day {st.day}</span>
                    <ChannelBadge channel={st.channel} />
                    <span className="truncate">{tplName(st.templateId)}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex gap-4 border-t border-[var(--crm-line)] pt-3 text-xs text-[var(--crm-ink-3)]">
                <span><b className="text-[var(--crm-ink)]">{s.running}</b> in progress</span>
                <span><b className="text-[var(--crm-ink)]">{s.done}</b> completed</span>
                <span><b className="text-[var(--crm-ink)]">{s.stopped}</b> stopped early</span>
                <Link href={`/crm/followups/${s.id}`} className="ml-auto text-blue-soft hover:underline">Edit</Link>
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
