import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "light" | "dark";
  showTagline?: boolean;
  className?: string;
  priority?: boolean;
}

/**
 * WEBORA brand lockup: the supplied network-globe mark rendered alongside a
 * live text wordmark so it stays crisp and legible on both dark and light
 * sections (the source artwork's wordmark is set for light backgrounds only).
 */
export function Logo({ variant = "light", showTagline = false, className, priority = false }: LogoProps) {
  const textColor = variant === "light" ? "text-white" : "text-navy";
  const taglineColor = variant === "light" ? "text-mist" : "text-slate";

  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="WEBORA — home"
    >
      <Image
        src="/logo-mark.png"
        alt=""
        width={40}
        height={40}
        priority={priority}
        className="h-8 w-8 shrink-0 transition-transform duration-500 group-hover:rotate-[8deg] sm:h-9 sm:w-9"
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-lg font-bold tracking-wide sm:text-xl",
            textColor,
          )}
        >
          WEBORA
        </span>
        {showTagline && (
          <span
            className={cn(
              "mt-1 hidden text-[10px] font-medium tracking-[0.2em] sm:block",
              taglineColor,
            )}
          >
            GROW BRANDS
          </span>
        )}
      </span>
    </Link>
  );
}
