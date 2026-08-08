import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";

export function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-navy-deep py-24 sm:py-28 lg:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-mesh opacity-60" />
      <Image
        src="/logo-mark.png"
        alt=""
        width={640}
        height={640}
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] opacity-[0.06] sm:h-[520px] sm:w-[520px]"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-10">
        <Reveal>
          <p className="eyebrow mb-4 text-xs font-semibold uppercase text-blue-soft">About</p>
          <h2 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
            WHY WE EXIST.
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="space-y-7">
          <p
            className="font-display pl-6 text-xl font-medium leading-snug text-white sm:text-2xl"
            style={{ borderLeft: "2px solid transparent", borderImage: "var(--gradient-primary) 1" }}
          >
            A website should be more than a digital presence. It should
            represent your business, build trust, connect you with customers
            and help your business grow.
          </p>

          <p className="max-w-xl text-base leading-relaxed text-mist sm:text-lg">
            WEBORA exists to help businesses make the transition from physical
            presence to digital presence — turning a local shop, studio or
            service into a brand people can discover, trust and return to
            online.
          </p>

          <p className="max-w-xl text-base leading-relaxed text-mist sm:text-lg">
            We&rsquo;re building Webora around one simple idea: every business
            deserves a digital presence that reflects the quality of what it
            does.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
