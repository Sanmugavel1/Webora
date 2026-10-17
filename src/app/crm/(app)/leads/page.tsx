import Link from "next/link";
import { Download, Search } from "lucide-react";
import { listUsers, requireUser } from "@/lib/crm/auth";
import { q } from "@/lib/crm/db";
import { LEAD_SELECT, type Lead } from "@/lib/crm/engine";
import { SOURCES, STAGES, sourceLabel } from "@/lib/crm/config";
import { fmtDate, inr, timeAgo } from "@/lib/crm/format";
import { Empty, PageTitle, StageBadge } from "@/components/crm/ui";
import { LeadFields } from "@/components/crm/LeadFields";
import { ImportCsv } from "@/components/crm/ImportCsv";
import { createLeadAction } from "../../actions";

export const metadata = { title: "Leads" };

export default async function LeadsPage({ searchParams }: PageProps<"/crm/leads">) {
  await requireUser();
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const term = one(sp.q).trim();
  const stage = one(sp.stage);
  const source = one(sp.source);
  const tag = one(sp.tag);
  const sort = one(sp.sort) || "recent";

  const where: string[] = [];
  const params: unknown[] = [];
  if (term) {
    params.push(`%${term.toLowerCase()}%`);
    where.push(`(lower(l.name) LIKE $${params.length} OR lower(l.business) LIKE $${params.length} OR lower(l.email) LIKE $${params.length} OR l.phone LIKE $${params.length})`);
  }
  if (stage) { params.push(stage); where.push(`l.stage = $${params.length}`); }
  if (source) { params.push(source); where.push(`l.source = $${params.length}`); }
  if (tag) { params.push(tag); where.push(`$${params.length} = ANY(l.tags)`); }
  const order = { recent: "l.created_at DESC", updated: "l.updated_at DESC", value: "l.value DESC", followup: "l.next_followup_at ASC NULLS LAST" }[sort] ?? "l.created_at DESC";

  const [leads, users] = await Promise.all([
    q<Lead>(`${LEAD_SELECT} ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY ${order} LIMIT 500`, params),
    listUsers(),
  ]);
  const filtered = Boolean(term || stage || source || tag);

  return (
    <>
      <PageTitle
        title="Leads"
        sub={`${leads.length} ${filtered ? "matching" : "total"}`}
        actions={
          <>
            <ImportCsv />
            <a href="/crm/export" className="crm-btn crm-btn-ghost"><Download className="h-4 w-4" /> Export</a>
          </>
        }
      />

      <details open={one(sp.new) === "1"} className="crm-card mb-4">
        <summary className="flex items-center justify-between p-4 text-sm font-semibold">
          <span>+ Add a lead</span>
          <span className="text-xs font-normal text-[var(--crm-ink-3)]">Starts any “new lead” follow-up automatically</span>
        </summary>
        <form action={createLeadAction} className="border-t border-[var(--crm-line)] p-4 sm:p-5">
          <LeadFields users={users} />
          <div className="mt-4 flex justify-end"><button className="crm-btn crm-btn-primary">Save lead</button></div>
        </form>
      </details>

      <form className="mb-4 flex flex-wrap gap-2">
        <label className="relative min-w-0 flex-1 basis-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--crm-ink-3)]" />
          <input name="q" defaultValue={term} placeholder="Search name, business, phone, email" className="crm-input pl-9" aria-label="Search" />
        </label>
        <select name="stage" defaultValue={stage} className="crm-input w-auto" aria-label="Stage">
          <option value="">All stages</option>
          {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select name="source" defaultValue={source} className="crm-input w-auto" aria-label="Source">
          <option value="">All sources</option>
          {SOURCES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select name="sort" defaultValue={sort} className="crm-input w-auto" aria-label="Sort">
          <option value="recent">Newest</option>
          <option value="updated">Recently active</option>
          <option value="value">Highest value</option>
          <option value="followup">Next follow-up</option>
        </select>
        {tag && <input type="hidden" name="tag" value={tag} />}
        <button className="crm-btn crm-btn-ghost">Filter</button>
        {filtered && <Link href="/crm/leads" className="crm-btn crm-btn-ghost">Clear</Link>}
      </form>

      {leads.length === 0 ? (
        <Empty>{filtered ? "No leads match those filters." : "No leads yet — website enquiries will appear here automatically, or add one above."}</Empty>
      ) : (
        <>
          <div className="crm-card hidden overflow-x-auto md:block">
            <table className="crm-table">
              <thead>
                <tr><th>Lead</th><th>Stage</th><th>Service</th><th>Source</th><th className="text-right">Value</th><th>Next follow-up</th><th>Added</th></tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <Link href={`/crm/leads/${l.id}`} className="font-medium hover:underline">{l.name}</Link>
                      <div className="text-xs text-[var(--crm-ink-3)]">{[l.business, l.phone].filter(Boolean).join(" · ") || l.email}</div>
                      {l.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {l.tags.map((t) => <Link key={t} href={`/crm/leads?tag=${encodeURIComponent(t)}`} className="rounded bg-white/5 px-1.5 text-[10px] text-[var(--crm-ink-2)]">#{t}</Link>)}
                        </div>
                      )}
                    </td>
                    <td><StageBadge stage={l.stage} /></td>
                    <td className="text-[var(--crm-ink-2)]">{l.service || "—"}</td>
                    <td className="text-[var(--crm-ink-2)]">{sourceLabel(l.source)}</td>
                    <td className="text-right tabular-nums">{l.value ? inr(l.value) : "—"}</td>
                    <td className={l.next_followup_at && new Date(l.next_followup_at) < new Date() ? "text-amber-300" : "text-[var(--crm-ink-2)]"}>{fmtDate(l.next_followup_at, true)}</td>
                    <td className="text-[var(--crm-ink-3)]">{timeAgo(l.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2 md:hidden">
            {leads.map((l) => (
              <li key={l.id}>
                <Link href={`/crm/leads/${l.id}`} className="crm-card flex items-start gap-3 p-4">
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{l.name}</span>
                    <span className="block truncate text-xs text-[var(--crm-ink-3)]">{[l.business, l.service].filter(Boolean).join(" · ") || "—"}</span>
                    <span className="mt-2 flex items-center gap-2"><StageBadge stage={l.stage} />{l.value > 0 && <span className="text-xs tabular-nums">{inr(l.value)}</span>}</span>
                  </span>
                  <span className="text-xs text-[var(--crm-ink-3)]">{timeAgo(l.created_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
