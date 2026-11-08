import assert from "node:assert/strict";
import { test } from "node:test";
import {
  observationKind,
  observeCall,
  observeEnabled,
  sessionIdFromMeta,
  summarizeToolInput,
  summarizeToolPayload,
  traceparentFromMeta,
} from "../dist/observe.js";

function withoutTraceEnv(run) {
  const previous = {
    LANGFUSE_PUBLIC_KEY: process.env.LANGFUSE_PUBLIC_KEY,
    LANGFUSE_SECRET_KEY: process.env.LANGFUSE_SECRET_KEY,
    LANGFUSE_TRACE_CONTENT: process.env.LANGFUSE_TRACE_CONTENT,
  };
  delete process.env.LANGFUSE_PUBLIC_KEY;
  delete process.env.LANGFUSE_SECRET_KEY;
  delete process.env.LANGFUSE_TRACE_CONTENT;
  const restore = () => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  };
  return Promise.resolve()
    .then(run)
    .finally(restore);
}

test("tracing stays off without both Langfuse keys", async () => {
  await withoutTraceEnv(async () => {
    assert.equal(observeEnabled(), false);
    process.env.LANGFUSE_PUBLIC_KEY = "pk_test";
    assert.equal(observeEnabled(), false);
    let calls = 0;
    const value = await observeCall({
      name: "brain_eval",
      kind: "evaluator",
      surface: "cli",
      input: {},
      run: async () => {
        calls += 1;
        return 7;
      },
      summarize: () => ({ ok: true }),
    });
    assert.equal(value, 7);
    assert.equal(calls, 1);
  });
});

test("traceparent joins a remote parent and rejects blanks", () => {
  const parent = traceparentFromMeta({
    traceparent: "00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01",
  });
  assert.equal(parent?.traceId, "0af7651916cd43dd8448eb211c80319c");
  assert.equal(parent?.spanId, "b7ad6b7169203331");
  assert.equal(parent?.isRemote, true);
  assert.equal(traceparentFromMeta({ traceparent: "not-a-header" }), undefined);
  assert.equal(
    traceparentFromMeta({
      traceparent: `00-${"0".repeat(32)}-${"1".repeat(16)}-01`,
    }),
    undefined,
  );
});

test("session id is read from MCP meta and capped", () => {
  assert.equal(sessionIdFromMeta({ langfuseSessionId: "chat-1" }), "chat-1");
  assert.equal(sessionIdFromMeta({ sessionId: "  other  " }), "other");
  assert.equal(sessionIdFromMeta({ sessionId: "x".repeat(250) })?.length, 200);
  assert.equal(sessionIdFromMeta(undefined), undefined);
});

test("payload summary keeps the decision and drops line text", async () => {
  await withoutTraceEnv(async () => {
    const summary = summarizeToolPayload(
      JSON.stringify({
        ok: false,
        issues: [{ code: "invented_price", check: 1, detail: "from 49 €" }],
        hits: [{ path: "brain/facts/project.md", line: 3, text: "secret price 49" }],
        truncated: false,
        files: ["brain/AGENTS.md"],
        questions: ["Auth provider"],
      }),
      false,
    );
    assert.equal(summary.ok, false);
    assert.deepEqual(summary.issueCodes, ["invented_price"]);
    assert.equal(summary.hitCount, 1);
    assert.deepEqual(summary.paths, ["brain/facts/project.md"]);
    assert.equal(summary.fileCount, 1);
    assert.equal(summary.questionCount, 1);
    assert.equal(summary.content, undefined);
    assert.equal(JSON.stringify(summary).includes("secret"), false);
    assert.equal(JSON.stringify(summary).includes("49"), false);
  });
});

test("content flag includes a truncated body", async () => {
  await withoutTraceEnv(async () => {
    process.env.LANGFUSE_TRACE_CONTENT = "1";
    const input = summarizeToolInput({ draft: "price ".repeat(800), checks: "offer" });
    assert.equal(input.checks, "offer");
    assert.equal(input.draftChars, "price ".repeat(800).length);
    assert.equal(String(input.draft).length, 2001);
    assert.equal(String(input.draft).endsWith("…"), true);
  });
});

test("tool errors are marked failed and observation kinds match the call", async () => {
  await withoutTraceEnv(() => {
    const summary = summarizeToolPayload("outside brain/", true);
    assert.equal(summary.ok, false);
    assert.equal(summary.failed, true);
    assert.equal(summary.error, "outside brain/");
    assert.equal(observationKind("brain_eval"), "evaluator");
    assert.equal(observationKind("brain_search"), "retriever");
    assert.equal(observationKind("brain_extract_url"), "tool");
  });
});
