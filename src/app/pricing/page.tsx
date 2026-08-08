import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { PricingCard } from "@/components/ui/PricingCard";
import { Reveal } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/sections/CtaBand";
import { PRICING_PACKAGES, NO_DOMAIN_DISCOUNT } from "@/lib/data/pricing";
import { PHONE_TEL } from "@/lib/constants";

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
        pageLabel="Page 4 of 5"
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

          <Reveal className="mt-14 flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-7 text-center sm:flex-row sm:justify-between sm:text-left lg:mt-16">
            <div>
              <h3 className="font-display text-lg font-semibold text-white">
                Already have a domain? Don&rsquo;t need a new one?
              </h3>
              <p className="mt-1.5 text-sm text-mist">
                We&rsquo;ll take {NO_DOMAIN_DISCOUNT} off any package — just mention it when you call.
              </p>
            </div>
            <a
              href={`tel:${PHONE_TEL}`}
              className="shrink-0 text-sm font-semibold text-blue-soft transition-colors hover:text-blue"
            >
              {PHONE_TEL} →
            </a>
          </Reveal>

          <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-white/35">
            All prices are in INR. Hosting renews annually at ₹4,000 after
            the first free year. Pricing is current as shared with us and
            may be revised — call to confirm before starting your project.
          </p>
        </div>
      </section>

      <CtaBand
        eyebrow="Page 5 of 5"
        heading="LET'S BUILD SOMETHING GREAT."
        subtext="Tell us about your business and what you need — we'll get back to you with next steps."
        primary={{ label: "GET IN TOUCH", href: "/contact" }}
        secondary={{ label: "CALL NOW", href: `tel:${PHONE_TEL}`, external: false }}
      />
    </>
  );
}
