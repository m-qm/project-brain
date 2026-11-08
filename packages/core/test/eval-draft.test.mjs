import assert from "node:assert/strict";
import { resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { evalDraft, evalDraftAgainstDir } from "../dist/index.js";

const example = resolve(fileURLToPath(new URL("../../../examples/fictional-saas-brain/", import.meta.url)));
const kbase = resolve(fileURLToPath(new URL("../../../examples/content-ads-brain/", import.meta.url)));

test("invented euro amount fails when facts have no price", () => {
  const result = evalDraft({
    draft: "The website pack is from 49 € this month.",
    facts: "* Billing: not implemented in v1.",
    checks: "offer",
  });
  assert.equal(result.ok, false);
  assert.equal(result.issues[0]?.code, "invented_price");
});

test("amount that is in facts passes", () => {
  const result = evalDraft({
    draft: "The website pack is 120 €.",
    facts: "* Website pack: 120 €",
    checks: "offer",
  });
  assert.equal(result.ok, true);
});

test("retired Pack page prices fail against the Agent KBase brain", async () => {
  const result = await evalDraftAgainstDir(kbase, {
    draft: "Self-serve Pack. Target €49–149. Done-for-you Target €499–1,200.",
    checks: "offer",
  });
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.code === "invented_price"));
});

test("Taskflow example rejects a made-up price", async () => {
  const result = await evalDraftAgainstDir(example, {
    draft: "Launch from 29 € per seat.",
    checks: "offer",
  });
  assert.equal(result.ok, false);
});
