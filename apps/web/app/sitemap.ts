import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { LEARN_DOCS } from "./learn/learn-docs";

const pages: {
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
}[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/learn", priority: 0.9, changeFrequency: "weekly" },
  { path: "/wizard", priority: 0.8, changeFrequency: "monthly" },
  { path: "/skilltree", priority: 0.7, changeFrequency: "monthly" },
  { path: "/company-brain", priority: 0.7, changeFrequency: "weekly" },
  { path: "/tree", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...pages.map((page) => ({
      url: page.path === "/" ? SITE_URL : `${SITE_URL}${page.path}`,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...LEARN_DOCS.map((doc) => ({
      url: `${SITE_URL}/learn/${doc.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
