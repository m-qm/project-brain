import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { askFromDir } from "../dist/index.js";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

test("oauth shipped question passes when facts say not shipped yet", async () => {
  const result = await askFromDir(repoRoot, "Is remote MCP OAuth shipped?");
  assert.equal(result.decision, "pass");
  assert.equal(result.draft.status, "ready");
  assert.match(result.draft.text, /not shipped yet/i);
  assert.ok(result.evidence.some((item) => item.path === "brain/facts/distribution.md"));
});
