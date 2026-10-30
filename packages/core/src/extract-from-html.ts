import type { BrainInput } from "./types.js";
import { parsePageSignals } from "./extract-page-signals.js";
import { synthesizeBrainFromPage } from "./synthesize-from-page.js";

export type WebsiteExtract = {
  sourceUrl: string;
  suggested: Partial<BrainInput>;
  warnings: string[];
  method: "heuristic" | "openai";
  raw: {
    title?: string;
    description?: string;
    siteName?: string;
    h1?: string;
  };
};

export function extractBrainFromHtml(html: string, sourceUrl: string): WebsiteExtract {
  const signals = parsePageSignals(html, sourceUrl);
  const suggested = synthesizeBrainFromPage(signals);

  const warnings: string[] = [
    signals.lang === "es"
      ? "Análisis del HTML público. Revisa cada campo; el copy de producto (precio/plazo) no es toda la misión de la empresa."
      : "Public HTML analysis. Review every field; a product SKU line is not the whole company mission.",
    signals.lang === "es"
      ? "No se generan skills de Cursor: solo facts/stories. Añade skills con SkillTree o a mano."
      : "Does not generate Cursor skills—only facts/stories. Add skills via SkillTree or manually.",
  ];

  if (!process.env.OPENAI_API_KEY?.trim()) {
    warnings.push(
      signals.lang === "es"
        ? "Sin OPENAI_API_KEY: síntesis heurística. Exporta más rico si defines la clave en el servidor o CLI."
        : "No OPENAI_API_KEY: heuristic synthesis only. Set the key on server or CLI for a richer pass.",
    );
  }

  if (signals.metaDescription && signals.h1[0]) {
    const meta = signals.metaDescription.toLowerCase();
    const h1 = signals.h1[0].toLowerCase();
    if (meta.length < 120 && !h1.includes(meta.slice(0, 30))) {
      warnings.push(
        signals.lang === "es"
          ? "La meta description parece un anuncio concreto; la descripción principal se sintetizó desde titular y cuerpo."
          : "Meta description looks like a specific ad; main description was synthesized from headings and body.",
      );
    }
  }

  return {
    sourceUrl,
    suggested,
    warnings,
    method: "heuristic",
    raw: {
      title: signals.title,
      description: signals.metaDescription,
      siteName: signals.siteName,
      h1: signals.h1[0],
    },
  };
}

export function applyLlmSuggestion(
  base: WebsiteExtract,
  llm: Partial<BrainInput>,
): WebsiteExtract {
  return {
    ...base,
    suggested: llm,
    method: "openai",
    warnings: [
      ...base.warnings,
      "Fields enriched with OpenAI from page excerpt. Still require human review before export.",
    ],
  };
}

export { mergeExtractIntoBrain } from "./extract-from-html-merge.js";
