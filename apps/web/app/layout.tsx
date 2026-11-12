import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { getLocale } from "next-intl/server";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL, WEBSITE_JSON_LD } from "@/lib/site";
import "./globals.css";

/**
 * Self-hosted Inter and Newsreader (see globals.css). next/font Google downloads
 * break dev compiles when offline or the network is flaky.
 */
export const metadata: Metadata = {
  title: { default: SITE_TITLE, template: "%s · Agent KBase" },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className="light">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: WEBSITE_JSON_LD }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
