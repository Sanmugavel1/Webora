"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, Trash2, X } from "lucide-react";
import { deleteTemplatesAction } from "@/app/crm/actions";
import { renderTemplate } from "@/lib/crm/template";
import { ChannelBadge } from "./ui";
import { cn } from "@/lib/utils";

type Tpl = { id: number; name: string; channel: string; subject: string; body: string; domain: string; used: number };
const SAMPLE = { name: "Arjun", business: "Spice Route Cafe", service: "Business Website" };

/** Format cards with a "Select" mode for deleting several at once. */
export function TemplateGrid({ templates }: { templates: Tpl[] }) {
  const router = useRouter();
  const [selecting, setSelecting] = useState(false);
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const toggle = (id: number) => setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const all = templates.length > 0 && templates.every((t) => sel.has(t.id));
  const exit = () => { setSelecting(false); setSel(new Set()); };

  function remove() {
    const ids = [...sel];
    if (!confirm(`Delete ${ids.length} message format${ids.length === 1 ? "" : "s"}? This can't be undone.`)) return;
    setMsg("");
    start(async () => {
      try {
        const r = await deleteTemplatesAction(ids);
        setMsg(
          `Deleted ${r.deleted}.` +
            (r.kept.length ? ` Kept ${r.kept.length} still used by a follow-up sequence: ${r.kept.join(", ")} — remove them from the sequence first.` : ""),
        );
        exit();
        router.refresh();
      } catch {
        setMsg("Couldn't delete — check your connection and try again.");
      }
    });
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {selecting ? (
          <>
            <button onClick={() => setSel(all ? new Set() : new Set(templates.map((t) => t.id)))} className="crm-btn crm-btn-ghost crm-btn-sm">
              {all ? "Unselect all" : "Select all"}
            </button>
            <span className="text-sm text-[var(--crm-ink-2)]">{sel.size} selected</span>
            <button disabled={pending || sel.size === 0} onClick={remove} className="crm-btn crm-btn-danger crm-btn-sm">
              <Trash2 className="h-3.5 w-3.5" /> {pending ? "Deleting…" : "Delete selected"}
            </button>
            <button onClick={exit} className="crm-btn crm-btn-ghost crm-btn-sm"><X className="h-3.5 w-3.5" /> Cancel</button>
          </>
        ) : (
          <button onClick={() => { setSelecting(true); setMsg(""); }} className="crm-btn crm-btn-ghost crm-btn-sm"><CheckSquare className="h-3.5 w-3.5" /> Select</button>
        )}
        {msg && <p className="w-full text-sm text-[var(--crm-ink-2)]">{msg}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((t) => {
          const inner = (
            <>
              <div className="mb-2 flex items-center gap-2">
                {selecting && <input type="checkbox" readOnly checked={sel.has(t.id)} tabIndex={-1} className="pointer-events-none h-4 w-4 accent-[var(--color-blue)]" />}
                <ChannelBadge channel={t.channel} />
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", t.domain ? "bg-[var(--color-blue)]/15 text-[#8fbcff]" : "bg-white/5 text-[var(--crm-ink-3)]")}>{t.domain || "All domains"}</span>
                <span className="ml-auto text-[11px] text-[var(--crm-ink-3)]">{t.used ? `in ${t.used} sequence step${t.used === 1 ? "" : "s"}` : "not automated"}</span>
              </div>
              <p className="font-medium">{t.name}</p>
              {t.subject && <p className="truncate text-xs text-[var(--crm-ink-2)]">{renderTemplate(t.subject, SAMPLE)}</p>}
              <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs text-[var(--crm-ink-3)]">{renderTemplate(t.body, SAMPLE)}</p>
            </>
          );
          return selecting ? (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(t.id)}
              aria-pressed={sel.has(t.id)}
              className={cn("crm-card flex flex-col p-4 text-left transition-colors", sel.has(t.id) ? "border-[var(--color-blue)] bg-[var(--color-blue)]/[0.07]" : "hover:border-white/25")}
            >
              {inner}
            </button>
          ) : (
            <Link key={t.id} href={`/crm/templates/${t.id}`} className="crm-card flex flex-col p-4 transition-colors hover:border-white/25">{inner}</Link>
          );
        })}
      </div>
    </>
  );
}
