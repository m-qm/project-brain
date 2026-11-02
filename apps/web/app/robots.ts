import type { MetadataRoute } from "next";
import { AI_CRAWLERS, SITE_URL } from "@/lib/site";

const contentRules = {
  allow: "/",
  disallow: "/api/",
} as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", ...contentRules },
      { userAgent: [...AI_CRAWLERS], ...contentRules },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: "agentkbase.com",
  };
}
