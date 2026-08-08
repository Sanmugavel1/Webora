"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ensureGsapRegistered, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

export interface ProcessTimelineStep {
  index: string;
  title: string;
  description: string;
  /** Pre-rendered so the icon component itself never crosses the server/client boundary. */
  icon: ReactNode;
}

interface ProcessTimelineProps {
  steps: ProcessTimelineStep[];
}

export function ProcessTimeline({ steps }: ProcessTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!containerRef.current || reducedMotion) {
      setProgress(1);
      return;
    }
    ensureGsapRegistered();

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 70%",
      end: "bottom 60%",
      scrub: 0.7,
      onUpdate: (self) => setProgress(self.progress),
    });

    return () => trigger.kill();
  }, [reducedMotion]);

  const activeIndex = Math.min(steps.length - 1, Math.floor(progress * steps.length));

  return (
    <div ref={containerRef} className="relative">
      {/* Connecting line */}
      <div
        aria-hidden="true"
        className="absolute left-6 top-2 h-[calc(100%-1rem)] w-px bg-white/10 lg:left-0 lg:top-6 lg:h-px lg:w-full"
      />
      <div
        aria-hidden="true"
        className="absolute left-6 top-2 h-[calc(100%-1rem)] w-px origin-top bg-blue transition-transform duration-150 ease-out lg:left-0 lg:top-6 lg:h-px lg:w-full lg:origin-left"
        style={{ transform: `scale(${reducedMotion ? 1 : progress})` }}
      />

      <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-6">
        {steps.map((step, i) => {
          const reached = i <= activeIndex;
          const isCurrent = i === activeIndex;

          return (
            <div key={step.index} className="relative flex gap-5 lg:flex-col lg:gap-0">
              <div
                className={cn(
                  "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-navy transition-all duration-500",
                  reached ? "border-blue text-blue-soft" : "border-white/15 text-white/30",
                  isCurrent && "scale-110 shadow-[0_0_0_6px_rgba(22,119,255,0.18)]",
                )}
              >
                {step.icon}
              </div>

              <div className="lg:mt-6">
                <p
                  className={cn(
                    "font-display text-xs font-semibold tracking-widest transition-colors duration-500",
                    reached ? "text-blue-soft" : "text-white/30",
                  )}
                >
                  {step.index}
                </p>
                <h3 className="font-display mt-1.5 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[200px] text-sm leading-relaxed text-mist">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
