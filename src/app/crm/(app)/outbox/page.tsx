import Link from "next/link";
import { requireUser } from "@/lib/crm/auth";
import { q } from "@/lib/crm/db";
import { channelStatus } from "@/lib/crm/messaging";
import { timeAgo } from "@/lib/crm/format";
import { Card, ChannelBadge, Empty, PageTitle } from "@/components/crm/ui";
import { OutboxSend } from "@/components/crm/OutboxItem";
import { runAutomationNowAction } from "../../actions";

export const metadata = { title: "Outbox" };

type Msg = { id: number; lead_id: number; lead_name: string; business: string; channel: string; to_addr: string; subject: string; body: string; status: string; error: string; created_at: Date; sent_at: Date | null; seq: string | null };

const SELECT = `SELECT m.*, l.name AS lead_name, l.business, s.name AS seq FROM crm_messages m
  JOIN crm_leads l ON l.id = m.lead_id LEFT JOIN crm_enrollments e ON e.id = m.enrollment_id LEFT JOIN crm_sequences s ON s.id = e.sequence_id`;

export default async function OutboxPage() {
  await requireUser();
  const [queued, history] = await Promise.all([
    q<Msg>(`${SELECT} WHERE m.status = 'queued' ORDER BY m.created_at`),
    q<Msg>(`${SELECT} WHERE m.status <> 'queued' ORDER BY m.created_at DESC LIMIT 60`),
  ]);
  const ch = channelStatus();

  return (
    <>
      <PageTitle
        title="Outbox"
        sub={
          ch.whatsappApi
            ? "Follow-ups the WhatsApp API couldn't deliver (outside Meta's 24-hour window) wait here for one-tap sending."
            : "Automated follow-ups that are due. Tap send — WhatsApp opens with the message ready."
        }
        actions={<form action={runAutomationNowAction}><button className="crm-btn crm-btn-ghost">Check for due follow-ups</button></form>}
      />

      {queued.length === 0 ? (
        <Empty>All caught up — nothing waiting to be sent.</Empty>
      ) : (
        <ul className="space-y-3">
          {queued.map((m) => (
            <li key={m.id} className="crm-card p-4 sm:p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                <ChannelBadge channel={m.channel} />
                <Link href={`/crm/leads/${m.lead_id}`} className="font-semibold hover:underline">{m.lead_name}</Link>
                {m.business && <span className="text-[var(--crm-ink-3)]">· {m.business}</span>}
                <span className="ml-auto text-xs text-[var(--crm-ink-3)]">{m.seq ?? "manual"} · due {timeAgo(m.created_at)}</span>
              </div>
              {m.subject && <p className="mb-1 text-sm font-medium">{m.subject}</p>}
              <p className="mb-3 line-clamp-4 whitespace-pre-wrap text-sm text-[var(--crm-ink-2)]">{m.body}</p>
              <OutboxSend id={m.id} channel={m.channel} to={m.to_addr} subject={m.subject} body={m.body} />
            </li>
          ))}
        </ul>
      )}

      <Card title="Recently sent" className="mt-6">
        {history.length === 0 ? <p className="text-sm text-[var(--crm-ink-3)]">Nothing yet.</p> : (
          <ul className="divide-y divide-[var(--crm-line)]">
            {history.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
                <ChannelBadge channel={m.channel} />
                <Link href={`/crm/leads/${m.lead_id}`} className="font-medium hover:underline">{m.lead_name}</Link>
                <span className="min-w-0 flex-1 truncate text-[var(--crm-ink-3)]">{m.subject || m.body.split("\n")[0]}</span>
                <span className={`text-xs ${m.status === "sent" ? "text-[#5ee39a]" : m.status === "failed" ? "text-rose-300" : "text-[var(--crm-ink-3)]"}`} title={m.error}>
                  {m.status === "skipped" && m.error && m.error !== "dismissed" ? m.error : m.status}
                </span>
                <span className="w-16 text-right text-xs text-[var(--crm-ink-3)]">{timeAgo(m.sent_at ?? m.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
