import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { WHATSAPP_LINK } from "@/lib/constants";

/**
 * Global floating WhatsApp button — present on every page, fixed
 * bottom-right, with a gentle pulse so it reads as "tap me" without being
 * obnoxious. Respects prefers-reduced-motion (pulse is animation-based, so
 * the global reduced-motion rule in globals.css already neutralizes it).
 */
export function WhatsAppFab() {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with WEBORA on WhatsApp"
      className="group fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_8px_28px_rgba(37,211,102,0.4)] transition-transform duration-300 hover-fine:hover:scale-110 sm:bottom-7 sm:right-7 motion-safe:animate-fab-pulse"
    >
      <WhatsAppIcon className="h-7 w-7" />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 hover-fine:group-hover:opacity-100 sm:block">
        Chat on WhatsApp
      </span>
    </a>
  );
}
