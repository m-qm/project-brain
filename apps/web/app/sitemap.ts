import type { MetadataRoute } from "next";
import { localizedUrl } from "@/lib/site";
import { BLOG_POSTS } from "./[locale]/blog/blog-docs";
import { LEGAL_DOCS } from "./[locale]/legal/legal-docs";
import { LEARN_DOCS } from "./[locale]/learn/learn-docs";

const pages: {
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
}[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/learn", priority: 0.9, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
  { path: "/wizard", priority: 0.8, changeFrequency: "monthly" },
  { path: "/skilltree", priority: 0.7, changeFrequency: "monthly" },
  { path: "/company-brain", priority: 0.7, changeFrequency: "weekly" },
  { path: "/tree", priority: 0.3, changeFrequency: "yearly" },
];

function entry(
  path: string,
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>,
  priority: number,
): MetadataRoute.Sitemap {
  const languages = {
    en: localizedUrl(path, "en"),
    es: localizedUrl(path, "es"),
    "x-default": localizedUrl(path, "en"),
  };
  return (["en", "es"] as const).map((locale) => ({
    url: localizedUrl(path, locale),
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...pages.flatMap((page) => entry(page.path, page.changeFrequency, page.priority)),
    ...BLOG_POSTS.flatMap((post) => entry(`/blog/${post.slug}`, "monthly", 0.7)),
    ...LEARN_DOCS.flatMap((doc) => entry(`/learn/${doc.slug}`, "monthly", 0.8)),
    ...LEGAL_DOCS.flatMap((doc) => entry(`/legal/${doc.slug}`, "yearly", 0.4)),
  ];
}
