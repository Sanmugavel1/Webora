import { Reveal } from "@/components/motion/Reveal";

interface PageHeaderProps {
  pageLabel: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
}

/** Consistent opening band for every inner page (Problem, Services, Pricing, Contact). */
export function PageHeader({ pageLabel, eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-navy pt-32 pb-16 sm:pt-36 sm:pb-20 lg:pt-44 lg:pb-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-mesh" />
      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8 lg:px-10">
        <Reveal>
          <span
            className="inline-block rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            {pageLabel}
          </span>
          <p className="eyebrow mt-6 mb-4 text-xs font-semibold uppercase text-blue-soft">
            {eyebrow}
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-mist sm:text-lg">
              {description}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
