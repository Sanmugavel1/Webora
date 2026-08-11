import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { WhyWebora } from "@/components/sections/WhyWebora";
import { SignatureNetwork } from "@/components/sections/SignatureNetwork";
import { About } from "@/components/sections/About";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata: Metadata = {
  title: { absolute: "WEBORA — We Build Websites That Grow Brands" },
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Hero />
      <WhyWebora />
      <SignatureNetwork />
      <About />
      <CtaBand
        eyebrow="Page 2 of 6"
        heading={
          <>
            MOST WEBSITES DON&rsquo;T FAIL ON DESIGN.
            <br />
            THEY FAIL TO SELL.
          </>
        }
        subtext="See the real reason traffic isn't turning into customers — and where it's costing you."
        primary={{ label: "SEE THE PROBLEM", href: "/problem" }}
        secondary={{ label: "TALK TO US", href: "/contact" }}
      />
    </>
  );
}
