import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { FAQ_ITEMS } from "@/lib/data/faq";

export function FAQ() {
  return (
    <section className="relative bg-navy py-24 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-4xl px-5 sm:px-8 lg:px-10">
        <SectionHeading
          eyebrow="FAQ"
          title={<>QUESTIONS?<br />WE&rsquo;VE GOT ANSWERS.</>}
          tone="light"
        />

        <div className="mt-14 lg:mt-16">
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </div>
    </section>
  );
}
