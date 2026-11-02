import { MAX_EXTRA_PAGES } from "./extract-bounds.js";
import { validatePublicHttpUrl } from "./url-security.js";

const PATH_KEYWORDS = [
  "about",
  "pricing",
  "price",
  "product",
  "products",
  "services",
  "service",
  "company",
  "how",
  "faq",
  "features",
  "platform",
  "solutions",
  "team",
];

function stripBoilerplate(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
}

function extractHrefs(html: string): string[] {
  const out: string[] = [];
  const re = /<a[^>]+href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(stripBoilerplate(html))) !== null) {
    out.push(m[1].trim());
  }
  return out;
}

function scorePath(pathname: string): number {
  const lower = pathname.toLowerCase();
  let score = 0;
  for (const kw of PATH_KEYWORDS) {
    if (lower.includes(`/${kw}`) || lower.includes(`${kw}-`) || lower.endsWith(kw)) {
      score += 10;
    }
  }
  if (lower === "/" || lower === "") score -= 5;
  if (/\.(pdf|zip|png|jpg|jpeg|gif|svg|webp|mp4)$/i.test(lower)) score -= 100;
  if (lower.includes("login") || lower.includes("signup") || lower.includes("cart")) {
    score -= 50;
  }
  const depth = lower.split("/").filter(Boolean).length;
  if (depth <= 2) score += 2;
  return score;
}

function sameHost(a: URL, b: URL): boolean {
  return a.hostname.toLowerCase() === b.hostname.toLowerCase();
}

/** Heuristic same-site links from seed HTML (no LLM). */
export function discoverSameOriginLinks(seedUrl: string, seedHtml: string): string[] {
  const seedCheck = validatePublicHttpUrl(seedUrl);
  if (!seedCheck.ok) return [];

  const seedParsed = seedCheck.url;
  const seen = new Set<string>();
  const candidates: { url: string; score: number }[] = [];

  for (const href of extractHrefs(seedHtml)) {
    let resolved: URL;
    try {
      resolved = new URL(href, seedParsed);
    } catch {
      continue;
    }
    if (!sameHost(resolved, seedParsed)) continue;
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") continue;

    resolved.hash = "";
    const normalized = resolved.toString();
    if (normalized === seedParsed.toString()) continue;

    const check = validatePublicHttpUrl(normalized);
    if (!check.ok) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    candidates.push({
      url: check.url.toString(),
      score: scorePath(check.url.pathname),
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, MAX_EXTRA_PAGES).map((c) => c.url);
}
