"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowDown, Plus, Trash2 } from "lucide-react";
import { saveSequenceAction } from "@/app/crm/actions";
import { TRIGGERS, type Channel, type SequenceStep } from "@/lib/crm/config";

type Tpl = { id: number; name: string; channel: string };
type Seq = { id: number | null; name: string; description: string; trigger: string; active: boolean; steps: SequenceStep[] };

export function SequenceEditor({ initial, templates }: { initial: Seq; templates: Tpl[] }) {
  const router = useRouter();
  const [seq, setSeq] = useState(initial);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const set = (patch: Partial<Seq>) => setSeq((s) => ({ ...s, ...patch }));
  const setStep = (i: number, patch: Partial<SequenceStep>) =>
    set({ steps: seq.steps.map((st, j) => (j === i ? { ...st, ...patch } : st)) });

  function addStep() {
    const last = seq.steps.at(-1);
    const channel: Channel = last?.channel === "whatsapp" ? "email" : "whatsapp";
    set({ steps: [...seq.steps, { day: (last?.day ?? -2) + 2, channel, templateId: templates.find((t) => t.channel === channel)?.id ?? 0 }] });
  }

  function save() {
    setError("");
    start(async () => {
      const r = await saveSequenceAction(seq);
      if (r.error) setError(r.error);
      else router.push("/crm/followups");
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
      <section className="crm-card space-y-4 p-5">
        <label className="block">
          <span className="crm-label">Sequence name</span>
          <input value={seq.name} onChange={(e) => set({ name: e.target.value })} className="crm-input" placeholder="e.g. Restaurant leads nurture" />
        </label>
        <label className="block">
          <span className="crm-label">Description</span>
          <textarea value={seq.description} onChange={(e) => set({ description: e.target.value })} rows={2} className="crm-input resize-y" />
        </label>
        <label className="block">
          <span className="crm-label">Start automatically</span>
          <select value={seq.trigger} onChange={(e) => set({ trigger: e.target.value })} className="crm-input">
            {TRIGGERS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={seq.active} onChange={(e) => set({ active: e.target.checked })} className="h-4 w-4 accent-[#1677ff]" />
          Active
        </label>
        <div className="rounded-lg bg-white/[0.03] p-3 text-xs leading-relaxed text-[var(--crm-ink-3)]">
          Each step runs on its day, counted from when the lead entered the sequence. The sequence stops by itself when you
          tap <b>They replied</b>, move the lead past Contacted, or close it as Won/Lost. You can also start any sequence by
          hand from a lead’s page.
        </div>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <div className="flex gap-2">
          <button disabled={pending} onClick={save} className="crm-btn crm-btn-primary">{pending ? "Saving…" : "Save sequence"}</button>
          <button onClick={() => router.back()} className="crm-btn crm-btn-ghost">Cancel</button>
        </div>
      </section>

      <section className="crm-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-[var(--crm-ink-2)]">Steps</h2>
        <ol className="space-y-2">
          {seq.steps.map((st, i) => (
            <li key={i}>
              {i > 0 && <ArrowDown className="mx-auto mb-2 h-4 w-4 text-[var(--crm-ink-3)]" />}
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--crm-line)] p-3">
                <span className="text-xs font-semibold text-[var(--crm-ink-3)]">#{i + 1}</span>
                <label className="flex items-center gap-1.5 text-sm">
                  Day
                  <input type="number" min={0} max={365} value={st.day} onChange={(e) => setStep(i, { day: Number(e.target.value) })} className="crm-input w-16 text-center" aria-label="Day" />
                </label>
                <select
                  value={st.channel}
                  onChange={(e) => {
                    const channel = e.target.value as Channel;
                    setStep(i, { channel, templateId: templates.find((t) => t.channel === channel)?.id ?? 0 });
                  }}
                  className="crm-input w-auto"
                  aria-label="Channel"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                </select>
                <select value={st.templateId} onChange={(e) => setStep(i, { templateId: Number(e.target.value) })} className="crm-input min-w-0 flex-1 basis-40" aria-label="Message format">
                  <option value={0} disabled>Pick a message format</option>
                  {templates.filter((t) => t.channel === st.channel).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <button onClick={() => set({ steps: seq.steps.filter((_, j) => j !== i) })} className="crm-btn crm-btn-ghost crm-btn-sm" aria-label="Remove step">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ol>
        <button onClick={addStep} className="crm-btn crm-btn-ghost mt-3 w-full"><Plus className="h-4 w-4" /> Add step</button>
      </section>
    </div>
  );
}
