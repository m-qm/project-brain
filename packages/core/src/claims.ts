import { readBrainFile, listBrainFiles, type BrainSearchHit } from "./brain-files.js";

export type ClaimStatus = "confirmed" | "confirm";

export type BrainClaim = {
  text: string;
  path: string;
  line: number;
  status: ClaimStatus;
  section: string;
};

const CONFIRM_RE = /\[(?:CONFIRM|CONFIRMAR)\]/i;
const BULLET_RE = /^(\*|-)\s+/;
const HEADING_RE = /^(#{1,3})\s+(.+)$/;

function claimStatus(line: string, path: string): ClaimStatus {
  if (CONFIRM_RE.test(line) || path === "brain/open-questions.md") return "confirm";
  return "confirmed";
}

/** Parse one markdown file into claims (bullets and open-question lines). */
export function parseClaimsFromMarkdown(relPath: string, text: string): BrainClaim[] {
  const claims: BrainClaim[] = [];
  let section = "";
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const heading = raw.match(HEADING_RE);
    if (heading) {
      section = heading[2].trim();
      continue;
    }
    const line = raw.trim();
    if (!line || line.startsWith("<!--")) continue;
    const isBullet = BULLET_RE.test(line);
    const isOpenQuestions = relPath === "brain/open-questions.md" && line.startsWith("*");
    if (!isBullet && !isOpenQuestions) continue;
    const body = line.replace(BULLET_RE, "").trim();
    if (!body || body === "(none yet — add items the agent must not guess)") continue;
    claims.push({
      text: body,
      path: relPath,
      line: i + 1,
      status: claimStatus(body, relPath),
      section,
    });
  }
  return claims;
}

/** Claims from `brain/facts/*.md` and `brain/open-questions.md`. */
export async function buildClaimsIndex(dir: string): Promise<BrainClaim[]> {
  const files = (await listBrainFiles(dir)).filter(
    (p) => p.startsWith("brain/facts/") || p === "brain/open-questions.md",
  );
  const all: BrainClaim[] = [];
  for (const path of files) {
    const text = await readBrainFile(dir, path);
    all.push(...parseClaimsFromMarkdown(path, text));
  }
  return all;
}

export type ClaimSearchHit = BrainClaim & { score: number };

function scoreClaim(claim: BrainClaim, terms: string[]): number {
  const hay = `${claim.text} ${claim.section}`.toLowerCase();
  let score = 0;
  for (const term of terms) {
    if (hay.includes(term)) score += term.length > 3 ? 2 : 1;
  }
  if (claim.path.startsWith("brain/facts/")) score += 3;
  if (claim.status === "confirm") score -= 0.5;
  return score;
}

export function searchClaims(claims: BrainClaim[], query: string, limit = 50): ClaimSearchHit[] {
  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (terms.length === 0) return [];
  const scored: ClaimSearchHit[] = [];
  for (const claim of claims) {
    const hay = `${claim.section} ${claim.text}`.toLowerCase();
    if (!terms.some((t) => hay.includes(t))) continue;
    const score = scoreClaim(claim, terms);
    if (score <= 0) continue;
    scored.push({ ...claim, score });
  }
  scored.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path) || a.line - b.line);
  return scored.slice(0, limit);
}

export type BrainSearchWithClaimsResult = {
  query: string;
  claims: ClaimSearchHit[];
  hits: BrainSearchHit[];
  truncated: boolean;
};

const MAX_SEARCH_HITS = 50;

/**
 * Phase 2 search: ranked claims from facts first, then substring hits over all brain/.
 * Dedupes by path+line; claim hits appear only in `claims`.
 */
export async function searchBrainWithClaims(
  dir: string,
  query: string,
): Promise<BrainSearchWithClaimsResult> {
  const needle = query.trim().toLowerCase();
  if (!needle) throw new Error("Search query is empty.");

  const index = await buildClaimsIndex(dir);
  const claimHits = searchClaims(index, query, MAX_SEARCH_HITS);
  const claimKeys = new Set(claimHits.map((c) => `${c.path}:${c.line}`));

  const { searchBrainFiles } = await import("./brain-files.js");
  const fileResult = await searchBrainFiles(dir, query);
  const extraHits = fileResult.hits.filter((h) => !claimKeys.has(`${h.path}:${h.line}`));

  const claimsAsHits: BrainSearchHit[] = claimHits.map((c) => ({
    path: c.path,
    line: c.line,
    text: c.status === "confirm" ? `[CONFIRM] ${c.text}` : c.text,
  }));

  const combined = [...claimsAsHits, ...extraHits];
  const truncated = fileResult.truncated || combined.length > MAX_SEARCH_HITS;
  const hits = combined.slice(0, MAX_SEARCH_HITS);

  return {
    query,
    claims: claimHits,
    hits,
    truncated,
  };
}
