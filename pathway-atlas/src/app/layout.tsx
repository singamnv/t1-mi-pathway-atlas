import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Type 1 MI Pathway Atlas",
  description:
    "De novo molecular atlas of the Type 1 (atherothrombotic) myocardial infarction pathway — every molecule placed in its cascade step with linked evidence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
