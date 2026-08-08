import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { SERVICES } from "@/lib/data/services";

export function Services() {
  return (
    <section className="relative bg-navy-deep py-24 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeading
          eyebrow="What We Do"
          title="WHAT WE BUILD."
          description="Digital experiences designed around your business, your customers and your goals."
          tone="light"
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <ServiceCard
                key={service.title}
                index={service.index}
                title={service.title}
                description={service.description}
                icon={<Icon className="h-6 w-6" strokeWidth={1.75} />}
                delay={(i % 3) * 0.08}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
