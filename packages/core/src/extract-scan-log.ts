import type { ExtractLlmProvider } from "./extract-with-llm.js";

export type ExtractScanLogEntry = {
  step: "fetch" | "discover" | "merge" | "heuristic" | "llm_plan" | "llm_enrich";
  message: string;
  /** Whether this step invoked an LLM API call. */
  usedLlm: boolean;
  llmProvider?: ExtractLlmProvider;
  url?: string;
};

export function logFetch(url: string, ok: boolean): ExtractScanLogEntry {
  return {
    step: "fetch",
    message: ok ? `Fetched ${url}` : `Failed to fetch ${url}`,
    usedLlm: false,
    url,
  };
}

export function logDiscover(
  mode: "heuristic" | "deep_fallback" | "deep_llm",
  urls: string[],
  usedLlm: boolean,
  llmProvider?: ExtractLlmProvider,
): ExtractScanLogEntry {
  const count = urls.length;
  const preview =
    count === 0
      ? "no extra pages"
      : count <= 3
        ? urls.join(", ")
        : `${urls.slice(0, 2).join(", ")} +${count - 2} more`;
  let message = `Link discovery (${mode}): ${preview}`;
  if (mode === "deep_fallback") {
    message = `Deep scan: no API key or plan failed — heuristic discovery: ${preview}`;
  }
  if (mode === "deep_llm" && llmProvider) {
    message = `Deep scan: ${llmProvider} picked ${count} extra page(s): ${preview}`;
  }
  return {
    step: mode === "deep_llm" ? "llm_plan" : "discover",
    message,
    usedLlm,
    llmProvider,
  };
}

export function logMerge(pageCount: number): ExtractScanLogEntry {
  return {
    step: "merge",
    message: `Merged signals from ${pageCount} page(s)`,
    usedLlm: false,
  };
}

export function logHeuristicSynth(): ExtractScanLogEntry {
  return {
    step: "heuristic",
    message: "Heuristic synthesis from headings and body",
    usedLlm: false,
  };
}

export function logLlmEnrich(provider: ExtractLlmProvider | null): ExtractScanLogEntry {
  if (!provider) {
    return {
      step: "llm_enrich",
      message: "LLM enrich skipped (no API key or call failed)",
      usedLlm: false,
    };
  }
  return {
    step: "llm_enrich",
    message: `LLM enrich via ${provider === "anthropic" ? "Anthropic" : "OpenAI"}`,
    usedLlm: true,
    llmProvider: provider,
  };
}
