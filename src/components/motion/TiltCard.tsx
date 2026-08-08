"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Glass tone — "dark" for navy sections, "light" for pale sections. */
  tone?: "dark" | "light";
  /** Adds a hairline gradient ring around the card. */
  gradientBorder?: boolean;
  as?: "div" | "article";
}

/**
 * The shared "3D glass card" used across the Problem, Services and Pricing
 * pages: a frosted glass panel that tilts subtly toward the pointer on
 * desktop (perspective transform, GPU-cheap), catches a soft light "shine"
 * that follows the cursor, and stays perfectly flat and tap-friendly on
 * touch devices.
 */
export function TiltCard({
  children,
  className,
  tone = "dark",
  gradientBorder = false,
  as = "div",
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1000px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg) translateY(-6px) scale(1.01)`;
    card.style.setProperty("--shine-x", `${(px + 0.5) * 100}%`);
    card.style.setProperty("--shine-y", `${(py + 0.5) * 100}%`);
  };

  const handleLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = "";
  };

  const Tag = as;

  return (
    <Tag
      ref={cardRef as never}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn(
        "group relative rounded-2xl transition-shadow duration-300 ease-out will-change-transform",
        tone === "dark" ? "glass-dark shadow-[0_20px_50px_rgba(2,8,20,0.35)]" : "glass-light shadow-[0_20px_50px_rgba(7,26,51,0.1)]",
        gradientBorder && "gradient-border",
        className,
      )}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
      {/* Cursor-tracked glass "shine" — desktop only, purely decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 hover-fine:group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(360px circle at var(--shine-x, 50%) var(--shine-y, 50%), rgba(255,255,255,0.14), transparent 45%)",
        }}
      />
    </Tag>
  );
}
