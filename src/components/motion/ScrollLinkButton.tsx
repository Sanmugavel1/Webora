"use client";

import { Button } from "@/components/ui/Button";
import { scrollToSelector } from "@/lib/smooth-scroll";

interface ScrollLinkButtonProps {
  /** In-page target, e.g. "#work". */
  target: string;
  variant?: "primary" | "secondary" | "ghost";
  showArrow?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * A Button that smooth-scrolls to an in-page section instead of navigating.
 * Isolated as its own Client Component so server-rendered sections (Hero,
 * etc.) can use it without themselves needing "use client" — a Server
 * Component can't hand a closure straight to Button, only reference a
 * Client Component that owns one.
 */
export function ScrollLinkButton({
  target,
  variant = "secondary",
  showArrow,
  className,
  children,
}: ScrollLinkButtonProps) {
  return (
    <Button
      variant={variant}
      showArrow={showArrow}
      className={className}
      onClick={() => scrollToSelector(target)}
    >
      {children}
    </Button>
  );
}
