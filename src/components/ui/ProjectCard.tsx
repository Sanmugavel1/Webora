import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/data/projects";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  delay?: number;
}

export function ProjectCard({ project, delay = 0 }: ProjectCardProps) {
  const Icon = project.icon;

  return (
    <Reveal delay={delay}>
      <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-navy-soft/40 transition-all duration-500 hover-fine:hover:-translate-y-1.5 hover-fine:hover:border-blue/30">
        {/* Generative preview — a labeled concept, not a real screenshot */}
        <div className={cn("relative aspect-[4/3] overflow-hidden bg-gradient-to-br", project.gradient)}>
          <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 border-b border-white/10 bg-black/10 px-4 py-3">
            <span className="h-2 w-2 rounded-full bg-white/25" />
            <span className="h-2 w-2 rounded-full bg-white/25" />
            <span className="h-2 w-2 rounded-full bg-white/25" />
          </div>
          <Icon
            className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 text-white/15 transition-transform duration-700 ease-out hover-fine:group-hover:scale-110"
            strokeWidth={1}
          />
          <span className="absolute right-3 top-11 rounded-full bg-navy/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm">
            Concept Project
          </span>
        </div>

        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-soft">
            {project.category}
          </p>
          <h3 className="font-display mt-2 text-xl font-semibold text-white">
            {project.name}
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-mist">
            {project.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {project.services.map((service) => (
              <span
                key={service}
                className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-mist"
              >
                {service}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-blue-soft transition-all duration-300 hover-fine:group-hover:gap-2.5 hover-fine:group-hover:text-blue">
            View Concept
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-blue transition-transform duration-500 hover-fine:group-hover:scale-x-100" />
      </article>
    </Reveal>
  );
}
