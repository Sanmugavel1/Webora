"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { finishImportAction, importLeadsAction } from "@/app/crm/actions";

/** RFC-4180-ish CSV parse — enough for spreadsheets exported from Excel/Sheets. */
function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim()));
}

const ALIASES: Record<string, string> = {
  "full name": "name", "contact": "name", "business name": "business", "company": "business",
  "category": "domain", "industry": "domain", "business type": "domain", "type": "domain",
  "mobile": "phone", "whatsapp": "phone", "phone number": "phone", "e-mail": "email",
  "project": "service", "looking for": "service", "amount": "value", "deal value": "value", "note": "notes",
};

const BATCH = 100;

export function ImportCsv() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [followups, setFollowups] = useState(true);

  async function onFile(file: File) {
    setMsg("");
    const [head, ...body] = parseCsv((await file.text()).replace(/^\uFEFF/, ""));
    if (!head) return setMsg("That file looks empty.");
    const keys = head.map((h) => { const k = h.trim().toLowerCase(); return ALIASES[k] ?? k; });
    if (!keys.includes("name")) return setMsg("Need a “name” column (plus phone/email, business, service…).");
    const rows = body.map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i] ?? ""])));

    // Small batches, one after another: each request stays quick, a slow
    // network can't time out the whole file, and progress is visible.
    let created = 0, merged = 0, failed = 0;
    setProgress({ done: 0, total: rows.length });
    for (let i = 0; i < rows.length; i += BATCH) {
      const chunk = rows.slice(i, i + BATCH);
      let ok = false;
      for (let attempt = 0; attempt < 3 && !ok; attempt++) {
        try {
          const res = await importLeadsAction(chunk, followups);
          created += res.created;
          merged += res.merged;
          ok = true;
        } catch {
          await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
        }
      }
      if (!ok) failed += chunk.length;
      setProgress({ done: Math.min(i + BATCH, rows.length), total: rows.length });
    }
    await finishImportAction().catch(() => {});
    setProgress(null);
    setMsg(
      `Imported ${created} new lead${created === 1 ? "" : "s"}${merged ? `, ${merged} matched existing` : ""}` +
        (failed ? ` — ${failed} row${failed === 1 ? "" : "s"} couldn’t be saved (network?), try importing the file again; duplicates are merged.` : "."),
    );
    router.refresh();
  }

  const busy = progress !== null;
  return (
    <div className="flex flex-col items-end gap-1.5">
      <input ref={input} type="file" accept=".csv,text/csv" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-[var(--crm-ink-2)]" title="Puts imported leads into your active “new lead” follow-up sequences">
          <input type="checkbox" checked={followups} disabled={busy} onChange={(e) => setFollowups(e.target.checked)} className="accent-[var(--color-blue)]" />
          Start follow-ups
        </label>
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className="crm-btn crm-btn-ghost" title="Columns: name, phone, email, business, domain, service, source, value, tags, notes">
          <Upload className="h-4 w-4" /> {busy ? `Importing ${progress.done} / ${progress.total}…` : "Import CSV"}
        </button>
      </div>
      {busy && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={progress.done} aria-valuemax={progress.total}>
          <div className="h-full rounded-full bg-[var(--color-blue)] transition-[width] duration-300" style={{ width: `${(progress.done / Math.max(1, progress.total)) * 100}%` }} />
        </div>
      )}
      {msg && <p className="max-w-xs text-right text-xs text-[var(--crm-ink-2)]">{msg}</p>}
    </div>
  );
}
