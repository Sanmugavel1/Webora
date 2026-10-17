"use client";

import Link from "next/link";
import { useTransition } from "react";
import { addTaskAction, toggleTaskAction } from "@/app/crm/actions";
import { fmtDate } from "@/lib/crm/format";

type Task = { id: number; title: string; due_at: Date | string | null; done: boolean; lead_id: number | null; lead_name?: string | null };

export function TaskList({ tasks, leadId, showLead = false }: { tasks: Task[]; leadId?: number; showLead?: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div>
      {tasks.length === 0 ? (
        <p className="mb-3 text-sm text-[var(--crm-ink-3)]">No open tasks.</p>
      ) : (
        <ul className="mb-3 space-y-1">
          {tasks.map((t) => {
            const overdue = !t.done && t.due_at && new Date(t.due_at) < new Date();
            return (
              <li key={t.id} className="flex items-start gap-3 rounded-lg px-1 py-1.5">
                <input
                  type="checkbox"
                  checked={t.done}
                  disabled={pending}
                  onChange={(e) => start(() => toggleTaskAction(t.id, e.target.checked))}
                  className="mt-0.5 h-4 w-4 accent-[#1677ff]"
                  aria-label={`Mark “${t.title}” done`}
                />
                <span className="min-w-0 flex-1 text-sm">
                  <span className={t.done ? "text-[var(--crm-ink-3)] line-through" : ""}>{t.title}</span>
                  <span className="block text-xs text-[var(--crm-ink-3)]">
                    {t.due_at && <span className={overdue ? "text-amber-300" : ""}>{fmtDate(t.due_at, true)}</span>}
                    {showLead && t.lead_id && (
                      <>
                        {t.due_at && " · "}
                        <Link href={`/crm/leads/${t.lead_id}`} className="hover:underline">{t.lead_name}</Link>
                      </>
                    )}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <form action={addTaskAction} className="flex flex-wrap gap-2" onSubmit={(e) => setTimeout(() => (e.target as HTMLFormElement).reset(), 0)}>
        {leadId && <input type="hidden" name="lead_id" value={leadId} />}
        <input name="title" required placeholder="Add a task…" className="crm-input min-w-0 flex-1 basis-40" />
        <input name="due_at" type="datetime-local" aria-label="Due" className="crm-input w-auto basis-44" />
        <button className="crm-btn crm-btn-ghost">Add</button>
      </form>
    </div>
  );
}
