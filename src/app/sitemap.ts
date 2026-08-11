import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

const ROUTES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/problem", priority: 0.8 },
  { path: "/services", priority: 0.9 },
  { path: "/team", priority: 0.7 },
  { path: "/pricing", priority: 0.9 },
  { path: "/contact", priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority,
  }));
}
