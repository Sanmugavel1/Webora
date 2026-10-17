"use client";

import { useRef, useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { importLeadsAction } from "@/app/crm/actions";

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
  "mobile": "phone", "whatsapp": "phone", "phone number": "phone", "e-mail": "email",
  "project": "service", "looking for": "service", "amount": "value", "deal value": "value", "note": "notes",
};

export function ImportCsv() {
  const input = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  async function onFile(file: File) {
    const [head, ...body] = parseCsv(await file.text());
    if (!head) return setMsg("That file looks empty.");
    const keys = head.map((h) => { const k = h.trim().toLowerCase(); return ALIASES[k] ?? k; });
    if (!keys.includes("name")) return setMsg("Need a “name” column (plus phone/email, business, service…).");
    const rows = body.map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i] ?? ""])));
    start(async () => {
      const res = await importLeadsAction(rows);
      setMsg(`Imported ${res.created} new lead${res.created === 1 ? "" : "s"}${res.merged ? `, ${res.merged} matched existing` : ""}.`);
    });
  }

  return (
    <>
      <input ref={input} type="file" accept=".csv,text/csv" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      <button type="button" disabled={pending} onClick={() => input.current?.click()} className="crm-btn crm-btn-ghost" title="Columns: name, phone, email, business, service, source, value, tags, notes">
        <Upload className="h-4 w-4" /> {pending ? "Importing…" : "Import CSV"}
      </button>
      {msg && <p className="w-full text-right text-xs text-[var(--crm-ink-2)]">{msg}</p>}
    </>
  );
}
