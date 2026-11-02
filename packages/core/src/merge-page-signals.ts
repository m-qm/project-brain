import type { PageSignals } from "./extract-page-signals.js";

function dedupeStrings(items: string[], max: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const t = raw.trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

/** Merge multiple page parses into one excerpt-friendly signal bundle. */
export function mergePageSignals(pages: PageSignals[]): PageSignals {
  if (pages.length === 0) {
    return {
      lang: "en",
      sourceUrl: "",
      h1: [],
      h2: [],
      h3: [],
      paragraphs: [],
      listItems: [],
    };
  }

  const primary = pages[0];
  const lang =
    pages.find((p) => p.lang === "es")?.lang ??
    pages.find((p) => p.lang !== "en")?.lang ??
    primary.lang;

  return {
    lang,
    sourceUrl: primary.sourceUrl,
    title: primary.title ?? pages.find((p) => p.title)?.title,
    siteName: primary.siteName ?? pages.find((p) => p.siteName)?.siteName,
    metaDescription:
      primary.metaDescription ?? pages.find((p) => p.metaDescription)?.metaDescription,
    h1: dedupeStrings(pages.flatMap((p) => p.h1), 6),
    h2: dedupeStrings(pages.flatMap((p) => p.h2), 16),
    h3: dedupeStrings(pages.flatMap((p) => p.h3), 8),
    paragraphs: dedupeStrings(pages.flatMap((p) => p.paragraphs), 18),
    listItems: dedupeStrings(pages.flatMap((p) => p.listItems), 14),
  };
}
