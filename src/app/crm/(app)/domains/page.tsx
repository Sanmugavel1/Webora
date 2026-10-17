import Link from "next/link";
import { requireUser } from "@/lib/crm/auth";
import { q } from "@/lib/crm/db";
import { listDomains } from "@/lib/crm/domains";
import { PageTitle } from "@/components/crm/ui";
import { DomainTable } from "@/components/crm/DomainTable";

export const metadata = { title: "Domains" };

export default async function DomainsPage() {
  await requireUser();
  const [rows, blankRow] = await Promise.all([
    listDomains(),
    q<{ leads: number; open: number; won: number; value: number }>(`
      SELECT count(*)::int AS leads, count(*) FILTER (WHERE stage NOT IN ('won', 'lost'))::int AS open,
        count(*) FILTER (WHERE stage = 'won')::int AS won, coalesce(sum(value), 0)::int AS value
      FROM crm_leads WHERE trim(domain) = ''`),
  ]);
  const blank = blankRow[0]?.leads ? { domain: "", ...blankRow[0] } : null;
  const total = rows.reduce((n, r) => n + r.leads, 0) + (blank?.leads ?? 0);
  const won = rows.reduce((n, r) => n + r.won, 0) + (blank?.won ?? 0);

  return (
    <>
      <PageTitle
        title="Domains"
        sub={`${rows.length.toLocaleString("en-IN")} domain${rows.length === 1 ? "" : "s"} · ${total.toLocaleString("en-IN")} leads total · tap a domain to see its leads`}
        actions={<Link href="/crm/leads" className="crm-btn crm-btn-ghost">All leads</Link>}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Domains", rows.length],
          ["Total leads", total],
          ["Won", won],
          ["No domain set", blank?.leads ?? 0],
        ].map(([k, v]) => (
          <div key={k} className="crm-card p-4">
            <p className="text-xs text-[var(--crm-ink-3)]">{k}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{v.toLocaleString("en-IN")}</p>
          </div>
        ))}
      </div>

      <DomainTable rows={rows} blank={blank} />
    </>
  );
}
