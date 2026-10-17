import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "../globals.css";
import "./crm.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "WEBORA CRM", template: "%s · WEBORA CRM" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#061427", colorScheme: "dark" };

/** Separate root layout: the CRM gets none of the marketing site's chrome. */
export default function CrmRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="crm min-h-screen antialiased">{children}</body>
    </html>
  );
}
