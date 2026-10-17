"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { CalendarClock, X } from "lucide-react";
import { scheduleEmailAction } from "@/app/crm/actions";
import { sourceLabel, type StageId } from "@/lib/crm/config";
import { fmtDate, inr, timeAgo } from "@/lib/crm/format";
import { renderTemplate } from "@/lib/crm/template";
import { StageBadge } from "./ui";
import { cn } from "@/lib/utils";

export type LeadRow = {
  id: number;
  name: string;
  business: string;
  email: string;
  phone: string;
  service: string;
  source: string;
  stage: StageId;
  value: number;
  tags: string[];
  agent_name: string | null;
  next_followup_at: string | null;
  created_at: string;
};
type Filter = { q: string; stage: string; source: string; tag: string };
type Tpl = { id: number; name: string; subject: string; body: string };

/** A day in India time as yyyy-mm-dd, for the date picker. */
const istDay = (offsetDays = 0) => new Date(Date.now() + 5.5 * 3600_000 + offsetDays * 86_400_000).toISOString().slice(0, 10);
const todayIst = () => istDay();
/** Default to the next 9 AM: today if it's still early, otherwise tomorrow. */
const defaultDay = () => (new Date(Date.now() + 5.5 * 3600_000).getUTCHours() < 9 ? istDay() : istDay(1));

