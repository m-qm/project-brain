import {
  applyLlmSuggestion,
  extractBrainFromHtml,
  type WebsiteExtract,
} from "./extract-from-html.js";
import { parsePageSignals } from "./extract-page-signals.js";
import { synthesizeBrainFromPage } from "./synthesize-from-page.js";
import { enrichExtractWithOpenAI } from "./extract-with-llm.js";
import { fetchPublicWebsiteHtml } from "./fetch-public-html.js";

export async function extractBrainFromWebsiteUrl(url: string): Promise<WebsiteExtract> {
  const trimmed = url.trim();
  const html = await fetchPublicWebsiteHtml(trimmed);
  let extract = extractBrainFromHtml(html, trimmed);

  const signals = parsePageSignals(html, trimmed);
  const heuristic = synthesizeBrainFromPage(signals);
  const llm = await enrichExtractWithOpenAI(signals, heuristic);
  if (llm) {
    extract = applyLlmSuggestion(extract, llm);
  }

  return extract;
}
