import {
  applyLlmSuggestion,
  extractBrainFromHtml,
  websiteExtractFromSignals,
  type WebsiteExtract,
} from "./extract-from-html.js";
import {
  type ExtractScanMode,
  type ExtractUrlOptions,
  MAX_TOTAL_HTML_BYTES,
} from "./extract-bounds.js";
import { discoverSameOriginLinks } from "./discover-same-origin-links.js";
import { planDeepExtractUrls } from "./extract-deep-plan.js";
import { parsePageSignals } from "./extract-page-signals.js";
import { mergePageSignals } from "./merge-page-signals.js";
import {
  logDiscover,
  logFetch,
  logHeuristicSynth,
  logLlmEnrich,
  logMerge,
  type ExtractScanLogEntry,
} from "./extract-scan-log.js";
import { synthesizeBrainFromPage } from "./synthesize-from-page.js";
import { enrichExtractWithLlm } from "./extract-with-llm.js";
import { fetchPublicWebsiteHtml, type FetchHtmlBudget } from "./fetch-public-html.js";
import { validatePublicHttpUrl } from "./url-security.js";

function appendEnrichLog(
  extract: WebsiteExtract,
  llm: Awaited<ReturnType<typeof enrichExtractWithLlm>>,
): WebsiteExtract {
  const scanLog = [...extract.scanLog, logHeuristicSynth()];
  if (llm) {
    scanLog.push(logLlmEnrich(llm.provider));
    return { ...applyLlmSuggestion(extract, llm.suggestion, llm.provider), scanLog };
  }
  scanLog.push(logLlmEnrich(null));
  return { ...extract, scanLog };
}

async function fetchPagesWithLog(
  urls: string[],
  budget: FetchHtmlBudget,
  scanLog: ExtractScanLogEntry[],
): Promise<Map<string, string>> {
  const htmlByUrl = new Map<string, string>();
  for (const url of urls) {
    try {
      const html = await fetchPublicWebsiteHtml(url, budget);
      htmlByUrl.set(url, html);
      scanLog.push(logFetch(url, true));
    } catch {
      scanLog.push(logFetch(url, false));
    }
  }
  return htmlByUrl;
}

export async function extractBrainFromWebsiteUrl(
  url: string,
  options: ExtractUrlOptions = {},
): Promise<WebsiteExtract> {
  const trimmed = url.trim();
  const mode: ExtractScanMode = options.mode ?? "single";
  const allowServerLlm = options.allowServerLlm !== false;
  const scanLog: ExtractScanLogEntry[] = [];

  if (mode === "single") {
    let html: string;
    try {
      html = await fetchPublicWebsiteHtml(trimmed);
      scanLog.push(logFetch(trimmed, true));
    } catch {
      scanLog.push(logFetch(trimmed, false));
      throw new Error("Could not fetch seed URL.");
    }

    let extract = extractBrainFromHtml(html, trimmed);
    extract = { ...extract, scanLog: [...scanLog] };
    const signals = parsePageSignals(html, trimmed);
    const heuristic = synthesizeBrainFromPage(signals);
    const llm = allowServerLlm ? await enrichExtractWithLlm(signals, heuristic) : null;
    return appendEnrichLog(extract, llm);
  }

  const seedCheck = validatePublicHttpUrl(trimmed);
  if (!seedCheck.ok) {
    throw new Error(seedCheck.reason);
  }
  const seedUrl = seedCheck.url.toString();
  const budget: FetchHtmlBudget = {
    totalBytesUsed: 0,
    maxTotalBytes: MAX_TOTAL_HTML_BYTES,
  };

  let seedHtml: string;
  try {
    seedHtml = await fetchPublicWebsiteHtml(seedUrl, budget);
    scanLog.push(logFetch(seedUrl, true));
  } catch {
    scanLog.push(logFetch(seedUrl, false));
    throw new Error("Could not fetch seed URL.");
  }

  const seedSignals = parsePageSignals(seedHtml, seedUrl);
  const pagesFetched: string[] = [seedUrl];
  const extraWarnings: string[] = [];

  let extraUrls: string[] = [];
  const scanMode: ExtractScanMode = mode === "deep" ? "deep" : "multipage";

  if (mode === "deep") {
    const plan = await planDeepExtractUrls(seedUrl, seedHtml, seedSignals, {
      allowServerLlm,
    });
    if (plan === null) {
      extraWarnings.push(
        !allowServerLlm
          ? seedSignals.lang === "es"
            ? "Deep scan con LLM no está activo en este servidor público; enlaces heurísticos. Usa la CLI en tu máquina con tu API key."
            : "Deep scan LLM is off on this public server (abuse protection); using heuristic links. Run brain extract-url --deep locally with your API key."
          : seedSignals.lang === "es"
            ? "Deep scan requiere ANTHROPIC_API_KEY u OPENAI_API_KEY; usando enlaces heurísticos."
            : "Deep scan requires ANTHROPIC_API_KEY or OPENAI_API_KEY; falling back to heuristic links.",
      );
      extraUrls = discoverSameOriginLinks(seedUrl, seedHtml);
      scanLog.push(logDiscover("deep_fallback", extraUrls, false));
    } else if (plan.usedLlm && plan.llmProvider) {
      extraUrls = plan.urls;
      scanLog.push(logDiscover("deep_llm", extraUrls, true, plan.llmProvider));
    } else {
      extraUrls = plan.urls.length ? plan.urls : discoverSameOriginLinks(seedUrl, seedHtml);
      scanLog.push(logDiscover("deep_fallback", extraUrls, false));
    }
  } else {
    extraUrls = discoverSameOriginLinks(seedUrl, seedHtml);
    scanLog.push(logDiscover("heuristic", extraUrls, false));
  }

  extraWarnings.unshift(
    seedSignals.lang === "es"
      ? `Análisis multipágina (${pagesFetched.length + extraUrls.length} URLs objetivo).`
      : `Multi-page analysis (target ${pagesFetched.length + extraUrls.length} URLs).`,
  );

  const htmlByUrl = await fetchPagesWithLog(extraUrls, budget, scanLog);
  for (const u of extraUrls) {
    if (htmlByUrl.has(u)) pagesFetched.push(u);
  }

  scanLog.push(logMerge(pagesFetched.length));

  const signalsList = pagesFetched.map((pageUrl) =>
    parsePageSignals(
      pageUrl === seedUrl ? seedHtml : (htmlByUrl.get(pageUrl) ?? ""),
      pageUrl,
    ),
  );
  const merged = mergePageSignals(signalsList);
  let extract = websiteExtractFromSignals(
    merged,
    seedUrl,
    scanMode,
    pagesFetched,
    extraWarnings,
    scanLog,
  );

  const heuristic = synthesizeBrainFromPage(merged);
  const llm = allowServerLlm ? await enrichExtractWithLlm(merged, heuristic) : null;
  return appendEnrichLog(extract, llm);
}
