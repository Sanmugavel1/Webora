"use client";

import { useEffect, useRef } from "react";

/**
 * A subtle radial glow that follows the pointer within its parent section.
 * Desktop-only by design (mousemove never fires meaningfully on touch), and
 * cheap: a single translated div, no state, no re-renders.
 */
export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const parent = glowRef.current?.parentElement;
    if (!parent) return;

    const onMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      target.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    parent.addEventListener("mousemove", onMove);

    let frame: number;
    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.08;
      current.current.y += (target.current.y - current.current.y) * 0.08;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      parent.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 -z-0 hidden h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue/[0.12] blur-[100px] lg:block"
    />
  );
}
