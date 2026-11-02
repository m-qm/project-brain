import { MAX_EXTRA_PAGES } from "./extract-bounds.js";
import { discoverSameOriginLinks } from "./discover-same-origin-links.js";
import { hasExtractLlmKey, type ExtractLlmProvider } from "./extract-with-llm.js";
import type { PageSignals } from "./extract-page-signals.js";
import { validatePublicHttpUrl } from "./url-security.js";

export type DeepExtractPlan = {
  urls: string[];
  usedLlm: boolean;
  llmProvider?: ExtractLlmProvider;
};

function parsePathsJson(content: string): string[] | null {
  const stripped = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    const parsed = JSON.parse(stripped) as { paths?: unknown };
    if (!Array.isArray(parsed.paths)) return null;
    return parsed.paths
      .filter((p): p is string => typeof p === "string")
      .map((p) => p.trim())
      .filter(Boolean)
      .slice(0, MAX_EXTRA_PAGES);
  } catch {
    return null;
  }
}

function resolveSameOriginPaths(seedUrl: string, paths: string[]): string[] {
  const seedCheck = validatePublicHttpUrl(seedUrl);
  if (!seedCheck.ok) return [];
  const seed = seedCheck.url;
  const out: string[] = [];
  const seen = new Set<string>();

  for (const path of paths) {
    let resolved: URL;
    try {
      resolved = path.startsWith("http") ? new URL(path) : new URL(path, seed);
    } catch {
      continue;
    }
    if (resolved.hostname.toLowerCase() !== seed.hostname.toLowerCase()) continue;
    resolved.hash = "";
    const check = validatePublicHttpUrl(resolved.toString());
    if (!check.ok) continue;
    const url = check.url.toString();
    if (url === seed.toString() || seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  return out.slice(0, MAX_EXTRA_PAGES);
}

async function planWithAnthropic(
  seedUrl: string,
  candidateUrls: string[],
  signals: PageSignals,
): Promise<string[] | null> {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return null;

  const model = process.env.ANTHROPIC_EXTRACT_MODEL?.trim() ?? "claude-3-5-haiku-latest";
  const prompt = `Pick up to ${MAX_EXTRA_PAGES} URL paths from the candidate list to best understand this company's positioning for an agent knowledge base.
Return ONLY JSON: {"paths":["/about",...]} using paths from candidates (full URLs allowed).
Seed: ${seedUrl}
Title: ${signals.title ?? ""}
H1: ${signals.h1.slice(0, 3).join(" | ")}
Candidates:
${candidateUrls.join("\n")}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 512,
      temperature: 0,
      system: "Output strict JSON only.",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.find((b) => b.type === "text")?.text;
  if (!text) return null;
  const paths = parsePathsJson(text);
  if (!paths) return null;
  return resolveSameOriginPaths(seedUrl, paths);
}

async function planWithOpenAI(
  seedUrl: string,
  candidateUrls: string[],
  signals: PageSignals,
): Promise<string[] | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const prompt = `Pick up to ${MAX_EXTRA_PAGES} URLs from candidates for company positioning research.
Return ONLY JSON {"paths":[...]}.
Seed: ${seedUrl}
Title: ${signals.title ?? ""}
Candidates:
${candidateUrls.join("\n")}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_EXTRACT_MODEL ?? "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Output strict JSON only." },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;
  const paths = parsePathsJson(content);
  if (!paths) return null;
  return resolveSameOriginPaths(seedUrl, paths);
}

/** LLM picks extra pages from heuristic candidates; null if no API key or LLM disallowed. */
export async function planDeepExtractUrls(
  seedUrl: string,
  seedHtml: string,
  signals: PageSignals,
  options?: { allowServerLlm?: boolean },
): Promise<DeepExtractPlan | null> {
  if (options?.allowServerLlm === false) return null;
  if (!hasExtractLlmKey()) return null;
  const candidates = discoverSameOriginLinks(seedUrl, seedHtml);
  if (candidates.length === 0) {
    return { urls: [], usedLlm: false };
  }

  const anthropic = await planWithAnthropic(seedUrl, candidates, signals);
  if (anthropic) {
    return { urls: anthropic, usedLlm: true, llmProvider: "anthropic" };
  }

  const openai = await planWithOpenAI(seedUrl, candidates, signals);
  if (openai) {
    return { urls: openai, usedLlm: true, llmProvider: "openai" };
  }

  return { urls: discoverSameOriginLinks(seedUrl, seedHtml), usedLlm: false };
}
