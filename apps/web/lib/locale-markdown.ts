import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Spanish markdown lives under public/es. Missing files fall back to English. */
export function readPublicMarkdown(locale: string, folder: string, slug: string): string | null {
  const relative = `${folder}/${slug}.md`;
  const english = join(process.cwd(), "public", relative);
  const candidates =
    locale === "es" ? [join(process.cwd(), "public", "es", relative), english] : [english];

  for (const path of candidates) {
    if (existsSync(path)) return readFileSync(path, "utf8");
  }
  return null;
}
