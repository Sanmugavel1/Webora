import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Search, UserPlus } from "lucide-react";
import { requireUser } from "@/lib/crm/auth";
import { q } from "@/lib/crm/db";
import { LEAD_SELECT, type Lead } from "@/lib/crm/engine";
import { leadWhere } from "@/lib/crm/leadQuery";
import { channelStatus } from "@/lib/crm/messaging";
import { SOURCES, STAGES } from "@/lib/crm/config";
import { Empty, PageTitle } from "@/components/crm/ui";
import { LeadsTable } from "@/components/crm/LeadsTable";
import { ImportCsv } from "@/components/crm/ImportCsv";

export const metadata = { title: "Leads" };
// CSV import batches and bulk scheduling run as server actions on this page.
export const maxDuration = 60;

const PAGE_SIZE = 100;

export default async function LeadsPage({ searchParams }: PageProps<"/crm/leads">) {
  await requireUser();
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const term = one(sp.q).trim();
  const stage = one(sp.stage);
  const source = one(sp.source);
  const tag = one(sp.tag);
  const sort = one(sp.sort) || "recent";
  // Old "?new=1" links now go to the dedicated Create lead page.
  if (one(sp.new) === "1") redirect("/crm/leads/new");

  const page = Math.max(1, Number(one(sp.page)) || 1);
  const w = leadWhere({ q: term, stage, source, tag });
  const order = { recent: "l.created_at DESC", updated: "l.updated_at DESC", value: "l.value DESC", followup: "l.next_followup_at ASC NULLS LAST" }[sort] ?? "l.created_at DESC";

  const [leads, countRow, emailTemplates] = await Promise.all([
    q<Lead>(`${LEAD_SELECT} ${w.sql} ORDER BY ${order}, l.id DESC LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`, w.params),
    q<{ n: number }>(`SELECT count(*)::int AS n FROM crm_leads l ${w.sql}`, w.params),
    q<{ id: number; name: string; subject: string; body: string }>("SELECT id, name, subject, body FROM crm_templates WHERE channel = 'email' ORDER BY name"),
  ]);
  const total = countRow[0]?.n ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (p: number) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ q: term, stage, source, tag, sort: sort === "recent" ? "" : sort })) if (v) u.set(k, v);
    if (p > 1) u.set("page", String(p));
    const qs = u.toString();
    return `/crm/leads${qs ? `?${qs}` : ""}`;
  };
  const filtered = Boolean(term || stage || source || tag);

  return (
    <>
      <PageTitle
        title="Leads"
        sub={`${total.toLocaleString("en-IN")} ${filtered ? "matching" : "total"}${pages > 1 ? ` · page ${page} of ${pages}` : ""} · tick leads to schedule an email`}
        actions={
          <>
            <ImportCsv />
            <Link href="/crm/leads/new" className="crm-btn crm-btn-primary"><UserPlus className="h-4 w-4" /> Create lead</Link>
            <a href="/crm/export" className="crm-btn crm-btn-ghost"><Download className="h-4 w-4" /> Export</a>
          </>
        }
      />

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
        <Empty>{filtered ? "No leads match those filters." : "No leads yet — website enquiries will appear here automatically, or use “Create lead”."}</Empty>
      ) : (
        <>
          <LeadsTable
            key={`${page}-${term}-${stage}-${source}-${tag}-${sort}`}
            leads={leads.map((l) => ({
              id: l.id, name: l.name, business: l.business, email: l.email, phone: l.phone, service: l.service, source: l.source,
              stage: l.stage, value: l.value, tags: l.tags, agent_name: l.agent_name,
              next_followup_at: l.next_followup_at ? new Date(l.next_followup_at).toISOString() : null,
              created_at: new Date(l.created_at).toISOString(),
            }))}
            total={total}
            filter={{ q: term, stage, source, tag }}
            emailTemplates={emailTemplates}
            emailReady={channelStatus().email}
          />
          {pages > 1 && (
            <nav className="mt-4 flex items-center justify-center gap-2 text-sm" aria-label="Pages">
              {page > 1 ? <Link href={pageHref(page - 1)} className="crm-btn crm-btn-ghost crm-btn-sm">← Previous</Link> : <span className="crm-btn crm-btn-ghost crm-btn-sm opacity-40">← Previous</span>}
              <span className="px-2 text-[var(--crm-ink-3)]">Page {page} of {pages}</span>
              {page < pages ? <Link href={pageHref(page + 1)} className="crm-btn crm-btn-ghost crm-btn-sm">Next →</Link> : <span className="crm-btn crm-btn-ghost crm-btn-sm opacity-40">Next →</span>}
            </nav>
          )}
        </>
      )}
    </>
  );
}
