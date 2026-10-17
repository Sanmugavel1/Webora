import { requireUser } from "@/lib/crm/auth";
import { q1 } from "@/lib/crm/db";
import { runDueFollowups } from "@/lib/crm/engine";
import { Sidebar } from "@/components/crm/Sidebar";

export default async function CrmAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  // Opening the CRM doubles as a scheduler tick, so follow-ups never wait for the daily cron.
  await runDueFollowups().catch((e) => console.error("followup run failed", e));
  const outbox = await q1<{ n: number }>("SELECT count(*)::int AS n FROM crm_messages WHERE status = 'queued'");

  return (
    <div className="lg:flex">
      <Sidebar userName={user.name} outboxCount={outbox?.n ?? 0} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
