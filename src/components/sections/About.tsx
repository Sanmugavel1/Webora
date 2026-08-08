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
          {/* Brand mark — the "image representing our startup": the actual
              WEBORA globe/network mark, presented as a glowing glass badge. */}
          <div className="relative mb-8 flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full opacity-70 blur-xl motion-safe:animate-[pulse_4s_ease-in-out_infinite]"
              style={{ background: "var(--gradient-primary)" }}
            />
            <div className="glass-dark gradient-border relative flex h-full w-full items-center justify-center rounded-full p-6 shadow-[0_20px_60px_rgba(22,119,255,0.25)] motion-safe:animate-[float_6s_ease-in-out_infinite]">
              <Image
                src="/logo-mark.png"
                alt="The WEBORA network mark"
                width={200}
                height={200}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

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

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
}
