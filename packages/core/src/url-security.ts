export type UrlCheckResult = { ok: true; url: URL } | { ok: false; reason: string };

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]", "::1"]);

function isPrivateIpv4(host: string): boolean {
  const parts = host.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

export function normalizePublicHttpUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t.replace(/^\/\//, "")}`;
}

export function validatePublicHttpUrl(raw: string): UrlCheckResult {
  let parsed: URL;
  try {
    parsed = new URL(normalizePublicHttpUrl(raw));
  } catch {
    return { ok: false, reason: "Invalid URL." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, reason: "Only http and https URLs are allowed." };
  }

  const host = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".local")) {
    return { ok: false, reason: "Local and internal hosts are not allowed." };
  }
  if (isPrivateIpv4(host)) {
    return { ok: false, reason: "Private network addresses are not allowed." };
  }

  return { ok: true, url: parsed };
}
