import Image from "next/image";
import { cn } from "@/lib/utils";

interface GlobeFallbackProps {
  className?: string;
  animate?: boolean;
}

/**
 * Static, fully-accessible replacement for the WebGL network globe. Used
 * whenever WebGL is unavailable — the site must never show a blank area.
 */
export function GlobeFallback({ className, animate = true }: GlobeFallbackProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div className="absolute h-3/4 w-3/4 rounded-full bg-blue/20 blur-[80px]" aria-hidden="true" />
      <Image
        src="/logo-mark.png"
        alt="WEBORA network globe"
        width={520}
        height={520}
        className={cn(
          "relative h-2/3 w-2/3 max-w-[420px] drop-shadow-[0_0_60px_rgba(22,119,255,0.35)]",
          animate && "motion-safe:animate-[float_7s_ease-in-out_infinite]",
        )}
      />
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
}
