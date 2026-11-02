export const MAX_EXTRACT_PAGES = 5;
export const MAX_PAGE_HTML_BYTES = 512_000;
export const MAX_TOTAL_HTML_BYTES = 1_200_000;
export const MAX_DEEP_LLM_CALLS = 2;
export const FETCH_TIMEOUT_MS = 12_000;
export const MAX_EXTRA_PAGES = MAX_EXTRACT_PAGES - 1;

export type ExtractScanMode = "single" | "multipage" | "deep";

export type ExtractUrlOptions = {
  mode?: ExtractScanMode;
  /**
   * When false, skip all server-side LLM calls (deep plan + enrich).
   * Use on public web APIs so a leaked env key cannot be abused via /api/extract-url.
   * Default true (CLI and trusted self-host).
   */
  allowServerLlm?: boolean;
};
