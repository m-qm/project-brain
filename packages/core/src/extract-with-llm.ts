import type { BrainInput } from "./types.js";
import type { PageSignals } from "./extract-page-signals.js";

const EXCERPT_MAX = 4500;

export type ExtractLlmProvider = "anthropic" | "openai";

function buildExcerpt(signals: PageSignals): string {
  const parts = [
    `URL: ${signals.sourceUrl}`,
    signals.title ? `Title: ${signals.title}` : "",
    signals.metaDescription ? `Meta: ${signals.metaDescription}` : "",
    signals.h1.length ? `H1: ${signals.h1.join(" | ")}` : "",
    signals.h2.length ? `H2: ${signals.h2.slice(0, 14).join(" | ")}` : "",
    signals.paragraphs.length
      ? `Body: ${signals.paragraphs.slice(0, 14).join("\n")}`
      : "",
    signals.listItems.length
      ? `Lists: ${signals.listItems.slice(0, 10).join(" | ")}`
      : "",
  ];
  return parts.filter(Boolean).join("\n\n").slice(0, EXCERPT_MAX);
}

function buildExtractPrompt(signals: PageSignals, heuristic: Partial<BrainInput>): string {
  const lang = signals.lang === "es" ? "Spanish" : "English";
  return `You analyze a public marketing website for an "agent knowledge base" (brain/) used by AI coding agents.
Write in ${lang} for user-facing fields.

Return ONLY valid JSON with these keys:
projectName, projectMission (1-2 sentences, third person), projectDescription (same as mission unless you add a shorter tagline), factBullets (array of 5-10 distinct strings, third person, no duplicate of mission), storyTitle, storyProblem, storyBuilt, storyProof, openQuestions (array of 3-5 strings)

Rules:
- projectDescription = what the COMPANY does for WHOM, not a single SKU tagline pasted from meta.
- Separate business mission from one priced offer (e.g. a €99 report is a product tier, not the whole company).
- factBullets = checkable claims: problem, inputs, process/funnel, method, deliverable, privacy boundaries, sample/demo if any, pricing tier if visible.
- storyBuilt = delivery/process narrative, not a copy-paste of factBullets.
- Do NOT output Cursor skills, SKILL.md, or tool recipes; skills come from SkillTree separately.
- Do not invent metrics, customers, or features not supported by the excerpt.
- Never use a generic "AI tool spend / invoices / member export / without logging into vendor accounts" mission unless the excerpt clearly describes that exact business.
- openQuestions = what a human must still confirm (include that skills are not auto-generated).

Website excerpt:
${buildExcerpt(signals)}

Heuristic draft (improve, do not copy meta blindly):
${JSON.stringify(heuristic, null, 0)}`;
}

function parseBrainJson(content: string): Partial<BrainInput> | null {
  const stripped = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    const parsed = JSON.parse(stripped) as Partial<BrainInput>;
    if (!parsed.projectName || !parsed.projectDescription) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasExtractLlmKey(): boolean {
  return Boolean(
    process.env.ANTHROPIC_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim(),
  );
}

export async function enrichExtractWithAnthropic(
  signals: PageSignals,
  heuristic: Partial<BrainInput>,
): Promise<Partial<BrainInput> | null> {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return null;

  const prompt = buildExtractPrompt(signals, heuristic);
  const model = process.env.ANTHROPIC_EXTRACT_MODEL?.trim() ?? "claude-3-5-haiku-latest";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      temperature: 0.2,
      system:
        "You output strict JSON only, no markdown fences. You synthesize business positioning for agent context.",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text = data.content?.find((b) => b.type === "text")?.text;
  if (!text) return null;
  return parseBrainJson(text);
}

export async function enrichExtractWithOpenAI(
  signals: PageSignals,
  heuristic: Partial<BrainInput>,
): Promise<Partial<BrainInput> | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const prompt = buildExtractPrompt(signals, heuristic);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_EXTRACT_MODEL ?? "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You output strict JSON only. You synthesize business positioning for agent context.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;
  return parseBrainJson(content);
}

/** Anthropic first (if key set), then OpenAI fallback. */
export async function enrichExtractWithLlm(
  signals: PageSignals,
  heuristic: Partial<BrainInput>,
): Promise<{ suggestion: Partial<BrainInput>; provider: ExtractLlmProvider } | null> {
  const anthropic = await enrichExtractWithAnthropic(signals, heuristic);
  if (anthropic) return { suggestion: anthropic, provider: "anthropic" };

  const openai = await enrichExtractWithOpenAI(signals, heuristic);
  if (openai) return { suggestion: openai, provider: "openai" };

  return null;
}
