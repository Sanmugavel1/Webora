import { Quote } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import type { ProblemQuote } from "@/lib/data/problem";

interface QuoteCardProps {
  quote: ProblemQuote;
  index: number;
  /** Alternates the card's alignment for a more dynamic "cascading" reading path. */
  reverse?: boolean;
}

export function QuoteCard({ quote, index, reverse = false }: QuoteCardProps) {
  return (
    <Reveal delay={0.05} y={36}>
      <TiltCard
        gradientBorder
        className={`mx-auto flex max-w-3xl flex-col gap-5 p-8 sm:p-10 ${reverse ? "sm:ml-auto" : "sm:mr-auto"}`}
      >
        <div className="flex items-center justify-between">
          <Quote className="h-9 w-9 text-blue-soft" strokeWidth={1.5} />
          <span className="font-display text-sm font-semibold text-white/20">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <p className="font-display text-xl font-semibold leading-snug text-white sm:text-2xl">
          {quote.quote}
        </p>
        <p className="text-sm leading-relaxed text-mist sm:text-base">{quote.detail}</p>
      </TiltCard>
    </Reveal>
  );
}
