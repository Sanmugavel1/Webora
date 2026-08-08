import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";

interface ServiceCardProps {
  index: string;
  title: string;
  description: string;
  /** Pre-rendered so the icon component itself never crosses the server/client boundary. */
  icon: ReactNode;
  delay?: number;
}

/** Service card: dark glass panel with a gradient icon badge and pointer tilt. */
export function ServiceCard({ index, title, description, icon, delay = 0 }: ServiceCardProps) {
  return (
    <Reveal delay={delay} className="h-full">
      <TiltCard className="group h-full p-7 sm:p-8" gradientBorder>
        <div className="flex items-center justify-between">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-white transition-transform duration-300 hover-fine:group-hover:-translate-y-1 hover-fine:group-hover:scale-105"
            style={{ background: "var(--gradient-primary)" }}
          >
            {icon}
          </div>
          <span className="font-display text-sm font-semibold text-white/20">{index}</span>
        </div>

        <h3 className="font-display mt-6 text-xl font-semibold text-white">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-mist">{description}</p>

        <div
          className="mt-6 h-[2px] w-8 rounded-full transition-all duration-300 hover-fine:group-hover:w-14"
          style={{ background: "var(--gradient-primary)" }}
        />
      </TiltCard>
    </Reveal>
  );
}
