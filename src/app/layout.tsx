import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SITE_URL, SOCIAL_LINKS } from "@/lib/constants";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { LaunchScreen } from "@/components/motion/LaunchScreen";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "WEBORA — We Build Websites That Grow Brands",
    template: "%s — WEBORA",
  },
  description:
    "WEBORA builds professional websites, e-commerce stores and digital experiences that help businesses grow online.",
  keywords: [
    "web development",
    "website design",
    "business website",
    "e-commerce website",
    "website development company",
    "website redesign",
    "responsive website",
    "UI UX design",
    "local business website",
  ],
  authors: [{ name: "WEBORA" }],
  creator: "WEBORA",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "WEBORA",
    title: "WEBORA — We Build Websites That Grow Brands",
    description:
      "WEBORA builds professional websites, e-commerce stores and digital experiences that help businesses grow online.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WEBORA — We Build Websites That Grow Brands",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WEBORA — We Build Websites That Grow Brands",
    description:
      "WEBORA builds professional websites, e-commerce stores and digital experiences that help businesses grow online.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071a33",
  colorScheme: "light",
};

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "WEBORA",
  description:
    "WEBORA builds professional websites, e-commerce stores and digital experiences that help businesses grow online.",
  slogan: "We Build Websites That Grow Brands",
  url: SITE_URL,
  email: "webora99@gmail.com",
  sameAs: [SOCIAL_LINKS.instagram.href, SOCIAL_LINKS.linkedin.href],
  areaServed: "IN",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} scroll-smooth`}
    >
      <body className="bg-white text-navy antialiased selection:bg-blue selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        <SmoothScroll />
        <LaunchScreen />
        <Navbar />
        <main>{children}</main>
        <WhatsAppFab />
        <Footer />
      </body>
    </html>
  );
}
