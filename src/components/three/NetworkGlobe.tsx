"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useWebglSupport } from "@/lib/hooks/use-webgl-support";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useInView } from "@/lib/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { Scene } from "./Scene";
import { GlobeFallback } from "./GlobeFallback";
import { ThreeErrorBoundary } from "./ThreeErrorBoundary";

export type GlobeVariant = "hero" | "signature" | "cta";

interface NetworkGlobeProps {
  variant: GlobeVariant;
  className?: string;
  /** 0 → 1 scroll-driven reveal, only used by the "signature" variant. */
  progress?: number;
}

const VARIANT_CONFIG: Record<
  GlobeVariant,
  { desktopNodes: number; mobileNodes: number; neighbors: number; withReveal: boolean; rotateSpeed: number }
> = {
  hero: { desktopNodes: 180, mobileNodes: 90, neighbors: 3, withReveal: false, rotateSpeed: 0.05 },
  signature: { desktopNodes: 220, mobileNodes: 110, neighbors: 3, withReveal: true, rotateSpeed: 0.02 },
  cta: { desktopNodes: 140, mobileNodes: 70, neighbors: 3, withReveal: false, rotateSpeed: 0.06 },
};

/**
 * The WEBORA signature visual: a network globe of glowing nodes and thin
 * connections. Automatically falls back to a static graphic when WebGL is
 * unavailable, and scales complexity down for mobile / reduced-motion.
 */
export function NetworkGlobe({ variant, className, progress = 1 }: NetworkGlobeProps) {
  const webglSupported = useWebglSupport();
  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const config = VARIANT_CONFIG[variant];
  const [inViewRef, inView] = useInView<HTMLDivElement>("240px");

  if (webglSupported === false) {
    return <GlobeFallback className={className} animate={!reducedMotion} />;
  }

  // Wait for the client-only WebGL check before mounting the canvas.
  if (webglSupported === null) {
    return <div className={cn(className, "opacity-0")} aria-hidden="true" />;
  }

  return (
    <ThreeErrorBoundary fallback={<GlobeFallback className={className} animate={!reducedMotion} />}>
      <div ref={inViewRef} className={cn(className)} aria-hidden="true">
        <Canvas
          dpr={[1, isDesktop ? 2 : 1.5]}
          camera={{ position: [0, 0, 6.2], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          // Pausing the render loop off-screen keeps multiple globes on a
          // page (hero + CTA band, etc.) from all animating at once forever.
          frameloop={inView ? "always" : "never"}
        >
          <Suspense fallback={null}>
            <Scene
              nodeCount={isDesktop ? config.desktopNodes : config.mobileNodes}
              neighbors={config.neighbors}
              withReveal={config.withReveal}
              progress={config.withReveal ? progress : 1}
              spin={!reducedMotion}
              parallax={isDesktop && !reducedMotion && variant === "hero"}
              rotateSpeed={config.rotateSpeed}
            />
          </Suspense>
        </Canvas>
      </div>
    </ThreeErrorBoundary>
  );
}
