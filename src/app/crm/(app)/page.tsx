import Link from "next/link";
import { ArrowRight, BellRing, CalendarClock, Send } from "lucide-react";
import { requireUser } from "@/lib/crm/auth";
import { q, q1 } from "@/lib/crm/db";
import { OPEN_STAGES, STAGES, sourceLabel } from "@/lib/crm/config";
import { fmtDate, inr, timeAgo } from "@/lib/crm/format";
import { Card, Empty, PageTitle } from "@/components/crm/ui";
import { ColumnBars, HBars } from "@/components/crm/Bars";
import { TaskList } from "@/components/crm/TaskList";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const user = await requireUser();
  const [kpi, byStage, bySource, perDay, due, tasks, recent, outbox] = await Promise.all([
    q1<{ open: number; pipeline: number; won_month: number; won_month_n: number; won: number; lost: number; new_week: number }>(`
      SELECT
        count(*) FILTER (WHERE stage = ANY($1))::int AS open,
        coalesce(sum(value) FILTER (WHERE stage = ANY($1)), 0)::int AS pipeline,
        coalesce(sum(value) FILTER (WHERE stage = 'won' AND stage_changed_at >= date_trunc('month', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata'), 0)::int AS won_month,
        count(*) FILTER (WHERE stage = 'won' AND stage_changed_at >= date_trunc('month', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata')::int AS won_month_n,
        count(*) FILTER (WHERE stage = 'won')::int AS won,
        count(*) FILTER (WHERE stage = 'lost')::int AS lost,
        count(*) FILTER (WHERE created_at >= now() - interval '7 days')::int AS new_week
      FROM crm_leads`, [OPEN_STAGES]),
    q<{ stage: string; n: number; v: number }>("SELECT stage, count(*)::int AS n, coalesce(sum(value),0)::int AS v FROM crm_leads GROUP BY stage"),
    q<{ source: string; n: number; won: number }>("SELECT source, count(*)::int AS n, count(*) FILTER (WHERE stage='won')::int AS won FROM crm_leads GROUP BY source ORDER BY n DESC LIMIT 8"),
    q<{ d: string; n: number }>(`
      SELECT to_char(g.d, 'DD Mon') AS d, count(l.id)::int AS n
      FROM generate_series((now() AT TIME ZONE 'Asia/Kolkata')::date - 29, (now() AT TIME ZONE 'Asia/Kolkata')::date, '1 day') AS g(d)
      LEFT JOIN crm_leads l ON (l.created_at AT TIME ZONE 'Asia/Kolkata')::date = g.d
      GROUP BY g.d ORDER BY g.d`),
    q<{ id: number; name: string; business: string; stage: string; next_followup_at: Date }>(`
      SELECT id, name, business, stage, next_followup_at FROM crm_leads
      WHERE next_followup_at IS NOT NULL AND stage = ANY($1)
        AND next_followup_at < ((now() AT TIME ZONE 'Asia/Kolkata')::date + 1) AT TIME ZONE 'Asia/Kolkata'
      ORDER BY next_followup_at LIMIT 12`, [OPEN_STAGES]),
    q<{ id: number; title: string; due_at: Date | null; done: boolean; lead_id: number | null; lead_name: string | null }>(`
      SELECT t.id, t.title, t.due_at, t.done, t.lead_id, l.name AS lead_name FROM crm_tasks t LEFT JOIN crm_leads l ON l.id = t.lead_id
      WHERE NOT t.done ORDER BY t.due_at NULLS LAST, t.id LIMIT 10`),
    q<{ id: number; lead_id: number; type: string; body: string; created_at: Date; lead_name: string; user_name: string | null }>(`
      SELECT a.id, a.lead_id, a.type, a.body, a.created_at, l.name AS lead_name, u.name AS user_name
      FROM crm_activities a JOIN crm_leads l ON l.id = a.lead_id LEFT JOIN crm_users u ON u.id = a.user_id
      ORDER BY a.created_at DESC LIMIT 10`),
    q1<{ n: number }>("SELECT count(*)::int AS n FROM crm_messages WHERE status = 'queued'"),
  ]);

  const k = kpi!;
  const closed = k.won + k.lost;
  const stageRows = STAGES.map((s) => {
    const r = byStage.find((b) => b.stage === s.id);
    return { label: s.label, value: r?.n ?? 0, sub: r?.v ? inr(r.v) : undefined };
  });
  const hour = Number(new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false }));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageTitle
        title={`${greeting}, ${user.name.split(" ")[0]}`}
        sub="Here's what's moving in the WEBORA pipeline."
        actions={<Link href="/crm/leads?new=1" className="crm-btn crm-btn-primary">+ Add lead</Link>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Open leads" value={String(k.open)} hint={`${k.new_week} new this week`} />
        <Kpi label="Pipeline value" value={inr(k.pipeline)} hint="across open deals" />
        <Kpi label="Won this month" value={inr(k.won_month)} hint={`${k.won_month_n} deal${k.won_month_n === 1 ? "" : "s"}`} />
        <Kpi label="Win rate" value={closed ? `${Math.round((k.won / closed) * 100)}%` : "—"} hint={`${k.won} won · ${k.lost} lost`} />
      </div>

      {(outbox?.n ?? 0) > 0 && (
        <Link href="/crm/outbox" className="crm-card mt-4 flex items-center gap-3 border-[#25d366]/40 bg-[#25d366]/[0.07] p-4 text-sm hover:bg-[#25d366]/10">
          <Send className="h-4 w-4 text-[#5ee39a]" />
          <span className="flex-1"><b>{outbox!.n}</b> automated follow-up{outbox!.n === 1 ? " is" : "s are"} ready — send {outbox!.n === 1 ? "it" : "them"} from the Outbox in one tap each.</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Follow up today" className="lg:col-span-1" action={<BellRing className="h-4 w-4 text-[var(--crm-ink-3)]" />}>
          {due.length === 0 ? (
            <Empty>Nothing due. Set a follow-up date on any lead and it shows up here.</Empty>
          ) : (
            <ul className="space-y-1">
              {due.map((l) => (
                <li key={l.id}>
                  <Link href={`/crm/leads/${l.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{l.name}</span>
                      <span className="block truncate text-xs text-[var(--crm-ink-3)]">{l.business || "—"}</span>
                    </span>
                    <span className={`text-xs ${new Date(l.next_followup_at) < new Date() ? "text-amber-300" : "text-[var(--crm-ink-3)]"}`}>
                      {fmtDate(l.next_followup_at, true)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Tasks" action={<CalendarClock className="h-4 w-4 text-[var(--crm-ink-3)]" />}>
          <TaskList tasks={tasks} showLead />
        </Card>

        <Card title="Pipeline by stage">
          <HBars rows={stageRows} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="New leads · last 30 days" className="lg:col-span-2">
          <ColumnBars cols={perDay.map((d) => ({ label: d.d, value: d.n }))} />
        </Card>
        <Card title="Where leads come from">
          {bySource.length === 0 ? <Empty>No leads yet.</Empty> : (
            <HBars rows={bySource.map((s) => ({ label: sourceLabel(s.source), value: s.n, sub: s.won ? `${s.won} won` : undefined }))} />
          )}
        </Card>
      </div>

      <Card title="Recent activity" className="mt-4">
        {recent.length === 0 ? (
          <Empty href="/crm/leads?new=1" cta="Add your first lead">Activity appears here as leads come in and follow-ups go out.</Empty>
        ) : (
          <ul className="divide-y divide-[var(--crm-line)]">
            {recent.map((a) => (
              <li key={a.id} className="flex gap-3 py-2.5 text-sm">
                <span className="w-16 shrink-0 text-xs text-[var(--crm-ink-3)]">{timeAgo(a.created_at)}</span>
                <span className="min-w-0 flex-1">
                  <Link href={`/crm/leads/${a.lead_id}`} className="font-medium hover:underline">{a.lead_name}</Link>
                  <span className="text-[var(--crm-ink-2)]"> — {a.body.split("\n")[0]}</span>
                  {a.user_name && <span className="text-xs text-[var(--crm-ink-3)]"> · {a.user_name}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="crm-card p-4 sm:p-5">
      <p className="text-xs font-medium text-[var(--crm-ink-3)]">{label}</p>
      <p className="font-display mt-1.5 text-2xl font-bold tabular-nums sm:text-[1.7rem]">{value}</p>
      <p className="mt-1 text-xs text-[var(--crm-ink-3)]">{hint}</p>
    </div>
  );
}
