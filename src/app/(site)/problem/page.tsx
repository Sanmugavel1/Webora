import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { QuoteCard } from "@/components/ui/QuoteCard";
import { Reveal } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/sections/CtaBand";
import { PROBLEM_QUOTES } from "@/lib/data/problem";

export const metadata: Metadata = {
  title: "The Real Problem",
  description:
    "Traffic isn't the problem — visibility and trust are. See why businesses with plenty of customers still struggle to sell, and where it starts.",
  alternates: { canonical: "/problem" },
};

export default function ProblemPage() {
  return (
    <>
      <PageHeader
        pageLabel="Page 2 of 6"
        eyebrow="The Real Problem"
        title={
          <>
            YOU HAVE THE CROWD.
            <br />
            <span className="text-blue">YOU DON&rsquo;T HAVE THE SALES.</span>
          </>
        }
        description="Plenty of businesses stay busy without staying profitable. Here's the part most owners never get told."
      />

      <section className="relative bg-navy-deep py-20 sm:py-24 lg:py-28">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:gap-10 sm:px-8 lg:px-10">
          {PROBLEM_QUOTES.map((quote, i) => (
            <QuoteCard key={quote.quote} quote={quote} index={i} reverse={i % 2 === 1} />
          ))}
        </div>
      </section>

      <section className="relative bg-navy py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8 lg:px-10">
          <Reveal>
            <p className="font-display text-2xl font-bold leading-snug text-white sm:text-3xl">
              That&rsquo;s the real problem. <span className="text-blue">Now let&rsquo;s fix it.</span>
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBand
        eyebrow="Page 3 of 6"
        heading="HERE'S WHAT WE ACTUALLY DO ABOUT IT."
        subtext="A clear look at how Webora turns visibility into trust, and trust into customers."
        primary={{ label: "SEE WHAT WE DO", href: "/services" }}
        secondary={{ label: "TALK TO US", href: "/contact" }}
      />
    </>
  );
}
