import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { NetworkGlobe } from "@/components/three/NetworkGlobe";

interface CtaLink {
  label: string;
  href: string;
  external?: boolean;
}

interface CtaBandProps {
  eyebrow?: string;
  heading: React.ReactNode;
  subtext: string;
  primary: CtaLink;
  secondary?: CtaLink;
}

/**
 * The recurring "next step" band that closes out every WEBORA page and
 * threads the site's five pages into one guided journey. A dimmed network
 * globe plays behind the copy — never so bright it competes with the text.
 */
export function CtaBand({ eyebrow, heading, subtext, primary, secondary }: CtaBandProps) {
  return (
    <section className="relative overflow-hidden bg-navy py-24 sm:py-28 lg:py-32">
      <div className="absolute inset-0 opacity-30 sm:opacity-40">
        <NetworkGlobe variant="cta" className="h-full w-full" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_50%,transparent,rgba(7,26,51,0.88)_75%)]"
      />
      <Image
        src="/logo-mark.png"
        alt=""
        width={220}
        height={220}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 opacity-[0.12] sm:h-52 sm:w-52"
      />

      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8 lg:px-10">
        <Reveal>
          {eyebrow && (
            <p className="eyebrow mb-4 text-xs font-semibold uppercase text-blue-soft">
              {eyebrow}
            </p>
          )}
          <h2 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-mist sm:text-lg">
            {subtext}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href={primary.href} variant="primary" external={primary.external}>
              {primary.label}
            </Button>
            {secondary && (
              <Button href={secondary.href} variant="secondary" showArrow={false} external={secondary.external}>
                {secondary.label}
              </Button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
