/** User pasted domains often omit https:// — normalize before extract API. */
export function normalizeSiteUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t.replace(/^\/\//, "")}`;
}

export function canExtractSiteUrl(raw: string): boolean {
  const normalized = normalizeSiteUrl(raw);
  if (normalized.length < 8) return false;
  try {
    const u = new URL(normalized);
    return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.includes(".");
  } catch {
    return false;
  }
}
