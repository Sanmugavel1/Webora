"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { PROJECTS, WORK_FILTERS, type ProjectCategoryKey } from "@/lib/data/projects";
import { cn } from "@/lib/utils";

type FilterKey = "all" | ProjectCategoryKey;

/**
 * WEBORA's portfolio — the site's actual proof of work. Four real, live
 * builds, filterable by industry. Every card is a direct link to the live
 * site: a case-study modal would be more UI to maintain for four projects
 * that are already one click away from speaking for themselves.
 */
export function Work() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const visibleCount = PROJECTS.filter((p) => filter === "all" || p.categoryKey === filter).length;

  return (
    <section id="work" className="relative overflow-hidden bg-navy-deep py-24 sm:py-28 lg:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-mesh opacity-50" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeading
          eyebrow="Selected Webora Projects"
          title="OUR WORK"
          description="Real businesses. Real digital experiences. Built by Webora."
          tone="light"
          align="center"
          className="mx-auto max-w-2xl"
        />

        <Reveal delay={0.12} className="mt-8 text-center">
          <p className="font-display text-xl font-semibold leading-snug text-white sm:text-2xl">
            Don&rsquo;t just take our word for it.
            <br />
            <span className="text-gradient">See what we&rsquo;ve built.</span>
          </p>
        </Reveal>

        <Reveal delay={0.2} className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:mt-12">
          {WORK_FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={active}
                className={cn(
                  "eyebrow rounded-full px-5 py-2.5 text-xs font-semibold uppercase transition-all duration-300",
                  active
                    ? "text-white shadow-[0_10px_30px_rgba(22,119,255,0.35)]"
                    : "glass-dark text-mist hover-fine:hover:text-white",
                )}
                style={active ? { background: "var(--gradient-primary)" } : undefined}
              >
                {f.label}
              </button>
            );
          })}
        </Reveal>

        <div
          className="relative mt-12 grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-2 lg:mt-14 lg:gap-8"
          aria-live="polite"
        >
          {PROJECTS.map((project, i, arr) => {
            const matches = filter === "all" || project.categoryKey === filter;
            const featured = i === 0 || i === arr.length - 1;
            return (
              <ProjectCard
                key={project.title}
                project={project}
                featured={featured}
                visible={matches}
                priority={i === 0}
              />
            );
          })}
        </div>

        {visibleCount === 0 && (
          <p className="mt-12 text-center text-sm text-mist">No projects in this category yet.</p>
        )}
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  featured,
  visible,
  priority,
}: {
  project: (typeof PROJECTS)[number];
  featured: boolean;
  visible: boolean;
  priority: boolean;
}) {
  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out",
        featured && "md:col-span-2",
        visible
          ? "relative z-10 opacity-100 scale-100"
          : "pointer-events-none absolute inset-0 z-0 opacity-0 scale-95",
      )}
    >
      <a
        href={project.liveUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${project.title} — view live website`}
        className={cn(
          "group relative block w-full overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(2,8,20,0.4)]",
          featured ? "aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/9]" : "aspect-[4/3] sm:aspect-[16/11]",
        )}
      >
        <Image
          src={project.image}
          alt={`${project.title} website preview`}
          fill
          priority={priority}
          sizes={featured ? "(min-width: 1024px) 1200px, 100vw" : "(min-width: 768px) 600px, 100vw"}
          className="object-cover object-top transition-transform duration-700 ease-out hover-fine:group-hover:scale-105"
        />

        {/* Faint whole-image wash for contrast — the caption itself gets its
            own solid scrim below, sized to its content, so text is never
            left legible-but-thin over a bright screenshot underneath it. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-navy-deep/40 via-transparent to-transparent"
        />

        {/* Caption scrim — opaque and exactly as tall as the text it holds,
            so it fully covers the screenshot behind it at any breakpoint
            (mobile shows the description; desktop reveals it on hover). */}
        <div className="absolute inset-x-0 bottom-0 bg-navy-deep/95 px-6 pb-6 pt-5 backdrop-blur-sm sm:px-8 sm:pb-8 sm:pt-6">
          <p className="eyebrow text-[11px] font-semibold uppercase text-blue-soft sm:text-xs">
            {project.category}
          </p>
          <h3 className="font-display mt-2 text-xl font-bold text-white sm:text-2xl">
            {project.title}
          </h3>

          <div
            className={cn(
              "max-h-40 opacity-100 transition-all duration-500 ease-out",
              "hover-fine:max-h-0 hover-fine:opacity-0",
              "hover-fine:group-hover:max-h-40 hover-fine:group-hover:opacity-100",
            )}
          >
            <p className="mt-3 max-w-md text-sm leading-relaxed text-mist sm:text-base">
              {project.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
              VIEW LIVE WEBSITE
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-300 hover-fine:group-hover:translate-x-0.5 hover-fine:group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
      </a>
    </div>
  );
}
