import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { Portfolio } from "@/components/sections/Portfolio";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata: Metadata = {
  title: "What We Do",
  description:
    "Website development, e-commerce, landing pages, UI/UX, redesigns and ongoing support — built around your business, not the other way around.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        pageLabel="Page 3 of 5"
        eyebrow="What We Do"
        title={
          <>
            WE TURN VISIBILITY
            <br />
            INTO <span className="text-blue">A SYSTEM.</span>
          </>
        }
        description="Not just a website — a digital presence built to be found, trusted and chosen. Here's exactly what that looks like."
      />
      <Services />
      <Process />
      <Portfolio />
      <CtaBand
        eyebrow="Page 4 of 5"
        heading="SIMPLE PLANS. NO SURPRISES."
        subtext="Real pricing, real inclusions, no guesswork — see what it takes to get online."
        primary={{ label: "SEE PRICING", href: "/pricing" }}
        secondary={{ label: "TALK TO US", href: "/contact" }}
      />
    </>
  );
}
