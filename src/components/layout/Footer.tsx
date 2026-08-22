import Link from "next/link";
import { Mail } from "lucide-react";
import { InstagramIcon, LinkedinIcon, WhatsAppIcon } from "@/components/icons/SocialIcons";
import { Logo } from "@/components/ui/Logo";
import { NAV_LINKS, SOCIAL_LINKS, CONTACT_EMAIL, WHATSAPP_LINK, WHATSAPP_DISPLAY } from "@/lib/constants";
import { SERVICES } from "@/lib/data/services";
import { PROJECTS } from "@/lib/data/projects";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy-deep pt-16 sm:pt-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "var(--gradient-primary)" }}
      />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-12 pb-12 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo variant="light" />
            <p className="mt-4 max-w-[220px] text-sm leading-relaxed text-mist">
              We build websites that grow brands.
            </p>
          </div>

          <FooterColumn title="Navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-9 items-center text-sm text-mist transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </FooterColumn>

          <FooterColumn title="Services">
            {SERVICES.map((service) => (
              <Link
                key={service.title}
                href="/services"
                className="flex min-h-9 items-center text-sm text-mist transition-colors hover:text-white"
              >
                {service.title}
              </Link>
            ))}
          </FooterColumn>

          <FooterColumn title="Selected Work">
            {PROJECTS.map((project) => (
              <a
                key={project.title}
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-9 items-center text-sm text-mist transition-colors hover:text-white"
              >
                {project.title}
              </a>
            ))}
          </FooterColumn>

          <FooterColumn title="Get In Touch">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex min-h-9 items-center gap-2.5 text-sm text-mist transition-colors hover:text-white"
            >
              <Mail className="h-4 w-4" strokeWidth={1.75} />
              {CONTACT_EMAIL}
            </a>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-9 items-center gap-2.5 text-sm text-mist transition-colors hover:text-white"
            >
              <WhatsAppIcon className="h-4 w-4" />
              {WHATSAPP_DISPLAY}
            </a>
            <a
              href={SOCIAL_LINKS.instagram.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-9 items-center gap-2.5 text-sm text-mist transition-colors hover:text-white"
            >
              <InstagramIcon className="h-4 w-4" />
              Instagram
            </a>
            <a
              href={SOCIAL_LINKS.linkedin.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-9 items-center gap-2.5 text-sm text-mist transition-colors hover:text-white"
            >
              <LinkedinIcon className="h-4 w-4" />
              LinkedIn
            </a>
          </FooterColumn>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] py-8 sm:flex-row">
          <p className="font-display text-sm font-medium text-mist">
            From your business to the world.
          </p>
          <p className="text-xs text-mist/60">
            © 2026 WEBORA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-mist/70">
        {title}
      </h3>
      <div className="mt-4 flex flex-col gap-1">{children}</div>
    </div>
  );
}
