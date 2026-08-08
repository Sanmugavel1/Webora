import { Quote } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Honest placeholder in place of the testimonials Webora doesn't have yet.
 * Swap this section's content for real client testimonials as they arrive —
 * nothing here should be treated as a template for fabricated quotes.
 */
export function Testimonials() {
  return (
    <section className="relative bg-navy py-24 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8 lg:px-10">
        <Reveal>
          <Quote className="mx-auto h-9 w-9 text-blue-soft" strokeWidth={1.5} />
          <h2 className="font-display mt-6 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            BUILDING THE FIRST GENERATION OF WEBORA PARTNERSHIPS.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-mist sm:text-lg">
            We&rsquo;re focused on creating digital experiences that businesses
            can be proud to put their name on.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
