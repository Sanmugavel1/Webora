import { Check } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { Button } from "@/components/ui/Button";
import { CheckoutButton } from "@/components/ui/CheckoutButton";
import { cn } from "@/lib/utils";
import type { PricingPackage } from "@/lib/data/pricing";

interface PricingCardProps {
  pkg: PricingPackage;
  delay?: number;
}

export function PricingCard({ pkg, delay = 0 }: PricingCardProps) {
  return (
    <Reveal delay={delay} className="h-full">
      <TiltCard
        gradientBorder={pkg.featured}
        className={cn(
          "flex h-full flex-col p-8",
          pkg.featured && "shadow-[0_25px_60px_rgba(22,119,255,0.25)] lg:scale-[1.03]",
        )}
      >
        {pkg.badge && (
          <span
            className="absolute -top-3 left-8 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            {pkg.badge}
          </span>
        )}

        <h3 className="font-display text-2xl font-bold text-white">{pkg.name}</h3>
        <p className="mt-2 text-sm text-mist">{pkg.tagline}</p>

        <div className="mt-6">
          <div className="flex items-baseline gap-2.5">
            {pkg.originalPrice && (
              <span className="text-lg text-white/35 line-through">{pkg.originalPrice}</span>
            )}
            <span className="font-display text-4xl font-bold text-white">{pkg.price}</span>
          </div>
        </div>

        <ul className="mt-7 flex-1 space-y-2.5">
          {pkg.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-soft" />
              <span className="text-mist">{feature}</span>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs text-white/35">{pkg.footnote}</p>

        {pkg.amountInPaise ? (
          <CheckoutButton slug={pkg.slug} packageName={pkg.name} className="mt-6" />
        ) : (
          <Button
            href="/contact"
            variant="primary"
            className="mt-6 w-full justify-center"
          >
            {pkg.ctaLabel}
          </Button>
        )}
      </TiltCard>
    </Reveal>
  );
}
