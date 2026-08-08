"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { ensureGsapRegistered, gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

/**
 * Drives inertia-based smooth scrolling and keeps GSAP ScrollTrigger in sync
 * with it. Renders nothing — it only wires up side effects for its children.
 */
export function SmoothScroll() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    ensureGsapRegistered();
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(ScrollTrigger.update);
    };
  }, [reducedMotion]);

  return null;
}
