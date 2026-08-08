export const SITE_URL = "https://webora.works";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "The Problem", href: "/problem" },
  { label: "What We Do", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
] as const;

export const SOCIAL_LINKS = {
  instagram: {
    label: "@webora.works",
    href: "https://www.instagram.com/webora.works?igsh=MW45bGsxcWVydHN1dg==",
  },
  linkedin: {
    label: "Webora Works",
    href: "https://www.linkedin.com/in/webora-works-059761428?utm_source=share_via&utm_content=profile&utm_medium=member_android",
  },
} as const;

export const CONTACT_EMAIL = "webora99@gmail.com";

export const WHATSAPP_NUMBER = "919345560306";
export const WHATSAPP_DISPLAY = "+91 93455 60306";
export const WHATSAPP_DEFAULT_MESSAGE =
  "Hi Webora! I'd like to talk about getting a website built.";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`;

export const PHONE_TEL = "+919345560306";
