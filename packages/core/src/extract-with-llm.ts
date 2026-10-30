import type { BrainInput } from "./types.js";
import type { PageSignals } from "./extract-page-signals.js";

const EXCERPT_MAX = 4500;

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

export async function enrichExtractWithOpenAI(
  signals: PageSignals,
  heuristic: Partial<BrainInput>,
): Promise<Partial<BrainInput> | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const lang = signals.lang === "es" ? "Spanish" : "English";
  const prompt = `You analyze a public marketing website for an "agent knowledge base" (brain/) used by AI coding agents.
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
- openQuestions = what a human must still confirm (include that skills are not auto-generated).

Website excerpt:
${buildExcerpt(signals)}

Heuristic draft (improve, do not copy meta blindly):
${JSON.stringify(heuristic, null, 0)}`;

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

  try {
    const parsed = JSON.parse(content) as Partial<BrainInput>;
    if (!parsed.projectName || !parsed.projectDescription) return null;
    return parsed;
  } catch {
    return null;
  }
}
