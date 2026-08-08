"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu on route change — adjusted during render (per
  // React's "you might not need an effect" guidance) rather than in an
  // effect, so it can't cause an extra cascading render.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "glass-dark fixed inset-x-0 top-0 z-50 border-x-0 border-t-0 transition-shadow duration-300",
        scrolled && "shadow-[0_8px_32px_rgba(2,8,20,0.35)]",
      )}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:h-20 lg:px-10"
        aria-label="Primary"
      >
        <Logo variant="light" priority />

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "relative text-sm font-medium transition-colors duration-200",
                    isActive ? "text-white" : "text-mist hover:text-white",
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full"
                      style={{ background: "var(--gradient-primary)" }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden lg:block">
          <Button href="/contact" variant="primary" className="!px-5 !py-2.5 text-xs">
            START A PROJECT
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-white lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col bg-navy px-6 pt-6 pb-10 transition-all duration-300 lg:hidden",
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <ul className="flex flex-1 flex-col gap-2">
          {NAV_LINKS.map((link, i) => {
            const isActive = pathname === link.href;
            return (
              <li
                key={link.href}
                className={cn(
                  "border-b border-white/[0.06] transition-all duration-500",
                  menuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                )}
                style={{ transitionDelay: menuOpen ? `${80 + i * 60}ms` : "0ms" }}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "font-display flex min-h-14 items-center text-2xl font-semibold",
                    isActive ? "text-gradient" : "text-white",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <Button href="/contact" variant="primary" className="mt-6 w-full justify-center">
          START A PROJECT
        </Button>
      </div>
    </header>
  );
}
