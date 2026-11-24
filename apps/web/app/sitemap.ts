import type { MetadataRoute } from "next";
import { localizedUrl } from "@/lib/site";
import { LEGAL_DOCS } from "./[locale]/legal/legal-docs";

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
    ...entry("/", "weekly", 1),
    ...LEGAL_DOCS.flatMap((doc) => entry(`/legal/${doc.slug}`, "yearly", 0.3)),
  ];
}
