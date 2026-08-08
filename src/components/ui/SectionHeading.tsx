import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}

/** Consistent eyebrow + headline + supporting copy used to open every section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
  className,
}: SectionHeadingProps) {
  const textTone = tone === "light" ? "text-white" : "text-navy";
  const descTone = tone === "light" ? "text-mist" : "text-slate";

  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <Reveal>
        {eyebrow && (
          <p className="eyebrow mb-4 text-xs font-semibold uppercase text-blue">
            {eyebrow}
          </p>
        )}
        <h2
          className={cn(
            "font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl",
            textTone,
          )}
        >
          {title}
        </h2>
        {description && (
          <p className={cn("mt-5 text-base leading-relaxed sm:text-lg", descTone)}>
            {description}
          </p>
        )}
      </Reveal>
    </div>
  );
}
