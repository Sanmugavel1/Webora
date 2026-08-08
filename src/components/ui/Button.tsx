import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  showArrow?: boolean;
  className?: string;
  children: React.ReactNode;
  /** Opens link variants in a new tab (for wa.me / external destinations). */
  external?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "text-white shadow-[0_10px_30px_rgba(22,119,255,0.35)] hover:shadow-[0_14px_40px_rgba(22,119,255,0.5)] hover:-translate-y-0.5",
  secondary:
    "bg-transparent text-white border border-white/25 hover:border-white/60 hover:bg-white/5",
  ghost:
    "glass-light text-navy hover:shadow-[0_10px_30px_rgba(7,26,51,0.1)] hover:-translate-y-0.5",
};

const baseClasses =
  "group relative inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue";

interface LinkButtonProps extends ButtonBaseProps {
  href: string;
  onClick?: () => void;
  type?: never;
}

interface ClickButtonProps extends ButtonBaseProps {
  href?: never;
  onClick?: () => void;
  type?: "button" | "submit";
}

type ButtonProps = LinkButtonProps | ClickButtonProps;

/** Shared CTA button — renders as a Link when `href` is given, else a native button. */
export function Button({
  variant = "primary",
  showArrow = true,
  className,
  children,
  href,
  onClick,
  type = "button",
  external = false,
}: ButtonProps) {
  const classes = cn(baseClasses, VARIANT_CLASSES[variant], className);
  const style = variant === "primary" ? { background: "var(--gradient-primary)" } : undefined;
  const content = (
    <>
      <span>{children}</span>
      {showArrow && (
        <ArrowRight
          className="h-4 w-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1"
          aria-hidden="true"
        />
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={classes}
        style={style}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} style={style}>
      {content}
    </button>
  );
}
