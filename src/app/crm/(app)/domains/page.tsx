import Link from "next/link";
import { requireUser } from "@/lib/crm/auth";
import { q } from "@/lib/crm/db";
import { NO_DOMAIN } from "@/lib/crm/leadQuery";
import { inr } from "@/lib/crm/format";
import { Empty, PageTitle } from "@/components/crm/ui";

export const metadata = { title: "Domains" };

type Row = { domain: string; leads: number; open: number; won: number; value: number };

export default async function DomainsPage() {
  await requireUser();
  // Group case-insensitively ("gym" and "Gym" are one domain); show the most common spelling.
  const rows = await q<Row>(`
    SELECT mode() WITHIN GROUP (ORDER BY trim(domain)) AS domain,
      count(*)::int AS leads,
      count(*) FILTER (WHERE stage NOT IN ('won', 'lost'))::int AS open,
      count(*) FILTER (WHERE stage = 'won')::int AS won,
      coalesce(sum(value), 0)::int AS value
    FROM crm_leads GROUP BY lower(trim(domain)) ORDER BY leads DESC, domain`);
  const total = rows.reduce((n, r) => n + r.leads, 0);
  const named = rows.filter((r) => r.domain);
  const blank = rows.find((r) => !r.domain);
  const totals = rows.reduce((t, r) => ({ open: t.open + r.open, won: t.won + r.won, value: t.value + r.value }), { open: 0, won: 0, value: 0 });
  const href = (d: string) => `/crm/leads?domain=${encodeURIComponent(d || NO_DOMAIN)}`;

  return (
    <>
      <PageTitle
        title="Domains"
        sub={`${named.length.toLocaleString("en-IN")} domain${named.length === 1 ? "" : "s"} · ${total.toLocaleString("en-IN")} leads total · tap a domain to see its leads`}
        actions={<Link href="/crm/leads" className="crm-btn crm-btn-ghost">All leads</Link>}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Domains", named.length.toLocaleString("en-IN")],
          ["Total leads", total.toLocaleString("en-IN")],
          ["Won", totals.won.toLocaleString("en-IN")],
          ["No domain set", (blank?.leads ?? 0).toLocaleString("en-IN")],
        ].map(([k, v]) => (
          <div key={k} className="crm-card p-4">
            <p className="text-xs text-[var(--crm-ink-3)]">{k}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      {total === 0 ? (
        <Empty>No leads yet.</Empty>
      ) : (
        <div className="crm-card overflow-x-auto">
          <table className="crm-table">
            <thead>
              <tr><th>Domain</th><th className="text-right">Leads</th><th className="hidden w-1/3 sm:table-cell">Share</th><th className="text-right">Open</th><th className="text-right">Won</th><th className="hidden text-right sm:table-cell">Value</th></tr>
            </thead>
            <tbody>
              {[...named, ...(blank ? [blank] : [])].map((r) => {
                const pct = (r.leads / total) * 100;
                return (
                  <tr key={r.domain || NO_DOMAIN}>
                    <td><Link href={href(r.domain)} className={r.domain ? "font-medium hover:underline" : "italic text-[var(--crm-ink-3)] hover:underline"}>{r.domain || "No domain set"}</Link></td>
                    <td className="text-right font-semibold tabular-nums">{r.leads.toLocaleString("en-IN")}</td>
                    <td className="hidden sm:table-cell">
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5"><span className="block h-full rounded-full bg-[var(--color-blue)]" style={{ width: `${Math.max(pct, 0.5)}%` }} /></span>
                        <span className="w-12 text-right text-xs tabular-nums text-[var(--crm-ink-3)]">{pct < 1 ? pct.toFixed(1) : Math.round(pct)}%</span>
                      </span>
                    </td>
                    <td className="text-right tabular-nums text-[var(--crm-ink-2)]">{r.open.toLocaleString("en-IN")}</td>
                    <td className="text-right tabular-nums text-[var(--crm-ink-2)]">{r.won.toLocaleString("en-IN")}</td>
                    <td className="hidden text-right tabular-nums text-[var(--crm-ink-2)] sm:table-cell">{r.value ? inr(r.value) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td className="px-3 py-3">Total</td>
                <td className="px-3 py-3 text-right tabular-nums">{total.toLocaleString("en-IN")}</td>
                <td className="hidden px-3 py-3 text-xs text-[var(--crm-ink-3)] sm:table-cell">100%</td>
                <td className="px-3 py-3 text-right tabular-nums">{totals.open.toLocaleString("en-IN")}</td>
                <td className="px-3 py-3 text-right tabular-nums">{totals.won.toLocaleString("en-IN")}</td>
                <td className="hidden px-3 py-3 text-right tabular-nums sm:table-cell">{totals.value ? inr(totals.value) : "—"}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </>
  );
}
