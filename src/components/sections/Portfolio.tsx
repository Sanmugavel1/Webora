import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { PROJECTS } from "@/lib/data/projects";

export function Portfolio() {
  return (
    <section id="work" className="relative bg-navy py-24 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeading
          eyebrow="Our Work"
          title="BUILT TO MAKE AN IMPACT."
          description="Explore digital experiences created to help businesses stand out."
          tone="light"
        />

        <p className="mt-6 max-w-2xl text-sm text-white/40">
          Webora is a new studio — the projects below are concept builds that
          show how we approach real business problems. Real client work will
          replace these as partnerships launch.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.slug} project={project} delay={(i % 3) * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}
