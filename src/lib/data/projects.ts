export type ProjectCategoryKey = "healthcare" | "interior-design" | "fitness";

export interface Project {
  title: string;
  /** Display label shown on the card. */
  category: string;
  /** Filter key this project belongs to — matched against WORK_FILTERS. */
  categoryKey: ProjectCategoryKey;
  description: string;
  image: string;
  liveUrl: string;
}

/**
 * Four real, live Webora client/demo builds — the site's actual proof of
 * work. Titles, categories, copy and URLs are pinned to the brief; do not
 * invent alternates for any `liveUrl`.
 */
export const PROJECTS: Project[] = [
  {
    title: "Pattath Dental Clinic",
    category: "Healthcare / Dental",
    categoryKey: "healthcare",
    description:
      "A modern digital experience designed for a dental clinic, focusing on trust, treatment discovery, doctor information and easy patient enquiries.",
    image: "/portfolio/pattath-dental/preview.webp",
    liveUrl: "https://pattath-dental-clinic.vercel.app/",
  },
  {
    title: "Sri Sankalp Interio",
    category: "Interior Design",
    categoryKey: "interior-design",
    description:
      "A visually driven website concept focused on showcasing interior design work, design concepts and the brand's visual identity.",
    image: "/portfolio/sri-sankalp/preview.webp",
    liveUrl: "https://sri-sankalp-interio.vercel.app/",
  },
  {
    title: "BE FIT Fitness Center",
    category: "Gym / Fitness",
    categoryKey: "fitness",
    description:
      "A high-energy fitness website concept designed to showcase the gym, training experience, facilities and membership enquiry journey.",
    image: "/portfolio/be-fit/preview.webp",
    liveUrl: "https://be-fit-gym-demo.vercel.app/",
  },
  {
    title: 'SLIM "N" TRIM',
    category: "Family Fitness / Gym",
    categoryKey: "fitness",
    description:
      "A premium fitness website concept built around family fitness, personal training, coaching and a strong local digital presence.",
    image: "/portfolio/slim-n-trim/preview.webp",
    liveUrl: "https://gym-demo2-alpha.vercel.app/",
  },
];

export const WORK_FILTERS: { key: "all" | ProjectCategoryKey; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "healthcare", label: "HEALTHCARE" },
  { key: "interior-design", label: "INTERIOR DESIGN" },
  { key: "fitness", label: "FITNESS" },
];
