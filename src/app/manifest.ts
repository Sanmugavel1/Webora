import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WEBORA — We Build Websites That Grow Brands",
    short_name: "WEBORA",
    description:
      "WEBORA builds professional websites, e-commerce stores and digital experiences that help businesses grow online.",
    start_url: "/",
    display: "standalone",
    background_color: "#071a33",
    theme_color: "#071a33",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
