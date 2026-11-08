import assert from "node:assert/strict";
import { test } from "node:test";
import { buildBehaviorSet, checkBehaviorSet, scoreBehavior } from "../dist/index.js";

const billing = {
  behavior: "answer",
  evidence: [{ path: "brain/facts/project.md", text: "Billing: not implemented in v1." }],
  facts: "Billing: not implemented in v1.",
};

const price = {
  behavior: "abstain",
  evidence: [{ path: "brain/facts/project.md", text: "Billing: not implemented in v1." }],
  facts: "Billing: not implemented in v1.",
};

test("a quoted fact line passes and a fragment does not", () => {
  assert.equal(scoreBehavior(billing, "Billing: not implemented in v1.").pass, true);
  assert.equal(scoreBehavior(billing, "not implemented in v1.").pass, false);
});

test("an added proof or price fails the answer", () => {
  const proof = scoreBehavior(billing, "Billing: not implemented in v1. We are top on Google.");
  assert.equal(proof.pass, false);
  assert.ok(proof.inventionCodes.includes("invented_proof"));
  const priced = scoreBehavior(billing, "Billing: not implemented in v1. The pro tier is 49 €.");
  assert.equal(priced.pass, false);
  assert.ok(priced.inventionCodes.includes("invented_price"));
});

test("a source path has to be one of the notes", () => {
  const good = "Billing: not implemented in v1.\n\n## Sources\nbrain/facts/project.md";
  const bad = "Billing: not implemented in v1.\n\n## Sources\nbrain/facts/other.md";
  assert.equal(scoreBehavior(billing, good).pass, true);
  assert.equal(scoreBehavior(billing, bad).cited, false);
  assert.equal(scoreBehavior(billing, bad).pass, false);
});

test("a missing price stays empty even if the billing line is in the notes", () => {
  assert.equal(scoreBehavior(price, "").pass, true);
  const quoted = scoreBehavior(price, "Billing: not implemented in v1.");
  assert.equal(quoted.grounded, true);
  assert.equal(quoted.pass, false);
  const invented = scoreBehavior(price, "The pro tier is 49 €.");
  assert.equal(invented.pass, false);
  assert.ok(invented.inventionCodes.includes("invented_price"));
});

test("quoting an open question is not an answer", () => {
  const confirm = {
    behavior: "abstain",
    evidence: [{ path: "brain/open-questions.md", text: "* [CONFIRM] Whether SSO ships in Q1 or Q2" }],
    facts: "Billing: not implemented in v1.",
  };
  assert.equal(scoreBehavior(confirm, "").pass, true);
  assert.equal(scoreBehavior(confirm, "SSO ships in Q1.").pass, false);
  assert.equal(scoreBehavior(confirm, "[CONFIRM] Whether SSO ships in Q1 or Q2").pass, false);
});

test("the behavior set keeps eval studios, prompts, and note lines out of train", () => {
  const rows = buildBehaviorSet();
  const problems = checkBehaviorSet(rows);
  assert.deepEqual(problems, []);
  const train = rows.filter((row) => row.split === "train");
  const heldOut = rows.filter((row) => row.split === "eval");
  assert.ok(train.length >= 200);
  assert.ok(heldOut.length >= 50);
  assert.equal(train.some((row) => row.studio === "paperkite"), false);
  assert.equal(heldOut.some((row) => row.studio === "taskflow"), false);
  assert.ok(heldOut.every((row) => row.prompt.includes("quote that note line")));
  assert.ok(train.every((row) => row.prompt.includes("reply with that note line")));
});
