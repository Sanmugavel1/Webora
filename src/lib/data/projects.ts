import type { LucideIcon } from "lucide-react";
import {
  UtensilsCrossed,
  Shirt,
  Dumbbell,
  Store,
  Briefcase,
  ShoppingCart,
} from "lucide-react";

export interface Project {
  slug: string;
  category: string;
  name: string;
  description: string;
  services: string[];
  icon: LucideIcon;
  /** Tailwind gradient classes used for the generative preview art */
  gradient: string;
}

export const PROJECTS: Project[] = [
  {
    slug: "ember-and-oak",
    category: "Restaurant",
    name: "Ember & Oak",
    description:
      "A warm, appetite-driven site concept for a neighborhood restaurant — menu, reservations and story in one place.",
    services: ["Website Development", "UI/UX Design"],
    icon: UtensilsCrossed,
    gradient: "from-[#1a3a63] via-[#0e2a4d] to-[#071a33]",
  },
  {
    slug: "linen-house",
    category: "Fashion",
    name: "Linen House",
    description:
      "A clean, editorial storefront concept designed to let a boutique's products and photography do the talking.",
    services: ["E-Commerce", "UI/UX Design"],
    icon: Shirt,
    gradient: "from-[#123a5e] via-[#0e2a4d] to-[#071a33]",
  },
  {
    slug: "pulse-fitness",
    category: "Fitness",
    name: "Pulse Fitness",
    description:
      "A high-energy gym website concept built around class schedules, memberships and a strong first impression.",
    services: ["Website Development", "Landing Page"],
    icon: Dumbbell,
    gradient: "from-[#1677ff]/30 via-[#0e2a4d] to-[#071a33]",
  },
  {
    slug: "northfield-retail",
    category: "Retail",
    name: "Northfield Retail",
    description:
      "A concept storefront for a growing retail brand, designed to make browsing categories feel effortless.",
    services: ["E-Commerce", "Website Development"],
    icon: Store,
    gradient: "from-[#0e2a4d] via-[#123a5e] to-[#071a33]",
  },
  {
    slug: "harlow-associates",
    category: "Professional Services",
    name: "Harlow & Associates",
    description:
      "A confident, credibility-first concept site for a professional services firm and its client intake process.",
    services: ["Website Development", "Website Redesign"],
    icon: Briefcase,
    gradient: "from-[#0e2a4d] via-[#071a33] to-[#050f20]",
  },
  {
    slug: "verdant-market",
    category: "E-Commerce",
    name: "Verdant Market",
    description:
      "A concept online store built around discovery — fast browsing, simple checkout and a clear brand voice.",
    services: ["E-Commerce", "UI/UX Design"],
    icon: ShoppingCart,
    gradient: "from-[#1677ff]/25 via-[#123a5e] to-[#071a33]",
  },
];
