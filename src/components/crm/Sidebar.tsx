"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, UserPlus, Columns3, Workflow, Send, FileText, Settings, LogOut, Menu, X, ExternalLink, Shapes } from "lucide-react";
import { logoutAction } from "@/app/crm/actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/crm", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crm/leads", label: "Leads", icon: Users },
  { href: "/crm/leads/new", label: "Create lead", icon: UserPlus },
  { href: "/crm/domains", label: "Domains", icon: Shapes },
  { href: "/crm/pipeline", label: "Pipeline", icon: Columns3 },
  { href: "/crm/outbox", label: "Outbox", icon: Send, badge: "outbox" },
  { href: "/crm/followups", label: "Follow-ups", icon: Workflow },
  { href: "/crm/templates", label: "Message formats", icon: FileText },
  { href: "/crm/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar({ userName, outboxCount }: { userName: string; outboxCount: number }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/crm" ? path === "/crm" : href === "/crm/leads" ? path.startsWith(href) && !path.startsWith("/crm/leads/new") : path.startsWith(href);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon, ...rest }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
            isActive(href) ? "bg-white/10 text-white" : "text-[var(--crm-ink-2)] hover:bg-white/5 hover:text-white",
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.9} />
          <span className="flex-1">{label}</span>
          {"badge" in rest && outboxCount > 0 && (
            <span className="rounded-full bg-[#25d366] px-2 py-0.5 text-[11px] font-bold text-[#052e16]">{outboxCount}</span>
          )}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="mt-6 space-y-1 border-t border-[var(--crm-line)] pt-4">
      <a href="/" target="_blank" className="flex min-h-9 items-center gap-3 rounded-lg px-3 text-xs text-[var(--crm-ink-3)] hover:text-white">
        <ExternalLink className="h-3.5 w-3.5" /> View website
      </a>
      <form action={logoutAction}>
        <button className="flex min-h-9 w-full items-center gap-3 rounded-lg px-3 text-xs text-[var(--crm-ink-3)] hover:text-white">
          <LogOut className="h-3.5 w-3.5" /> Sign out {userName}
        </button>
      </form>
    </div>
  );

  const brand = (
    <Link href="/crm" className="flex items-center gap-2.5">
      <Image src="/logo-mark.png" alt="" width={30} height={30} />
      <span className="font-display text-base font-bold tracking-wide">WEBORA</span>
      <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--crm-ink-2)]">CRM</span>
    </Link>
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--crm-line)] bg-[var(--crm-bg)]/90 px-4 backdrop-blur lg:hidden">
        {brand}
        <button aria-label="Open menu" onClick={() => setOpen(true)} className="crm-btn crm-btn-ghost crm-btn-sm relative">
          <Menu className="h-4 w-4" />
          {outboxCount > 0 && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#25d366]" />}
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-[var(--crm-panel)] p-4">
            <div className="mb-6 flex items-center justify-between">
              {brand}
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="crm-btn crm-btn-ghost crm-btn-sm">
                <X className="h-4 w-4" />
              </button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      )}

      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--crm-line)] bg-[var(--crm-panel)]/60 p-4 lg:flex">
        <div className="mb-8 px-1 pt-1">{brand}</div>
        {nav}
        {footer}
      </aside>
    </>
  );
}
