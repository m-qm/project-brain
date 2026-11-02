import type { BrainInput } from "./types.js";
import { hasExtractLlmKey } from "./extract-with-llm.js";

export type GapSuggestion = {
  question: string;
  draftAnswer: string;
  source: "facts" | "inferred";
};

export type GapFillResult = {
  suggestions: GapSuggestion[];
  warnings: string[];
};

export type GapFillOptions = {
  /** When false, refuse LLM calls (public web without auth). Default true. */
  allowServerLlm?: boolean;
};

function parseGapJson(content: string): GapSuggestion[] | null {
  const stripped = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    const parsed = JSON.parse(stripped) as { suggestions?: unknown };
    if (!Array.isArray(parsed.suggestions)) return null;
    const out: GapSuggestion[] = [];
    for (const item of parsed.suggestions) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const question = typeof row.question === "string" ? row.question.trim() : "";
      const draftAnswer = typeof row.draftAnswer === "string" ? row.draftAnswer.trim() : "";
      const source = row.source === "facts" ? "facts" : "inferred";
      if (!question || !draftAnswer) continue;
      out.push({ question, draftAnswer, source });
    }
    return out;
  } catch {
    return null;
  }
}

function buildGapPrompt(input: BrainInput): string {
  const facts = input.factBullets.map((s) => s.trim()).filter(Boolean);
  const gaps = input.openQuestions.map((s) => s.trim()).filter(Boolean);
  return `You help draft answers for open questions in an agent knowledge base (brain/).
Return ONLY JSON: {"suggestions":[{"question":"...","draftAnswer":"...","source":"facts"|"inferred"}]}

Rules:
- One suggestion per open question when possible.
- source=facts only when answer is directly supported by fact bullets or story fields below.
- source=inferred for careful drafts; do not invent metrics, customer names, or revenue.
- Keep [CONFIRM] tone: drafts are not final facts until a human accepts them.
- Do not remove uncertainty; say "unclear from draft" when needed.

Project: ${input.projectName}
Description: ${input.projectDescription}
Facts:
${facts.map((f) => `- ${f}`).join("\n")}

Story problem: ${input.storyProblem}
Story built: ${input.storyBuilt}
Story proof: ${input.storyProof}

Open questions:
${gaps.map((g) => `- ${g}`).join("\n")}`;
}

async function suggestWithAnthropic(prompt: string): Promise<GapSuggestion[] | null> {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return null;
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
      max_tokens: 2048,
      temperature: 0.2,
      system: "Output strict JSON only.",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.find((b) => b.type === "text")?.text;
  if (!text) return null;
  return parseGapJson(text);
}

async function suggestWithOpenAI(prompt: string): Promise<GapSuggestion[] | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
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
        { role: "system", content: "Output strict JSON only." },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;
  return parseGapJson(content);
}

export async function suggestGapFills(
  input: BrainInput,
  options: GapFillOptions = {},
): Promise<GapFillResult> {
  const warnings: string[] = [];
  const gaps = input.openQuestions.map((s) => s.trim()).filter(Boolean);

  if (gaps.length === 0) {
    return {
      suggestions: [],
      warnings: ["No open questions in draft. Add gaps before requesting suggestions."],
    };
  }

  if (options.allowServerLlm === false) {
    return {
      suggestions: [],
      warnings: [
        "LLM gap suggestions are disabled on the public wizard so nobody can burn a shared API key. Use brain fill-gaps locally with ANTHROPIC_API_KEY, or self-host with AGENTKBASE_ALLOW_SERVER_LLM=true behind auth.",
      ],
    };
  }

  if (!hasExtractLlmKey()) {
    return {
      suggestions: [],
      warnings: [
        "Set ANTHROPIC_API_KEY or OPENAI_API_KEY for gap suggestions. Heuristic-only mode has no gap fill.",
      ],
    };
  }

  const prompt = buildGapPrompt(input);
  const suggestions =
    (await suggestWithAnthropic(prompt)) ?? (await suggestWithOpenAI(prompt)) ?? [];

  if (suggestions.length === 0) {
    warnings.push("LLM returned no suggestions. Try again or edit gaps manually.");
  } else {
    warnings.push(
      "Suggestions are drafts only. Apply in wizard or edit brain/ before export; validation still required.",
    );
  }

  return { suggestions, warnings };
}
