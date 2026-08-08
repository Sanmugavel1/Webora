import type { LucideIcon } from "lucide-react";
import {
  Globe,
  ShoppingBag,
  Rocket,
  PenTool,
  RefreshCw,
  LifeBuoy,
} from "lucide-react";

export interface Service {
  index: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const SERVICES: Service[] = [
  {
    index: "01",
    title: "Website Development",
    description:
      "Professional websites built to represent your business, build trust and turn visitors into customers.",
    icon: Globe,
  },
  {
    index: "02",
    title: "E-Commerce",
    description:
      "Beautiful online stores designed to make discovering and purchasing products simple.",
    icon: ShoppingBag,
  },
  {
    index: "03",
    title: "Landing Pages",
    description:
      "Focused landing pages designed to communicate your value and drive action.",
    icon: Rocket,
  },
  {
    index: "04",
    title: "UI/UX Design",
    description:
      "Clean, intuitive interfaces designed around how your customers actually use your product.",
    icon: PenTool,
  },
  {
    index: "05",
    title: "Website Redesign",
    description:
      "Transform an outdated website into a modern, responsive digital experience.",
    icon: RefreshCw,
  },
  {
    index: "06",
    title: "Maintenance & Support",
    description:
      "Keep your website secure, updated, fast and ready for your next stage of growth.",
    icon: LifeBuoy,
  },
];
