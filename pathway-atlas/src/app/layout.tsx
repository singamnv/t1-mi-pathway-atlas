import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

// Design type system (Claude Design "Pathway Atlas"): Space Grotesk for display,
// IBM Plex Sans for body, IBM Plex Mono for kickers/labels/data. Self-hosted at build.
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CoronaryAtlas — Type 1 MI molecular atlas",
    template: "%s — CoronaryAtlas",
  },
  description:
    "CoronaryAtlas: a de novo molecular atlas of the Type 1 (atherothrombotic) myocardial infarction pathway — every molecule placed in its cascade step with linked evidence.",
  icons: {
    icon: "/icon.svg",
    apple: "/logo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f9fd",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable} ${spaceGrotesk.variable}`}>
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
