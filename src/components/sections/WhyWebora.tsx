import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { VALUE_PROPS } from "@/lib/data/why-webora";

export function WhyWebora() {
  return (
    <section className="relative bg-navy py-24 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeading eyebrow="Why Webora" title="WHY WEBORA?" tone="light" />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-16 lg:gap-6">
          {VALUE_PROPS.map((value, i) => {
            const Icon = value.icon;
            return (
              <Reveal key={value.index} delay={(i % 2) * 0.1} className="h-full">
                <TiltCard className="flex h-full gap-5 p-6 sm:p-7">
                  <div className="shrink-0">
                    <span className="font-display block text-sm font-semibold text-blue-soft">
                      {value.index}
                    </span>
                    <div
                      className="mt-3 flex h-11 w-11 items-center justify-center rounded-full text-white"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-white">
                      {value.title}
                    </h3>
                    <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-mist sm:text-base">
                      {value.description}
                    </p>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
