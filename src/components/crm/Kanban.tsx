"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { moveStageAction } from "@/app/crm/actions";
import { STAGES, type StageId } from "@/lib/crm/config";
import { inr, timeAgo } from "@/lib/crm/format";

type Card = { id: number; name: string; business: string; service: string; value: number; stage: StageId; stage_changed_at: string; agent_name: string | null; next_followup_at: string | null };

export function Kanban({ leads, stats }: { leads: Card[]; stats: Record<string, { n: number; total: number }> }) {
  const [items, move] = useOptimistic(leads, (state, { id, stage }: { id: number; stage: StageId }) =>
    state.map((l) => (l.id === id ? { ...l, stage } : l)),
  );
  const [, start] = useTransition();
  const [over, setOver] = useState<StageId | null>(null);

  function drop(id: number, stage: StageId) {
    if (items.find((l) => l.id === id)?.stage === stage) return;
    start(async () => {
      move({ id, stage });
      await moveStageAction(id, stage);
    });
  }

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
      <div className="grid min-w-[1080px] grid-cols-6 gap-3">
        {STAGES.map((s) => {
          const col = items.filter((l) => l.stage === s.id);
          // Server totals cover the whole column; adjust for cards moved on this page.
          const shown = leads.filter((l) => l.stage === s.id);
          const count = (stats[s.id]?.n ?? 0) + col.length - shown.length;
          const total = (stats[s.id]?.total ?? 0) + col.reduce((a, l) => a + l.value, 0) - shown.reduce((a, l) => a + l.value, 0);
          const hidden = count - col.length;
          return (
            <section
              key={s.id}
              data-over={over === s.id}
              onDragOver={(e) => { e.preventDefault(); setOver(s.id); }}
              onDragLeave={() => setOver((o) => (o === s.id ? null : o))}
              onDrop={(e) => { e.preventDefault(); setOver(null); drop(Number(e.dataTransfer.getData("text/plain")), s.id); }}
              className="crm-kanban-col flex min-h-[60vh] flex-col rounded-xl bg-white/[0.025] p-2"
              aria-label={`${s.label} column`}
            >
              <header className="mb-2 flex items-center justify-between px-1.5 pt-1">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.label}
                  <span className="text-xs font-normal text-[var(--crm-ink-3)]">{count}</span>
                </span>
                {total > 0 && <span className="text-xs tabular-nums text-[var(--crm-ink-3)]">{inr(total)}</span>}
              </header>
              <div className="flex flex-1 flex-col gap-2">
                {col.map((l) => (
                  <article
                    key={l.id}
                    draggable
                    onDragStart={(e) => { e.dataTransfer.setData("text/plain", String(l.id)); e.dataTransfer.effectAllowed = "move"; }}
                    className="crm-card cursor-grab p-3 active:cursor-grabbing"
                    style={{ borderLeft: `3px solid ${s.color}` }}
                  >
                    <Link href={`/crm/leads/${l.id}`} className="block text-sm font-medium hover:underline">{l.name}</Link>
                    <p className="truncate text-xs text-[var(--crm-ink-3)]">{[l.business, l.service].filter(Boolean).join(" · ") || "—"}</p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="tabular-nums text-[var(--crm-ink-2)]">{l.value ? inr(l.value) : ""}</span>
                      <span className={l.next_followup_at && new Date(l.next_followup_at) < new Date() ? "text-amber-300" : "text-[var(--crm-ink-3)]"}>
                        {l.next_followup_at && new Date(l.next_followup_at) < new Date() ? "follow-up due" : `${timeAgo(l.stage_changed_at)} here`}
                      </span>
                    </div>
                    {/* Touch screens can't drag — a move menu does the same job. */}
                    <select
                      value={l.stage}
                      onChange={(e) => drop(l.id, e.target.value as StageId)}
                      className="crm-input mt-2 min-h-7 py-0.5 text-xs lg:hidden"
                      aria-label={`Move ${l.name}`}
                    >
                      {STAGES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                    </select>
                  </article>
                ))}
                {hidden > 0 && (
                  <Link href={`/crm/leads?stage=${s.id}`} className="rounded-lg border border-dashed border-[var(--crm-line)] p-2 text-center text-xs text-[var(--crm-ink-3)] hover:bg-white/5">
                    + {hidden.toLocaleString("en-IN")} more in Leads
                  </Link>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
