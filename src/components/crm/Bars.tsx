/**
 * Minimal single-series bar charts (one hue, labelled rows) — native
 * `title` tooltips give per-bar hover values without a chart library.
 */
export function HBars({ rows, format = (n) => String(n) }: { rows: { label: string; value: number; sub?: string }[]; format?: (n: number) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="space-y-2.5" role="table">
      {rows.map((r) => (
        <div key={r.label} role="row" className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-3 text-sm" title={`${r.label}: ${format(r.value)}`}>
          <span role="cell" className="truncate text-[var(--crm-ink-2)]">{r.label}</span>
          <span className="h-2.5 rounded-full bg-white/[0.05]">
            <span className="block h-full rounded-full bg-[#4c9aff]" style={{ width: `${(r.value / max) * 100}%`, minWidth: r.value ? 6 : 0 }} />
          </span>
          <span role="cell" className="min-w-10 text-right tabular-nums text-[var(--crm-ink)]">
            {format(r.value)}
            {r.sub && <span className="ml-1.5 text-xs text-[var(--crm-ink-3)]">{r.sub}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ColumnBars({ cols }: { cols: { label: string; value: number }[] }) {
  const max = Math.max(1, ...cols.map((c) => c.value));
  const total = cols.reduce((a, c) => a + c.value, 0);
  return (
    <div>
      <div className="flex h-36 items-end gap-[3px]">
        {cols.map((c, i) => (
          <div key={i} className="group relative flex h-full flex-1 items-end" title={`${c.label}: ${c.value} lead${c.value === 1 ? "" : "s"}`}>
            <div className="w-full rounded-t-[4px] bg-[#4c9aff] transition-opacity group-hover:opacity-80" style={{ height: `${(c.value / max) * 100}%`, minHeight: c.value ? 4 : 1, opacity: c.value ? 1 : 0.15 }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-[var(--crm-ink-3)]">
        <span>{cols[0]?.label}</span>
        <span>{total} total</span>
        <span>{cols.at(-1)?.label}</span>
      </div>
    </div>
  );
}
