"use client";

import { useEffect, useRef, useState } from "react";
import { ensureGsapRegistered, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { NetworkGlobe } from "@/components/three/NetworkGlobe";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

const FLOW_STEPS = [
  { label: "Business", threshold: 0.05 },
  { label: "Webora", threshold: 0.32 },
  { label: "Customers", threshold: 0.6 },
  { label: "World", threshold: 0.85 },
];

/**
 * WEBORA's signature visual moment: a single business node expands into a
 * full global network as the section scrolls into view.
 */
export function SignatureNetwork() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!sectionRef.current || reducedMotion) {
      setProgress(1);
      return;
    }
    ensureGsapRegistered();

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 75%",
      end: "bottom 55%",
      scrub: 0.8,
      onUpdate: (self) => setProgress(self.progress),
    });

    return () => trigger.kill();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-navy py-24 sm:py-28 lg:py-36"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,rgba(22,119,255,0.14),transparent)]"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4 text-xs font-semibold uppercase text-blue-soft">
            Our Signature
          </p>
          <h2 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
            FROM LOCAL
            <br />
            TO GLOBAL.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-mist sm:text-lg">
            We connect businesses with the people looking for them.
          </p>
        </Reveal>

        <div className="relative mx-auto mt-4 h-[380px] w-full max-w-4xl sm:h-[480px] lg:h-[600px]">
          <NetworkGlobe variant="signature" className="h-full w-full" progress={progress} />
        </div>

        <div className="mx-auto -mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-x-3 gap-y-4 sm:gap-x-4">
          {FLOW_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              <span
                className={cn(
                  "font-display text-sm font-semibold tracking-wide transition-colors duration-500 sm:text-base",
                  progress >= step.threshold ? "text-white" : "text-white/25",
                )}
              >
                {step.label.toUpperCase()}
              </span>
              {i < FLOW_STEPS.length - 1 && (
                <span
                  className={cn(
                    "h-px w-6 transition-colors duration-500 sm:w-10",
                    progress >= FLOW_STEPS[i + 1].threshold ? "bg-blue" : "bg-white/15",
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
