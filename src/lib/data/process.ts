import type { LucideIcon } from "lucide-react";
import { Search, PenTool, Hammer, Rocket, TrendingUp } from "lucide-react";

export interface ProcessStep {
  index: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    index: "01",
    title: "Discover",
    description: "Understand your business, audience and goals.",
    icon: Search,
  },
  {
    index: "02",
    title: "Design",
    description: "Create the visual direction and user experience.",
    icon: PenTool,
  },
  {
    index: "03",
    title: "Build",
    description: "Turn the design into a fast, responsive website.",
    icon: Hammer,
  },
  {
    index: "04",
    title: "Launch",
    description: "Put your business online and ready for customers.",
    icon: Rocket,
  },
  {
    index: "05",
    title: "Grow",
    description: "Improve, maintain and scale your digital presence.",
    icon: TrendingUp,
  },
];
