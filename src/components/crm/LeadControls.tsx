"use client";

import { useState, useTransition } from "react";
import { Mail, MessageCircle, Phone, Reply } from "lucide-react";
import { markRepliedAction, moveStageAction, sendMessageAction, whatsappOpenedAction } from "@/app/crm/actions";
import { STAGES, type StageId } from "@/lib/crm/config";
import { mailtoLink, renderTemplate, waLink } from "@/lib/crm/template";
import { cn } from "@/lib/utils";

type LeadLite = { id: number; name: string; business: string; domain: string; service: string; agent_name: string | null; phone: string; email: string; stage: StageId };
type Tpl = { id: number; name: string; channel: string; subject: string; body: string; domain: string };

export function StageBar({ id, stage }: { id: number; stage: StageId }) {
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useState(stage);
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Stage">
      {STAGES.map((s) => {
        const active = optimistic === s.id;
        return (
          <button
            key={s.id}
            disabled={pending}
            onClick={() => { setOptimistic(s.id); start(() => moveStageAction(id, s.id)); }}
            aria-pressed={active}
            className={cn("crm-btn crm-btn-sm border", active ? "text-[#061427]" : "border-[var(--crm-line)] bg-transparent text-[var(--crm-ink-2)] hover:bg-white/5")}
            style={active ? { background: s.color, borderColor: s.color } : undefined}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

export function QuickActions({ lead }: { lead: LeadLite }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap gap-2">
      {lead.phone && (
        <>
          <a href={waLink(lead.phone, `Hi ${lead.name.split(" ")[0]}, `)} target="_blank" rel="noopener noreferrer" onClick={() => start(() => whatsappOpenedAction(lead.id))} className="crm-btn crm-btn-wa crm-btn-sm"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>
          <a href={`tel:${lead.phone}`} className="crm-btn crm-btn-ghost crm-btn-sm"><Phone className="h-3.5 w-3.5" /> Call</a>
        </>
      )}
      {lead.email && <a href={`mailto:${lead.email}`} className="crm-btn crm-btn-ghost crm-btn-sm"><Mail className="h-3.5 w-3.5" /> Email</a>}
      <button disabled={pending} onClick={() => start(() => markRepliedAction(lead.id))} className="crm-btn crm-btn-ghost crm-btn-sm" title="Stops automated follow-ups for this lead">
        <Reply className="h-3.5 w-3.5" /> They replied
      </button>
    </div>
  );
}

export function Composer({ lead, templates, emailReady }: { lead: LeadLite; templates: Tpl[]; emailReady: boolean }) {
  const [channel, setChannel] = useState<"whatsapp" | "email">(lead.phone || !lead.email ? "whatsapp" : "email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  // This lead's domain formats first, then the all-domain ones.
  const own = (t: Tpl) => !!lead.domain && t.domain.toLowerCase() === lead.domain.toLowerCase();
  const list = templates.filter((t) => t.channel === channel && (!t.domain || own(t))).sort((a, b) => Number(own(b)) - Number(own(a)));
  const target = channel === "email" ? lead.email : lead.phone;

  function applyTemplate(id: string) {
    const t = templates.find((x) => String(x.id) === id);
    if (!t) return;
    setSubject(renderTemplate(t.subject, lead));
    setBody(renderTemplate(t.body, lead));
  }

  function send() {
    setNote("");
    if (channel === "whatsapp") {
      window.open(waLink(lead.phone, body), "_blank", "noopener");
      start(async () => { await sendMessageAction({ leadId: lead.id, channel, subject: "", body, manual: true }); setBody(""); setNote("Logged as sent."); });
    } else if (emailReady) {
      start(async () => {
        const r = await sendMessageAction({ leadId: lead.id, channel, subject, body, manual: false });
        if (r.status === "sent") { setBody(""); setSubject(""); }
        setNote(r.status === "sent" ? "Email sent." : `Not sent: ${r.error || r.status}`);
      });
    } else {
      window.location.href = mailtoLink(lead.email, subject, body);
      start(async () => { await sendMessageAction({ leadId: lead.id, channel, subject, body, manual: true }); setNote("Opened in your mail app and logged."); });
    }
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-[var(--crm-line)] p-0.5">
          {(["whatsapp", "email"] as const).map((c) => (
            <button key={c} onClick={() => setChannel(c)} className={cn("rounded-md px-3 py-1.5 text-xs font-semibold", channel === c ? "bg-white/10 text-white" : "text-[var(--crm-ink-3)]")}>
              {c === "email" ? "Email" : "WhatsApp"}
            </button>
          ))}
        </div>
        <select onChange={(e) => { applyTemplate(e.target.value); e.target.value = ""; }} defaultValue="" className="crm-input w-auto min-w-0 flex-1" aria-label="Insert message format">
          <option value="" disabled>Insert a message format…</option>
          {list.map((t) => <option key={t.id} value={t.id}>{t.domain ? `${t.domain} · ` : ""}{t.name}</option>)}
        </select>
      </div>
      {channel === "email" && <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="crm-input mb-2" />}
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder={target ? `Write to ${target}…` : `This lead has no ${channel === "email" ? "email" : "phone number"} yet.`} className="crm-input resize-y" />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-[var(--crm-ink-3)]">
          {note || (channel === "whatsapp" ? "Opens WhatsApp with this message ready — just tap send." : emailReady ? "Sends from your connected Gmail." : "Opens your mail app (connect Gmail in Settings to send directly).")}
        </span>
        <button disabled={pending || !body.trim() || !target} onClick={send} className={cn("crm-btn", channel === "whatsapp" ? "crm-btn-wa" : "crm-btn-primary")}>
          {pending ? "Sending…" : channel === "whatsapp" ? "Open in WhatsApp" : "Send email"}
        </button>
      </div>
    </div>
  );
}

export function ConfirmSubmit({ label, message, className }: { label: string; message: string; className?: string }) {
  return (
    <button className={className} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>
      {label}
    </button>
  );
}
