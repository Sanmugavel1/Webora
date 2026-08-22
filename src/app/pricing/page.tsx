import type { Metadata } from "next";
import { ShieldCheck, Headset, Rocket, Lock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PricingCard } from "@/components/ui/PricingCard";
import { Reveal } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/sections/CtaBand";
import { PRICING_PACKAGES } from "@/lib/data/pricing";
import { PHONE_TEL } from "@/lib/constants";

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "No Hidden Charges",
    description: "Transparent pricing with no surprises.",
  },
  {
    icon: Headset,
    title: "Reliable Support",
    description: "We're here to help you every step of the way.",
  },
  {
    icon: Rocket,
    title: "Built for Growth",
    description: "Scalable websites that grow your business.",
  },
  {
    icon: Lock,
    title: "Secure & Fast",
    description: "Modern, secure and high-performance websites.",
  },
];

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent web development pricing in INR — Standard, Premium and custom Pro packages, no hidden costs.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <PageHeader
        pageLabel="Page 5 of 6"
        eyebrow="Pricing"
        title={
          <>
            SIMPLE PLANS.
            <br />
            <span className="text-blue">NO SURPRISES.</span>
          </>
        }
        description="Real prices, real inclusions. Pick a package, or tell us what you need and we'll build around it."
      />

      <section className="relative bg-navy-deep py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-7">
            {PRICING_PACKAGES.map((pkg, i) => (
              <PricingCard key={pkg.name} pkg={pkg} delay={i * 0.1} />
            ))}
          </div>

          <Reveal className="mt-14 grid grid-cols-1 gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-7 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-8">
            {TRUST_POINTS.map((point) => {
              const Icon = point.icon;
              return (
                <div key={point.title} className="flex items-start gap-3.5">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-white">
                      {point.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-mist">
                      {point.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </Reveal>

          <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-white/35">
            All prices are in INR. Hosting renews annually at ₹4,000 after
            the first free year. Pricing is current as shared with us and
            may be revised — call to confirm before starting your project.
          </p>
        </div>
      </section>

      <CtaBand
        eyebrow="Page 6 of 6"
        heading="LET'S BUILD SOMETHING GREAT."
        subtext="Tell us about your business and what you need — we'll get back to you with next steps."
        primary={{ label: "GET IN TOUCH", href: "/contact" }}
        secondary={{ label: "CALL NOW", href: `tel:${PHONE_TEL}`, external: false }}
      />
    </>
  );
}
