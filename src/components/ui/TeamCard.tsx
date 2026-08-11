import Image from "next/image";
import { User, Quote } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import type { TeamMember } from "@/lib/data/team";

interface TeamCardProps {
  member: TeamMember;
  delay?: number;
}

export function TeamCard({ member, delay = 0 }: TeamCardProps) {
  return (
    <Reveal delay={delay} className="h-full">
      <TiltCard gradientBorder className="flex h-full flex-col gap-6 p-8 sm:p-9">
        <div className="flex items-center gap-5">
          {/* Photo slot — drop a real headshot at /public/team/<name>.jpg and
              swap this for <Image src="/team/<name>.jpg" .../> once available. */}
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-white/25 bg-white/5">
            {member.photo ? (
              <Image
                src={member.photo}
                alt={member.name}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-9 w-9 text-white/30" strokeWidth={1.5} />
            )}
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
              {member.name}
            </h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-blue-soft">
              {member.role}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Quote className="mt-0.5 h-6 w-6 shrink-0 text-blue-soft" strokeWidth={1.5} />
          <p className="font-display text-lg font-medium leading-snug text-white sm:text-xl">
            {member.quote}
          </p>
        </div>

        <p className="border-t border-white/10 pt-5 text-sm leading-relaxed text-mist sm:text-base">
          {member.bio}
        </p>
      </TiltCard>
    </Reveal>
  );
}
