import type { Metadata } from "next";
import "./globals.css";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
