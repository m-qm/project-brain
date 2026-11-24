import { timingSafeEqual, createHash } from "node:crypto";

const BEARER_PREFIX = "Bearer ";

function digestForCompare(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/** Fail closed when MCP_API_KEY is unset. */
export function isMcpAuthorized(req: Request): boolean {
  const expected = process.env.MCP_API_KEY?.trim();
  if (!expected) return false;
  const header = req.headers.get("authorization")?.trim() ?? "";
  if (!header.startsWith(BEARER_PREFIX)) return false;
  const token = header.slice(BEARER_PREFIX.length);
  try {
    return timingSafeEqual(digestForCompare(token), digestForCompare(expected));
  } catch {
    return false;
  }
}

export function unauthorizedMcpResponse(): Response {
  return Response.json(
    {
      jsonrpc: "2.0",
      error: { code: -32001, message: "Unauthorized." },
      id: null,
    },
    { status: 401 },
  );
}

/** Null when authorized; otherwise the 401 response POST should return. */
export function mcpAuthGate(req: Request): Response | null {
  return isMcpAuthorized(req) ? null : unauthorizedMcpResponse();
}