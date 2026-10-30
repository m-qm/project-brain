import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { SiteFooter } from "./components/SiteFooter";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Agent KBase · Git native brain for Cursor agents",
  description:
    "Skills tell the agent what it can do. Agent KBase holds curated facts in brain/ for your repo. OSS CLI and wizard.",
  metadataBase: new URL("https://agentkbase.com"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${instrument.variable}`}>
      <body className="light">
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
