import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { isMcpAuthorized, mcpAuthGate } from "../../lib/mcp-auth.ts";

const TEST_KEY = "test-mcp-key-0123456789";

describe("POST /mcp authorization", () => {
  beforeEach(() => {
    process.env.MCP_API_KEY = TEST_KEY;
  });

  afterEach(() => {
    delete process.env.MCP_API_KEY;
  });

  test("mcpAuthGate returns 401 when Authorization is missing", () => {
    const req = new Request("http://localhost/mcp", { method: "POST", body: "{}" });
    const denied = mcpAuthGate(req);
    assert.ok(denied);
    assert.equal(denied.status, 401);
  });

  test("mcpAuthGate returns 401 when Bearer is wrong", () => {
    const req = new Request("http://localhost/mcp", {
      method: "POST",
      headers: { Authorization: "Bearer wrong-key" },
      body: "{}",
    });
    const denied = mcpAuthGate(req);
    assert.ok(denied);
    assert.equal(denied.status, 401);
  });

  test("mcpAuthGate allows valid Bearer (POST would continue past auth)", () => {
    const req = new Request("http://localhost/mcp", {
      method: "POST",
      headers: { Authorization: `Bearer ${TEST_KEY}` },
      body: JSON.stringify({ jsonrpc: "2.0", method: "initialize", id: 1, params: {} }),
    });
    assert.equal(mcpAuthGate(req), null);
  });

  test("isMcpAuthorized fails closed when MCP_API_KEY is unset", () => {
    delete process.env.MCP_API_KEY;
    const req = new Request("http://localhost/mcp", {
      headers: { Authorization: `Bearer ${TEST_KEY}` },
    });
    assert.equal(isMcpAuthorized(req), false);
  });
});