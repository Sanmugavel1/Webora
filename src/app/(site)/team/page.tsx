import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Team } from "@/components/sections/Team";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata: Metadata = {
  title: "Meet the Builders",
  description:
    "The people behind WEBORA — meet the co-founders building and growing the websites that grow your business.",
  alternates: { canonical: "/team" },
};

export default function TeamPage() {
  return (
    <>
      <PageHeader
        pageLabel="Page 4 of 6"
        eyebrow="Meet the Builders"
        title={
          <>
            THE PEOPLE
            <br />
            <span className="text-blue">BEHIND WEBORA.</span>
          </>
        }
        description="A small team that builds and grows every website personally — no account managers, no middle layer."
      />

      <Team />

      <CtaBand
        eyebrow="Page 5 of 6"
        heading="SIMPLE PLANS. NO SURPRISES."
        subtext="Real pricing, real inclusions, no guesswork — see what it takes to get online."
        primary={{ label: "SEE PRICING", href: "/pricing" }}
        secondary={{ label: "TALK TO US", href: "/contact" }}
      />
    </>
  );
}
