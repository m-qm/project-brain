import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL, WEBSITE_JSON_LD } from "@/lib/site";
import { SiteFooter } from "./components/SiteFooter";
import "./globals.css";

/**
 * System fonts only (see globals.css). next/font Google downloads break dev compiles
 * when offline or flaky network ("Cannot read properties of null" during /wizard compile).
 */
export const metadata: Metadata = {
  title: { default: SITE_TITLE, template: "%s · Agent KBase" },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  verification: {
    google: "M96S9AHIik31vh6b5gHGhWfxQeUcO6Hpi3BPnHnwsbA",
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="light">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: WEBSITE_JSON_LD }}
        />
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
