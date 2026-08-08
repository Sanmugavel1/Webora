import type { LucideIcon } from "lucide-react";
import { Target, Smartphone, MousePointerClick, TrendingUp } from "lucide-react";

export interface ValueProp {
  index: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const VALUE_PROPS: ValueProp[] = [
  {
    index: "01",
    title: "Business First",
    description: "We design around your goals, not just aesthetics.",
    icon: Target,
  },
  {
    index: "02",
    title: "Built For Every Screen",
    description:
      "Every experience is carefully designed for desktop, tablet and mobile.",
    icon: Smartphone,
  },
  {
    index: "03",
    title: "Designed To Convert",
    description:
      "Beautiful interfaces that guide visitors toward meaningful action.",
    icon: MousePointerClick,
  },
  {
    index: "04",
    title: "Built To Grow",
    description: "Your website should evolve as your business does.",
    icon: TrendingUp,
  },
];