export function LeadsTable({ leads, total, filter, emailTemplates, emailReady }: { leads: LeadRow[]; total: number; filter: Filter; emailTemplates: Tpl[]; emailReady: boolean }) {
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [allMatching, setAllMatching] = useState(false);
  const [open, setOpen] = useState(false);
  const pageIds = leads.map((l) => l.id);
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => sel.has(id));
  const count = allMatching ? total : sel.size;

  function toggle(id: number) {
    setAllMatching(false);
    setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  function togglePage() {
    setAllMatching(false);
    setSel((s) => { const n = new Set(s); pageIds.forEach((id) => (allOnPage ? n.delete(id) : n.add(id))); return n; });
  }
  function clear() { setSel(new Set()); setAllMatching(false); setOpen(false); }

  const Check = ({ id, label }: { id: number; label: string }) => (
    <input type="checkbox" checked={allMatching || sel.has(id)} onChange={() => toggle(id)} aria-label={`Select ${label}`} className="h-4 w-4 cursor-pointer accent-[var(--color-blue)]" />
  );

  return (
    <>
      <div className="crm-card hidden overflow-x-auto md:block">
        <table className="crm-table">
          <thead>
            <tr>
              <th className="w-10"><input type="checkbox" checked={allMatching || allOnPage} onChange={togglePage} aria-label="Select all on this page" className="h-4 w-4 cursor-pointer accent-[var(--color-blue)]" /></th>
              <th>Lead</th><th>Stage</th><th>Service</th><th>Source</th><th className="text-right">Value</th><th>Next follow-up</th><th>Added</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className={cn((allMatching || sel.has(l.id)) && "bg-[var(--color-blue)]/[0.07]")}>
                <td><Check id={l.id} label={l.name} /></td>
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
                <td suppressHydrationWarning className={l.next_followup_at && new Date(l.next_followup_at) < new Date() ? "text-amber-300" : "text-[var(--crm-ink-2)]"}>{fmtDate(l.next_followup_at, true)}</td>
                <td suppressHydrationWarning className="text-[var(--crm-ink-3)]">{timeAgo(l.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-2 md:hidden">
        {leads.map((l) => (
          <li key={l.id} className="crm-card flex items-start gap-3 p-4">
            <span className="pt-0.5"><Check id={l.id} label={l.name} /></span>
            <Link href={`/crm/leads/${l.id}`} className="flex min-w-0 flex-1 items-start gap-3">
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{l.name}</span>
                <span className="block truncate text-xs text-[var(--crm-ink-3)]">{[l.business, l.service].filter(Boolean).join(" · ") || "—"}</span>
                <span className="mt-2 flex items-center gap-2"><StageBadge stage={l.stage} />{l.value > 0 && <span className="text-xs tabular-nums">{inr(l.value)}</span>}</span>
              </span>
              <span suppressHydrationWarning className="text-xs text-[var(--crm-ink-3)]">{timeAgo(l.created_at)}</span>
            </Link>
          </li>
        ))}
      </ul>

      {count > 0 && (
        <div className="sticky bottom-3 z-20 mt-4">
          <div className="crm-card border-[var(--color-blue)]/40 p-3 shadow-2xl shadow-black/40 sm:p-4" style={{ background: "var(--crm-panel-2)" }}>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">{count.toLocaleString("en-IN")} selected</span>
              {!allMatching && allOnPage && total > leads.length && (
                <button onClick={() => setAllMatching(true)} className="text-xs text-[#8fbcff] underline-offset-2 hover:underline">
                  Select all {total.toLocaleString("en-IN")} matching leads
                </button>
              )}
              <span className="ml-auto flex gap-2">
                <button onClick={() => setOpen((o) => !o)} className="crm-btn crm-btn-primary crm-btn-sm"><CalendarClock className="h-3.5 w-3.5" /> Schedule email</button>
                <button onClick={clear} className="crm-btn crm-btn-ghost crm-btn-sm" aria-label="Clear selection"><X className="h-3.5 w-3.5" /></button>
              </span>
            </div>
            {open && (
              <ScheduleForm
                templates={emailTemplates}
                emailReady={emailReady}
                sample={leads.find((l) => allMatching || sel.has(l.id)) ?? leads[0]}
                target={allMatching ? { ids: null, filter } : { ids: [...sel], filter: null }}
                onDone={clear}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ScheduleForm({ templates, emailReady, sample, target, onDone }: { templates: Tpl[]; emailReady: boolean; sample?: LeadRow; target: { ids: number[] | null; filter: Filter | null }; onDone: () => void }) {
  const [tplId, setTplId] = useState(templates[0]?.id ? String(templates[0].id) : "");
  const [day, setDay] = useState(defaultDay);
  const [time, setTime] = useState("09:00");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const tpl = templates.find((t) => String(t.id) === tplId);
  const preview = useMemo(() => (tpl && sample ? { subject: renderTemplate(tpl.subject, sample), body: renderTemplate(tpl.body, sample) } : null), [tpl, sample]);

  if (templates.length === 0) {
    return <p className="mt-3 text-sm text-[var(--crm-ink-2)]">No email formats yet — <Link href="/crm/templates/new" className="underline">create one</Link> (channel: Email) first.</p>;
  }

  function submit() {
    setMsg("");
    const when = new Date(`${day}T${time}:00+05:30`);
    if (when.getTime() < Date.now() - 60_000 && !confirm("That time has already passed — send these emails right away?")) return;
    start(async () => {
      try {
        const r = await scheduleEmailAction({ ...target, templateId: Number(tplId), when: when.toISOString() });
        if (r.error) return setMsg(r.error);
        const skipped = r.skipped ? ` ${r.skipped} skipped (no email address).` : "";
        alert(`Scheduled ${r.scheduled} email${r.scheduled === 1 ? "" : "s"} for ${when.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}.${skipped}${r.emailReady ? "" : "\n\nGmail isn't connected yet — they'll wait and go out automatically once it is."}`);
        onDone();
      } catch {
        setMsg("Couldn't reach the server — check your connection and try again.");
      }
    });
  }

  return (
    <div className="mt-3 grid gap-3 border-t border-[var(--crm-line)] pt-3 lg:grid-cols-2">
      <div className="space-y-3">
        <label className="block">
          <span className="crm-label">Email format</span>
          <select value={tplId} onChange={(e) => setTplId(e.target.value)} className="crm-input">
            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="crm-label">Day</span>
            <input type="date" value={day} min={todayIst()} onChange={(e) => setDay(e.target.value)} className="crm-input" />
          </label>
          <label className="block">
            <span className="crm-label">Time (India)</span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="crm-input" />
          </label>
        </div>
        <p className="text-xs text-[var(--crm-ink-3)]">
          {emailReady
            ? "Sends from webora99@gmail.com at that time whenever the CRM is open, otherwise at the next automatic run (9 AM, 1 PM, 6 PM)."
            : "⚠ Gmail isn't connected yet (Settings). Emails are saved and will send automatically once it is."}
        </p>
        {msg && <p className="text-sm text-rose-300">{msg}</p>}
        <button disabled={pending || !tplId || !day} onClick={submit} className="crm-btn crm-btn-primary w-full sm:w-auto">
          {pending ? "Scheduling…" : "Schedule emails"}
        </button>
      </div>
      {preview && (
        <div className="rounded-xl bg-white p-4 text-[#1f2937]">
          <p className="mb-1 text-[11px] text-gray-500">Preview for {sample?.name}{sample?.email ? ` <${sample.email}>` : " (no email — will be skipped)"}</p>
          <p className="mb-2 border-b border-gray-200 pb-2 text-sm font-semibold">{preview.subject || "(no subject)"}</p>
          <p className="max-h-40 overflow-y-auto whitespace-pre-wrap text-[13px] leading-relaxed">{preview.body}</p>
        </div>
      )}
    </div>
  );
}
