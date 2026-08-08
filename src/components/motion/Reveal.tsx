"use client";

import { useEffect, useRef } from "react";
import { ensureGsapRegistered, gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in seconds, useful when several Reveals sit in a row. */
  delay?: number;
  y?: number;
  as?: "div" | "span";
}

/**
 * Fades + lifts its children into place once they scroll into view.
 * Fast, GPU-friendly (opacity/transform only) and fully skipped for users
 * who prefer reduced motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!ref.current || reducedMotion) return;
    ensureGsapRegistered();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            once: true,
          },
        },
      );
    }, ref);

    return () => ctx.revert();
  }, [reducedMotion, delay, y]);

  const Tag = as;

  return (
    <Tag
      ref={ref as never}
      className={cn(className)}
      style={reducedMotion ? undefined : { opacity: 0 }}
    >
      {children}
    </Tag>
  );
}
