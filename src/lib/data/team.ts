export interface TeamMember {
  name: string;
  role: string;
  quote: string;
  bio: string;
  /** Set once a real headshot is available — see TeamCard for the placeholder it falls back to. */
  photo?: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Sanmugavel B",
    role: "Co-Founder / Tech Lead",
    quote:
      "“We don’t just ship code, we build the engine your business runs on.”",
    bio: "Owns the architecture end to end — from a fast, reliable build to a site that keeps working long after launch.",
    photo: "/team/sanmugavel.jpg",
  },
  {
    name: "Naveen",
    role: "Co-Founder / Outreach & Engagement",
    quote:
      "“The best websites start with listening — understand the business first, then build.”",
    bio: "The first conversation with every client, making sure what we build actually fits how their business works.",
    photo: "/team/naveen.jpg",
  },
];
