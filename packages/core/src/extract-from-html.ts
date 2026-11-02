import type { BrainInput } from "./types.js";
import { parsePageSignals, type PageSignals } from "./extract-page-signals.js";
import { synthesizeBrainFromPage } from "./synthesize-from-page.js";
import type { ExtractScanMode } from "./extract-bounds.js";
import type { ExtractScanLogEntry } from "./extract-scan-log.js";
import { hasExtractLlmKey, type ExtractLlmProvider } from "./extract-with-llm.js";

function baseWarnings(signals: PageSignals): string[] {
  const warnings: string[] = [
    signals.lang === "es"
      ? "Análisis del HTML público. Revisa cada campo; el copy de producto (precio/plazo) no es toda la misión de la empresa."
      : "Public HTML analysis. Review every field; a product SKU line is not the whole company mission.",
    signals.lang === "es"
      ? "No se generan skills de Cursor: solo facts/stories. Añade skills con SkillTree o a mano."
      : "Does not generate Cursor skills—only facts/stories. Add skills via SkillTree or manually.",
  ];

  if (!hasExtractLlmKey()) {
    warnings.push(
      signals.lang === "es"
        ? "Sin ANTHROPIC_API_KEY (o OPENAI_API_KEY): síntesis heurística. Define la clave en el servidor o CLI para un pase LLM."
        : "No ANTHROPIC_API_KEY (or OPENAI_API_KEY): heuristic synthesis only. Set a key on server or CLI for an LLM pass.",
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
  return warnings;
}

export function websiteExtractFromSignals(
  signals: PageSignals,
  sourceUrl: string,
  scanMode: ExtractScanMode,
  pagesFetched: string[],
  extraWarnings: string[] = [],
  scanLog: ExtractScanLogEntry[] = [],
): WebsiteExtract {
  const suggested = synthesizeBrainFromPage(signals);
  return {
    sourceUrl,
    suggested,
    warnings: [...baseWarnings(signals), ...extraWarnings],
    method: "heuristic",
    scanMode,
    pagesFetched,
    scanLog,
    raw: {
      title: signals.title,
      description: signals.metaDescription,
      siteName: signals.siteName,
      h1: signals.h1[0],
    },
  };
}

export type WebsiteExtract = {
  sourceUrl: string;
  suggested: Partial<BrainInput>;
  warnings: string[];
  method: "heuristic" | "anthropic" | "openai";
  scanMode: ExtractScanMode;
  pagesFetched: string[];
  scanLog: ExtractScanLogEntry[];
  raw: {
    title?: string;
    description?: string;
    siteName?: string;
    h1?: string;
  };
};

export function extractBrainFromHtml(html: string, sourceUrl: string): WebsiteExtract {
  const signals = parsePageSignals(html, sourceUrl);
  return websiteExtractFromSignals(signals, sourceUrl, "single", [sourceUrl]);
}

function stripMissingKeyWarnings(warnings: string[]): string[] {
  return warnings.filter(
    (w) =>
      !w.includes("ANTHROPIC_API_KEY") &&
      !w.includes("OPENAI_API_KEY") &&
      !w.includes("Sin ANTHROPIC") &&
      !w.includes("No ANTHROPIC"),
  );
}

export function applyLlmSuggestion(
  base: WebsiteExtract,
  llm: Partial<BrainInput>,
  provider: ExtractLlmProvider,
): WebsiteExtract {
  const vendor = provider === "anthropic" ? "Anthropic" : "OpenAI";
  return {
    ...base,
    suggested: llm,
    method: provider,
    warnings: [
      ...stripMissingKeyWarnings(base.warnings),
      `Fields enriched with ${vendor} from page excerpt. Still require human review before export.`,
    ],
  };
}

export { mergeExtractIntoBrain } from "./extract-from-html-merge.js";
