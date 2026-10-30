export type PageSignals = {
  lang: string;
  sourceUrl: string;
  title?: string;
  siteName?: string;
  metaDescription?: string;
  h1: string[];
  h2: string[];
  h3: string[];
  paragraphs: string[];
  /** Bullet lines from `<li>` (marketing steps, FAQs, features). */
  listItems: string[];
};

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripBoilerplate(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
}

function metaContent(html: string, attr: string, key: string): string | undefined {
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${key}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${key}["']`,
    "i",
  );
  const m = html.match(re) ?? html.match(re2);
  return m ? decodeHtml(m[1]) : undefined;
}

function tags(html: string, tag: string, limit: number): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null && out.length < limit) {
    const text = decodeHtml(m[1].replace(/<[^>]+>/g, " "));
    if (text.length > 2) out.push(text);
  }
  return out;
}

function paragraphs(html: string, limit: number): string[] {
  const re = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null && out.length < limit) {
    const text = decodeHtml(m[1].replace(/<[^>]+>/g, " "));
    if (text.length >= 35) out.push(text);
  }
  return out;
}

function listItems(html: string, limit: number): string[] {
  const re = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null && out.length < limit) {
    const text = decodeHtml(m[1].replace(/<[^>]+>/g, " "));
    if (text.length >= 12 && text.length <= 280) out.push(text);
  }
  return out;
}

export function parsePageSignals(html: string, sourceUrl: string): PageSignals {
  const cleaned = stripBoilerplate(html);
  const langMatch = html.match(/<html[^>]+lang=["']([a-z]{2}(-[a-z]{2})?)["']/i);
  const lang = langMatch?.[1]?.split("-")[0] ?? "en";

  return {
    lang,
    sourceUrl,
    title: (() => {
      const m = cleaned.match(/<title[^>]*>([^<]+)<\/title>/i);
      return m ? decodeHtml(m[1]) : undefined;
    })(),
    siteName: metaContent(html, "property", "og:site_name"),
    metaDescription:
      metaContent(html, "property", "og:description") ??
      metaContent(html, "name", "description"),
    h1: tags(cleaned, "h1", 3),
    h2: tags(cleaned, "h2", 16),
    h3: tags(cleaned, "h3", 12),
    paragraphs: paragraphs(cleaned, 32),
    listItems: listItems(cleaned, 24),
  };
}
