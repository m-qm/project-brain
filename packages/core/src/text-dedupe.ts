export function normalizeForDedupe(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isMostlyContained(shorter: string, longer: string): boolean {
  const a = normalizeForDedupe(shorter);
  const b = normalizeForDedupe(longer);
  if (!a || a.length < 24) return false;
  return b.includes(a) || a.includes(b.slice(0, Math.min(b.length, a.length + 20)));
}

export function uniqueSentences(sentences: string[]): string[] {
  const out: string[] = [];
  for (const raw of sentences) {
    const s = raw.trim();
    if (!s) continue;
    if (out.some((prev) => isMostlyContained(s, prev) || isMostlyContained(prev, s))) {
      continue;
    }
    out.push(s);
  }
  return out;
}

export function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]+/g);
  return parts ? parts.map((p) => p.trim()) : [text.trim()];
}
