import { validatePublicHttpUrl } from "./url-security.js";

const MAX_BYTES = 512_000;
const TIMEOUT_MS = 12_000;

export async function fetchPublicWebsiteHtml(rawUrl: string): Promise<string> {
  const check = validatePublicHttpUrl(rawUrl);
  if (!check.ok) {
    throw new Error(check.reason);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(check.url.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "ProjectBrain/0.1 (website extract; +https://github.com/m-qm/project-brain)",
      },
    });

    if (!res.ok) {
      throw new Error(`Could not fetch page (HTTP ${res.status}).`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      throw new Error("URL did not return HTML.");
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("Empty response body.");

    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) {
        await reader.cancel();
        throw new Error("Page too large (512KB HTML limit).");
      }
      chunks.push(value);
    }

    const merged =
      chunks.length === 1
        ? chunks[0]
        : (() => {
            const len = chunks.reduce((n, c) => n + c.byteLength, 0);
            const out = new Uint8Array(len);
            let offset = 0;
            for (const c of chunks) {
              out.set(c, offset);
              offset += c.byteLength;
            }
            return out;
          })();

    return new TextDecoder("utf-8", { fatal: false }).decode(merged);
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Fetch timed out.");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
