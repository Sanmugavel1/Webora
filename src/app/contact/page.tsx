import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";
import { FAQ } from "@/components/sections/FAQ";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with WEBORA — send a project request, call, WhatsApp us, or find us on Instagram and LinkedIn.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        pageLabel="Page 6 of 6"
        eyebrow="Contact"
        title={
          <>
            LET&rsquo;S TALK ABOUT
            <br />
            <span className="text-blue">YOUR BUSINESS.</span>
          </>
        }
        description="Call, WhatsApp, email, or send a project request below — whichever's easiest for you."
      />
      <Testimonials />
      <Contact />
      <FAQ />
    </>
  );
}
