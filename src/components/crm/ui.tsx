import Link from "next/link";
import { stageOf } from "@/lib/crm/config";
import { cn } from "@/lib/utils";

export function PageTitle({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-[1.7rem]">{title}</h1>
        {sub && <p className="mt-1 text-sm text-[var(--crm-ink-3)]">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StageBadge({ stage, className }: { stage: string; className?: string }) {
  const s = stageOf(stage);
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", className)}
      style={{ background: `${s.color}1f`, color: s.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

export function ChannelBadge({ channel }: { channel: string }) {
  return channel === "email" ? (
    <span className="rounded-md bg-[#4c9aff]/15 px-2 py-0.5 text-[11px] font-semibold text-[#8fbcff]">Email</span>
  ) : (
    <span className="rounded-md bg-[#25d366]/15 px-2 py-0.5 text-[11px] font-semibold text-[#5ee39a]">WhatsApp</span>
  );
}

export function Card({ title, action, children, className }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("crm-card p-5", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-sm font-semibold text-[var(--crm-ink-2)]">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Empty({ children, href, cta }: { children: React.ReactNode; href?: string; cta?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--crm-line)] px-4 py-8 text-center text-sm text-[var(--crm-ink-3)]">
      {children}
      {href && cta && (
        <div className="mt-3">
          <Link href={href} className="crm-btn crm-btn-ghost crm-btn-sm">{cta}</Link>
        </div>
      )}
    </div>
  );
}
