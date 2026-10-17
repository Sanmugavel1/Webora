"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { createDomainAction, deleteDomainAction, renameDomainAction } from "@/app/crm/actions";
import { inr } from "@/lib/crm/format";

type Row = { domain: string; leads: number; open: number; won: number; value: number; formats?: number };

const href = (d: string) => `/crm/leads?domain=${encodeURIComponent(d || "none")}`;
const n = (v: number) => v.toLocaleString("en-IN");

export function DomainTable({ rows, blank }: { rows: Row[]; blank: Row | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const all = [...rows, ...(blank ? [blank] : [])];
  const total = all.reduce((t, r) => ({ leads: t.leads + r.leads, open: t.open + r.open, won: t.won + r.won, value: t.value + r.value }), { leads: 0, open: 0, won: 0, value: 0 });

  function run(fn: () => Promise<unknown>) {
    start(async () => {
      try {
        await fn();
        router.refresh();
      } catch {
        alert("Couldn't reach the server — check your connection and try again.");
      }
    });
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    run(async () => {
      const r = await createDomainAction(name);
      if (r.error) setMsg(r.error);
      else setName("");
    });
  }

  function rename(r: Row) {
    const to = prompt(`Rename “${r.domain}” to… (typing an existing domain merges the two)`, r.domain);
    if (to === null || !to.trim() || to.trim() === r.domain) return;
    run(async () => {
      const res = await renameDomainAction(r.domain, to);
      if (res.error) alert(res.error);
    });
  }

  function remove(r: Row) {
    const what = r.leads ? `Its ${n(r.leads)} lead${r.leads === 1 ? "" : "s"} will stay, with no domain set.` : "It has no leads.";
    if (!confirm(`Delete the domain “${r.domain}”? ${what}`)) return;
    run(() => deleteDomainAction(r.domain));
  }

  return (
    <>
      <form onSubmit={add} className="mb-4 flex flex-wrap items-center gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New domain, e.g. Bakery" maxLength={60} className="crm-input max-w-xs flex-1" aria-label="New domain name" />
        <button disabled={pending || !name.trim()} className="crm-btn crm-btn-primary"><Plus className="h-4 w-4" /> Add domain</button>
        {msg && <span className="text-sm text-rose-300">{msg}</span>}
      </form>

      <div className="crm-card overflow-x-auto">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Domain</th><th className="text-right">Leads</th><th className="hidden w-1/4 md:table-cell">Share</th>
              <th className="text-right">Open</th><th className="hidden text-right sm:table-cell">Won</th><th className="hidden text-right sm:table-cell">Value</th><th className="text-right">Formats</th><th className="w-20" />
            </tr>
          </thead>
          <tbody>
            {all.map((r) => {
              const pct = total.leads ? (r.leads / total.leads) * 100 : 0;
              return (
                <tr key={r.domain || "none"}>
                  <td>
                    <Link href={href(r.domain)} className={r.domain ? "font-medium hover:underline" : "italic text-[var(--crm-ink-3)] hover:underline"}>{r.domain || "No domain set"}</Link>
                  </td>
                  <td className="text-right font-semibold tabular-nums">{n(r.leads)}</td>
                  <td className="hidden md:table-cell">
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5"><span className="block h-full rounded-full bg-[var(--color-blue)]" style={{ width: `${r.leads ? Math.max(pct, 0.5) : 0}%` }} /></span>
                      <span className="w-12 text-right text-xs tabular-nums text-[var(--crm-ink-3)]">{pct > 0 && pct < 1 ? pct.toFixed(1) : Math.round(pct)}%</span>
                    </span>
                  </td>
                  <td className="text-right tabular-nums text-[var(--crm-ink-2)]">{n(r.open)}</td>
                  <td className="hidden text-right tabular-nums text-[var(--crm-ink-2)] sm:table-cell">{n(r.won)}</td>
                  <td className="hidden text-right tabular-nums text-[var(--crm-ink-2)] sm:table-cell">{r.value ? inr(r.value) : "—"}</td>
                  <td className="whitespace-nowrap text-right">
                    {r.domain && (
                      <Link href={`/crm/templates?domain=${encodeURIComponent(r.domain)}`} className="text-[#8fbcff] hover:underline" title={`${r.domain} message formats`}>
                        {r.formats ? `${r.formats} format${r.formats === 1 ? "" : "s"}` : "+ add"}
                      </Link>
                    )}
                  </td>
                  <td className="whitespace-nowrap text-right">
                    {r.domain && (
                      <>
                        <button disabled={pending} onClick={() => rename(r)} className="rounded p-1 text-[var(--crm-ink-3)] hover:bg-white/5 hover:text-[var(--crm-ink)]" aria-label={`Rename ${r.domain}`} title="Rename">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button disabled={pending} onClick={() => remove(r)} className="rounded p-1 text-[var(--crm-ink-3)] hover:bg-rose-500/10 hover:text-rose-300" aria-label={`Delete ${r.domain}`} title="Delete domain">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td className="px-3 py-3">Total</td>
              <td className="px-3 py-3 text-right tabular-nums">{n(total.leads)}</td>
              <td className="hidden px-3 py-3 text-xs text-[var(--crm-ink-3)] md:table-cell">100%</td>
              <td className="px-3 py-3 text-right tabular-nums">{n(total.open)}</td>
              <td className="hidden px-3 py-3 text-right tabular-nums sm:table-cell">{n(total.won)}</td>
              <td className="hidden px-3 py-3 text-right tabular-nums sm:table-cell">{total.value ? inr(total.value) : "—"}</td>
              <td />
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="mt-3 text-xs text-[var(--crm-ink-3)]">To move leads between domains: on Leads, tick them → “Move to domain”. Or change the Domain field on a single lead.</p>
    </>
  );
}
