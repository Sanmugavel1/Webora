import type { SVGProps } from "react";

/**
 * Lightweight line-style social icons matching lucide's visual language.
 * lucide-react no longer ships brand/logo icons, so these are hand-drawn
 * outline glyphs (not the official Instagram/LinkedIn marks).
 */

export function InstagramIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsAppIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M17.47 14.38c-.29-.14-1.7-.84-1.96-.93-.26-.1-.46-.14-.65.14-.19.29-.75.93-.92 1.12-.17.19-.34.21-.63.07-.29-.14-1.22-.45-2.32-1.43-.86-.76-1.44-1.71-1.61-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.65-1.57-.9-2.15-.24-.57-.48-.5-.65-.5-.17-.01-.36-.01-.55-.01-.19 0-.5.07-.77.36-.26.29-1 .98-1 2.4 0 1.41 1.03 2.78 1.17 2.97.14.19 2.03 3.1 4.92 4.35.69.3 1.22.47 1.64.6.69.22 1.31.19 1.81.11.55-.08 1.7-.7 1.94-1.36.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.33Z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.01 2C6.5 2 2.02 6.48 2.02 12c0 1.85.5 3.58 1.36 5.07L2 22l5.08-1.33A9.94 9.94 0 0 0 12.01 22C17.52 22 22 17.52 22 12S17.52 2 12.01 2Zm0 18.13a8.1 8.1 0 0 1-4.14-1.13l-.3-.18-3.02.79.8-2.94-.19-.3a8.13 8.13 0 1 1 6.85 3.76Z"
      />
    </svg>
  );
}

export function LinkedinIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="7.5" y1="10.5" x2="7.5" y2="16.5" />
      <circle cx="7.5" cy="7" r="0.6" fill="currentColor" stroke="none" />
      <path d="M11.5 16.5v-3.6c0-1.3 0.9-2.2 2.1-2.2s1.9 0.9 1.9 2.2v3.6" />
      <line x1="11.5" y1="10.5" x2="11.5" y2="16.5" />
    </svg>
  );
}
