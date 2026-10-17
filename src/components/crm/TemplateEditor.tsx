"use client";

import { useRef, useState, useTransition } from "react";
import { deleteTemplateAction, saveTemplateAction } from "@/app/crm/actions";
import { TEMPLATE_VARIABLES } from "@/lib/crm/config";
import { renderTemplate } from "@/lib/crm/template";
import { useRouter } from "next/navigation";

type Tpl = { id: number | null; name: string; channel: string; subject: string; body: string };
const SAMPLE = { name: "Arjun Menon", business: "Spice Route Cafe", service: "Business Website", agent_name: "Naveen" };

export function TemplateEditor({ initial }: { initial: Tpl }) {
  const router = useRouter();
  const [t, setT] = useState(initial);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  function insert(key: string) {
    const el = bodyRef.current;
    const token = `{{${key}}}`;
    if (!el) return setT((x) => ({ ...x, body: x.body + token }));
    const { selectionStart: a, selectionEnd: b } = el;
    const body = t.body.slice(0, a) + token + t.body.slice(b);
    setT((x) => ({ ...x, body }));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + token.length, a + token.length); });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form action={saveTemplateAction} className="crm-card space-y-4 p-5">
        {t.id && <input type="hidden" name="id" value={t.id} />}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
          <label>
            <span className="crm-label">Format name</span>
            <input name="name" required value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} className="crm-input" placeholder="e.g. Day 3 — portfolio share" />
          </label>
          <label>
            <span className="crm-label">Channel</span>
            <select name="channel" value={t.channel} onChange={(e) => setT({ ...t, channel: e.target.value })} className="crm-input">
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
            </select>
          </label>
        </div>
        {t.channel === "email" && (
          <label className="block">
            <span className="crm-label">Subject</span>
            <input name="subject" value={t.subject} onChange={(e) => setT({ ...t, subject: e.target.value })} className="crm-input" />
          </label>
        )}
        <label className="block">
          <span className="crm-label">Message</span>
          <textarea ref={bodyRef} name="body" required rows={12} value={t.body} onChange={(e) => setT({ ...t, body: e.target.value })} className="crm-input resize-y font-mono text-[13px] leading-relaxed" />
        </label>
        <div>
          <p className="crm-label">Insert a personal detail</p>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATE_VARIABLES.map((v) => (
              <button type="button" key={v.key} onClick={() => insert(v.key)} title={v.hint} className="rounded-md border border-[var(--crm-line)] px-2 py-1 font-mono text-[11px] text-[var(--crm-ink-2)] hover:bg-white/5">
                {`{{${v.key}}}`}
              </button>
            ))}
          </div>
        </div>
        {err && <p className="text-sm text-rose-300">{err}</p>}
        <div className="flex flex-wrap justify-between gap-2">
          <button className="crm-btn crm-btn-primary">Save format</button>
          {t.id && (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!confirm("Delete this message format?")) return;
                start(async () => {
                  const r = await deleteTemplateAction(t.id!);
                  if (r.error) setErr(r.error);
                  else router.push("/crm/templates");
                });
              }}
              className="crm-btn crm-btn-danger"
            >
              Delete
            </button>
          )}
        </div>
      </form>

      <section className="crm-card p-5">
        <h2 className="mb-1 text-sm font-semibold text-[var(--crm-ink-2)]">Preview</h2>
        <p className="mb-4 text-xs text-[var(--crm-ink-3)]">As a sample lead ({SAMPLE.name}, {SAMPLE.business}) would see it.</p>
        {t.channel === "whatsapp" ? (
          <div className="rounded-xl bg-[#0b141a] p-4">
            <div className="ml-auto max-w-[90%] whitespace-pre-wrap rounded-lg rounded-tr-none bg-[#005c4b] px-3 py-2 text-[14px] leading-snug text-[#e9edef]">
              {renderTemplate(t.body, SAMPLE) || "…"}
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-white p-5 text-[#1f2937]">
            <p className="mb-3 border-b border-gray-200 pb-2 text-sm font-semibold">{renderTemplate(t.subject, SAMPLE) || "(no subject)"}</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{renderTemplate(t.body, SAMPLE) || "…"}</p>
          </div>
        )}
      </section>
    </div>
  );
}
