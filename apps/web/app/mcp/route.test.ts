import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { POST, isMcpAuthorized, mcpAuthGate } from "./route.ts";

const TEST_KEY = "test-mcp-key-0123456789";

describe("POST /mcp authorization", () => {
  beforeEach(() => {
    process.env.MCP_API_KEY = TEST_KEY;
  });

  afterEach(() => {
    delete process.env.MCP_API_KEY;
  });

  test("POST without Authorization returns 401", async () => {
    const res = await POST(new Request("http://localhost/mcp", { method: "POST", body: "{}" }));
    assert.equal(res.status, 401);
  });

  test("POST with wrong Bearer returns 401", async () => {
    const res = await POST(
      new Request("http://localhost/mcp", {
        method: "POST",
        headers: { Authorization: "Bearer wrong-key" },
        body: "{}",
      }),
    );
    assert.equal(res.status, 401);
  });

  test("POST with valid Bearer is not rejected with 401", () => {
    const req = new Request("http://localhost/mcp", {
      method: "POST",
      headers: { Authorization: `Bearer ${TEST_KEY}` },
      body: JSON.stringify({ jsonrpc: "2.0", method: "initialize", id: 1, params: {} }),
    });
    assert.equal(mcpAuthGate(req), null, "POST must pass auth before MCP transport runs");
  });

  test("isMcpAuthorized fails closed when MCP_API_KEY is unset", () => {
    delete process.env.MCP_API_KEY;
    const req = new Request("http://localhost/mcp", {
      headers: { Authorization: `Bearer ${TEST_KEY}` },
    });
    assert.equal(isMcpAuthorized(req), false);
  });
});