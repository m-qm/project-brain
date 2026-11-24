import { timingSafeEqual, createHash } from "node:crypto";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BEARER_PREFIX = "Bearer ";

function digestForCompare(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/** Exported for route tests. Fail closed when MCP_API_KEY is unset. */
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

const methodNotAllowed = () =>
  Response.json(
    {
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    },
    { status: 405 },
  );

export async function POST(req: Request) {
  const denied = mcpAuthGate(req);
  if (denied) return denied;

  const { createRemoteMcpServer } = await import("../../lib/remote-mcp-server");
  const server = createRemoteMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  try {
    await server.connect(transport);
    return await transport.handleRequest(req);
  } catch (e) {
    console.error("MCP request failed:", e);
    return Response.json(
      {
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      },
      { status: 500 },
    );
  } finally {
    transport.close();
    await server.close();
  }
}

export async function GET() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}