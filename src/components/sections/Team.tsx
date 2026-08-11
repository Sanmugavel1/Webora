import { TeamCard } from "@/components/ui/TeamCard";
import { TEAM_MEMBERS } from "@/lib/data/team";

export function Team() {
  return (
    <section className="relative bg-navy-deep py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-7">
          {TEAM_MEMBERS.map((member, i) => (
            <TeamCard key={member.name} member={member} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}
