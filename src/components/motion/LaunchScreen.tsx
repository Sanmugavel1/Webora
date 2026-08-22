"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "webora-launch-seen";

type Step = 0 | 1 | 2 | 3; // logo -> statement -> process -> final
const STEP_HOLD_MS = [950, 950, 750, 800];

const PROCESS_WORDS = ["IDEA", "DESIGN", "BUILD", "LAUNCH"];

const PARTICLES = [
  { top: "18%", left: "12%", size: 5, color: "var(--color-blue-soft)", delay: "0s" },
  { top: "72%", left: "18%", size: 3, color: "var(--color-violet-soft)", delay: "0.6s" },
  { top: "28%", left: "86%", size: 4, color: "var(--color-teal)", delay: "1.2s" },
  { top: "80%", left: "80%", size: 3, color: "var(--color-blue-soft)", delay: "0.3s" },
  { top: "52%", left: "6%", size: 3, color: "var(--color-violet-soft)", delay: "1.5s" },
  { top: "10%", left: "58%", size: 4, color: "var(--color-teal)", delay: "0.9s" },
];

const GRAIN_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * Cinematic pre-loader played once per browser session before the main
 * site: dark screen -> logo reveal -> brand statement -> process beats ->
 * closing line, then a fade into the page underneath (which is already
 * mounted, not blocked). Returning visitors within the same session and
 * prefers-reduced-motion get a near-instant pass-through instead of the
 * full sequence — see STORAGE_KEY / reducedMotion below.
 */
export function LaunchScreen() {
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(true);
  const [dismissing, setDismissing] = useState(false);
  const [step, setStep] = useState<Step>(0);
  const [stepVisible, setStepVisible] = useState(true);
  const [quickMode, setQuickMode] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Non-fatal — worst case, the full sequence plays again next visit.
    }
    setDismissing(true);
    setTimeout(() => setMounted(false), 600);
  }, []);

  useEffect(() => {
    const timerList: ReturnType<typeof setTimeout>[] = [];
    timers.current = timerList;
    const schedule = (fn: () => void, ms: number) => {
      const t = setTimeout(fn, ms);
      timerList.push(t);
      return t;
    };

    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // Storage unavailable (privacy mode, etc.) — treat as a first visit.
    }

    if (reducedMotion) {
      schedule(finish, 300);
      return () => timerList.forEach(clearTimeout);
    }

    if (alreadySeen) {
      // Deferred a tick so this doesn't set state synchronously mid-effect.
      schedule(() => setQuickMode(true), 0);
      schedule(finish, 600);
      return () => timerList.forEach(clearTimeout);
    }

    schedule(() => setShowSkip(true), 500);

    let elapsed = 0;
    for (let i = 1; i < STEP_HOLD_MS.length; i++) {
      elapsed += STEP_HOLD_MS[i - 1];
      schedule(() => {
        setStepVisible(false);
        schedule(() => {
          setStep(i as Step);
          setStepVisible(true);
        }, 220);
      }, elapsed);
    }
    elapsed += STEP_HOLD_MS[STEP_HOLD_MS.length - 1];
    schedule(finish, elapsed);

    return () => timerList.forEach(clearTimeout);
  }, [reducedMotion, finish]);

  useEffect(() => {
    if (!mounted) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mounted]);

  function handleSkip() {
    timers.current.forEach(clearTimeout);
    finish();
  }

  if (!mounted) return null;

  const showFullSequence = !reducedMotion && !quickMode;

  return (
    <div
      role="presentation"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-navy-deep transition-opacity ease-out",
        dismissing ? "opacity-0" : "opacity-100",
      )}
      style={{ transitionDuration: "600ms" }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-mesh opacity-70" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: GRAIN_BG }}
      />

      {showFullSequence && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="absolute rounded-full motion-safe:animate-[launch-particle_4s_ease-in-out_infinite]"
              style={{
                top: p.top,
                left: p.left,
                width: p.size,
                height: p.size,
                background: p.color,
                animationDelay: p.delay,
              }}
            />
          ))}
        </div>
      )}

      {showFullSequence && showSkip && !dismissing && (
        <button
          type="button"
          onClick={handleSkip}
          className="eyebrow absolute right-5 top-5 z-10 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase text-mist backdrop-blur-sm transition-colors duration-300 hover-fine:hover:border-white/40 hover-fine:hover:text-white sm:right-8 sm:top-8"
        >
          Skip →
        </button>
      )}

      <div
        className={cn("relative flex flex-col items-center px-6 text-center transition-opacity duration-300", stepVisible ? "opacity-100" : "opacity-0")}
      >
        {!showFullSequence ? (
          <LaunchLogo animate={false} />
        ) : (
          <>
            {step === 0 && <LaunchLogo animate />}
            {step === 1 && <LaunchStatement />}
            {step === 2 && <LaunchProcess />}
            {step === 3 && <LaunchFinal />}
          </>
        )}
      </div>

      <style>{`
        @keyframes launch-logo-in {
          0% { opacity: 0; transform: scale(0.85); filter: blur(8px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes launch-letter-in {
          0% { opacity: 0; transform: translateY(14px); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes launch-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes launch-particle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}

function LaunchLogo({ animate }: { animate: boolean }) {
  const letters = "WEBORA".split("");
  return (
    <div className="flex flex-col items-center gap-5">
      <div
        className={cn("relative h-14 w-14 sm:h-20 sm:w-20", animate && "motion-safe:animate-[launch-logo-in_0.9s_cubic-bezier(0.16,1,0.3,1)_both]")}
      >
        <Image src="/logo-mark.png" alt="" fill sizes="80px" priority className="object-contain" />
      </div>
      <div className="font-display flex text-4xl font-bold tracking-[0.06em] text-white sm:text-6xl">
        {letters.map((ch, i) => (
          <span
            key={i}
            className={animate ? "motion-safe:animate-[launch-letter-in_0.6s_cubic-bezier(0.16,1,0.3,1)_both]" : ""}
            style={animate ? { animationDelay: `${180 + i * 60}ms` } : undefined}
          >
            {ch}
          </span>
        ))}
      </div>
    </div>
  );
}

function LaunchStatement() {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="font-display text-2xl font-bold text-white motion-safe:animate-[launch-fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both] sm:text-4xl">
        WE BUILD WEBSITES
      </p>
      <p
        className="font-display text-2xl font-bold text-gradient motion-safe:animate-[launch-fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both] sm:text-4xl"
        style={{ animationDelay: "160ms" }}
      >
        THAT GROW BRANDS.
      </p>
    </div>
  );
}

function LaunchProcess() {
  return (
    <div className="flex max-w-sm flex-wrap items-center justify-center gap-x-3 gap-y-3 sm:max-w-none sm:gap-x-4">
      {PROCESS_WORDS.map((word, i) => (
        <span key={word} className="flex items-center gap-x-3 sm:gap-x-4">
          <span
            className="eyebrow font-display text-sm font-semibold text-white motion-safe:animate-[launch-fade-up_0.4s_cubic-bezier(0.16,1,0.3,1)_both] sm:text-lg"
            style={{ animationDelay: `${i * 130}ms` }}
          >
            {word}
          </span>
          {i < PROCESS_WORDS.length - 1 && (
            <span className="text-blue-soft/60" aria-hidden="true">
              →
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

function LaunchFinal() {
  return (
    <p className="font-display max-w-xs text-xl font-bold text-white motion-safe:animate-[launch-fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both] sm:max-w-md sm:text-3xl">
      LET&rsquo;S BUILD SOMETHING THAT MATTERS.
    </p>
  );
}
