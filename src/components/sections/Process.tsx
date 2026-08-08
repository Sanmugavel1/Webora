import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProcessTimeline } from "./ProcessTimeline";
import { PROCESS_STEPS } from "@/lib/data/process";

export function Process() {
  const steps = PROCESS_STEPS.map((step) => {
    const Icon = step.icon;
    return {
      index: step.index,
      title: step.title,
      description: step.description,
      icon: <Icon className="h-5 w-5" strokeWidth={1.75} />,
    };
  });

  return (
    <section className="relative bg-navy py-24 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeading eyebrow="How We Work" title={<>FROM IDEA<br />TO ONLINE.</>} tone="light" />

        <div className="mt-16 lg:mt-24">
          <ProcessTimeline steps={steps} />
        </div>
      </div>
    </section>
  );
}
