"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { ensureGsapRegistered, gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { setLenisInstance } from "@/lib/smooth-scroll";

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
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenisInstance(lenis);

    return () => {
      setLenisInstance(null);
      lenis.destroy();
      gsap.ticker.remove(tick);
    };
  }, [reducedMotion]);

  return null;
}
