import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { CursorGlow } from "@/components/motion/CursorGlow";
import { ScrollLinkButton } from "@/components/motion/ScrollLinkButton";
import { NetworkGlobe } from "@/components/three/NetworkGlobe";
import { InstagramIcon, LinkedinIcon } from "@/components/icons/SocialIcons";
import { SOCIAL_LINKS } from "@/lib/constants";

export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-navy pt-28 pb-16 sm:pt-32 lg:pt-40 lg:pb-24"
    >
      {/* Ambient background texture — stays purely decorative */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-mesh" />
      <CursorGlow />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-8 lg:px-10">
        <div className="relative z-10 max-w-xl">
          <Reveal>
            <p className="eyebrow mb-6 text-xs font-semibold uppercase text-blue-soft">
              Websites for growing businesses
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="font-display text-[2.75rem] font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[3.75rem]">
              WE BUILD
              <br />
              WEBSITES THAT
              <br />
              <span className="text-blue">GROW BRANDS.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="mt-7 max-w-md text-base leading-relaxed text-mist sm:text-lg">
              Webora transforms local businesses and growing brands into
              powerful digital experiences that connect with more customers.
            </p>
          </Reveal>

          <Reveal delay={0.28}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button href="/contact" variant="primary">
                START YOUR PROJECT
              </Button>
              <ScrollLinkButton target="#work" variant="secondary">
                VIEW OUR WORK
              </ScrollLinkButton>
            </div>
          </Reveal>

          <Reveal delay={0.36}>
            <div className="mt-8 flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-widest text-mist/60">
                Follow us
              </span>
              <a
                href={SOCIAL_LINKS.instagram.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WEBORA on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-all duration-300 hover-fine:hover:scale-110 hover-fine:hover:border-blue-soft/60 hover-fine:hover:text-blue-soft"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href={SOCIAL_LINKS.linkedin.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WEBORA on LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-all duration-300 hover-fine:hover:scale-110 hover-fine:hover:border-blue-soft/60 hover-fine:hover:text-blue-soft"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="relative z-0">
          <div className="relative mx-auto h-[320px] w-full max-w-md sm:h-[420px] lg:h-[560px] lg:max-w-none">
            <NetworkGlobe variant="hero" className="h-full w-full" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
