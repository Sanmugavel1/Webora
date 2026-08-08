"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Mail, Phone } from "lucide-react";
import { InstagramIcon, LinkedinIcon, WhatsAppIcon } from "@/components/icons/SocialIcons";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import {
  SOCIAL_LINKS,
  CONTACT_EMAIL,
  WHATSAPP_LINK,
  WHATSAPP_DISPLAY,
  PHONE_TEL,
} from "@/lib/constants";
import { PROJECT_TYPES, BUDGET_RANGES } from "@/lib/data/contact";

const inputClasses =
  "w-full min-h-11 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-mist/40 transition-colors focus:border-blue";

type Status = "idle" | "sent";

function buildMailtoLink(data: Record<string, string>) {
  const subject = `New project inquiry from ${data.name || "a visitor"}`;
  const bodyLines = [
    `Name: ${data.name || "-"}`,
    `Business name: ${data.businessName || "-"}`,
    `Email: ${data.email || "-"}`,
    `Phone: ${data.phone || "-"}`,
    `Looking for: ${data.projectType || "-"}`,
    `Budget range: ${data.budget || "-"}`,
    "",
    "Message:",
    data.message || "-",
  ];
  const body = bodyLines.join("\n");
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    window.location.href = buildMailtoLink(data);
    setStatus("sent");
  };

  return (
    <section className="relative bg-navy-deep py-24 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow mb-4 text-xs font-semibold uppercase text-blue-soft">
              Contact
            </p>
            <h2 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
              LET&rsquo;S BUILD
              <br />
              SOMETHING GREAT.
            </h2>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-mist">
              Tell us about your business and what you need. We&rsquo;ll get
              back to you with next steps.
            </p>

            <div className="mt-10 space-y-3">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex min-h-11 items-center gap-3 text-sm font-medium text-white transition-colors hover:text-blue-soft"
              >
                <Mail className="h-5 w-5" strokeWidth={1.75} />
                {CONTACT_EMAIL}
              </a>
              <a
                href={`tel:${PHONE_TEL}`}
                className="flex min-h-11 items-center gap-3 text-sm font-medium text-white transition-colors hover:text-blue-soft"
              >
                <Phone className="h-5 w-5" strokeWidth={1.75} />
                {PHONE_TEL}
              </a>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center gap-3 text-sm font-medium text-white transition-colors hover:text-blue-soft"
              >
                <WhatsAppIcon className="h-5 w-5" />
                {WHATSAPP_DISPLAY} (WhatsApp)
              </a>
              <a
                href={SOCIAL_LINKS.instagram.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center gap-3 text-sm font-medium text-white transition-colors hover:text-blue-soft"
              >
                <InstagramIcon className="h-5 w-5" />
                {SOCIAL_LINKS.instagram.label}
              </a>
              <a
                href={SOCIAL_LINKS.linkedin.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center gap-3 text-sm font-medium text-white transition-colors hover:text-blue-soft"
              >
                <LinkedinIcon className="h-5 w-5" />
                {SOCIAL_LINKS.linkedin.label}
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            {status === "sent" ? (
              <div className="glass-dark flex min-h-[420px] flex-col items-center justify-center rounded-2xl p-10 text-center">
                <CheckCircle2 className="h-12 w-12 text-blue-soft" strokeWidth={1.5} />
                <h3 className="font-display mt-5 text-2xl font-semibold text-white">
                  Your email app should be open.
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-mist">
                  We&rsquo;ve pre-filled a message to {CONTACT_EMAIL} — just hit
                  send. Didn&rsquo;t open?{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-soft underline underline-offset-2">
                    Email us directly
                  </a>{" "}
                  or{" "}
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-soft underline underline-offset-2"
                  >
                    message us on WhatsApp
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="glass-dark space-y-5 rounded-2xl p-6 sm:p-8">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Name" htmlFor="name">
                    <input id="name" name="name" type="text" required className={inputClasses} />
                  </Field>
                  <Field label="Business Name" htmlFor="businessName">
                    <input id="businessName" name="businessName" type="text" className={inputClasses} />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Email" htmlFor="email">
                    <input id="email" name="email" type="email" required className={inputClasses} />
                  </Field>
                  <Field label="Phone" htmlFor="phone">
                    <input id="phone" name="phone" type="tel" className={inputClasses} />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="What do you need?" htmlFor="projectType">
                    <select id="projectType" name="projectType" className={inputClasses} defaultValue="">
                      <option value="" disabled className="text-navy">
                        Select an option
                      </option>
                      {PROJECT_TYPES.map((type) => (
                        <option key={type} value={type} className="text-navy">
                          {type}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Budget Range" htmlFor="budget">
                    <select id="budget" name="budget" className={inputClasses} defaultValue="">
                      <option value="" disabled className="text-navy">
                        Select a range
                      </option>
                      {BUDGET_RANGES.map((range) => (
                        <option key={range} value={range} className="text-navy">
                          {range}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Message" htmlFor="message">
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className={`${inputClasses} resize-none`}
                  />
                </Field>

                <Button type="submit" variant="primary" className="w-full justify-center sm:w-auto">
                  SEND PROJECT REQUEST
                </Button>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-xs font-semibold text-white">
        {label}
      </label>
      {children}
    </div>
  );
}
