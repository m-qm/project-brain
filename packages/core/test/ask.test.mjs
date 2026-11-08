import assert from "node:assert/strict";
import { resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { askFromDir, decideLoop, planTask } from "../dist/index.js";

const example = resolve(fileURLToPath(new URL("../../../examples/fictional-saas-brain/", import.meta.url)));

test("plan routes a price question to facts and a build question to a story", () => {
  assert.equal(planTask("Is billing implemented in v1?").route, "facts");
  assert.equal(planTask("How did we build weekly digest notifications?").route, "story");
  assert.equal(planTask("Write a LinkedIn post about billing").delegate, "draft");
});

test("billing question is covered by the fact line", async () => {
  const result = await askFromDir(example, "Is billing implemented in v1?");
  assert.equal(result.decision, "pass");
  assert.equal(result.plan.route, "facts");
  assert.equal(result.gaps.length, 0);
  assert.ok(result.evidence.some((item) => /billing/i.test(item.text) && item.path.endsWith("project.md")));
});

test("a price that is not in the facts stops for a person", async () => {
  const result = await askFromDir(example, "The website pack is from 49 €.");
  assert.equal(result.decision, "ask_human");
  assert.ok(result.gaps.some((gap) => gap.code === "missing_price"));
  assert.equal(JSON.stringify(result.evidence).includes("49"), false);
});

test("a story question reads only the matching story", async () => {
  const result = await askFromDir(example, "How did we build weekly digest notifications?");
  assert.equal(result.decision, "pass");
  assert.equal(result.plan.route, "story");
  assert.deepEqual(result.reads, ["brain/stories/notifications.md"]);
});

test("an open SSO question stops on [CONFIRM]", async () => {
  const result = await askFromDir(example, "Does SSO ship in Q1?");
  assert.equal(result.decision, "ask_human");
  assert.deepEqual(result.loops, ["ask_human"]);
  assert.ok(result.gaps.some((gap) => gap.code === "confirm" && /SSO/i.test(gap.detail)));
});

test("a price stop does not search again", async () => {
  const result = await askFromDir(example, "The website pack is from 49 €.");
  assert.deepEqual(result.loops, ["ask_human"]);
});

test("a fact miss searches once more and can land on a story", async () => {
  const result = await askFromDir(example, "Why did Monday standup happen?");
  assert.equal(result.decision, "pass");
  assert.deepEqual(result.loops, ["retrieve_again", "pass"]);
  assert.ok(result.evidence.some((item) => item.path === "brain/stories/notifications.md"));
});

test("a second miss stops for a person", async () => {
  const result = await askFromDir(example, "What is the onboarding ritual?");
  assert.equal(result.decision, "ask_human");
  assert.deepEqual(result.loops, ["retrieve_again", "ask_human"]);
});

test("a draft proof claim revises once and then stops", async () => {
  const result = await askFromDir(
    example,
    "Write a LinkedIn post about billing. We are top on Google.",
  );
  assert.equal(result.decision, "ask_human");
  assert.deepEqual(result.loops, ["revise", "ask_human"]);
  assert.ok(result.issues.some((issue) => issue.code === "invented_proof"));
  assert.ok(result.evidence.some((item) => /billing/i.test(item.text)));
});

test("a covered billing question is a reply waiting for approve or reject", async () => {
  const result = await askFromDir(example, "Is billing implemented in v1?");
  assert.equal(result.draft.status, "ready");
  assert.equal(result.draft.kind, "reply");
  assert.match(result.draft.text, /not implemented in v1/);
  assert.deepEqual(result.draft.actions, ["approve", "reject"]);
  assert.equal(result.draft.text.includes("49"), false);
});

test("a held question has no message", async () => {
  const price = await askFromDir(example, "The website pack is from 49 €.");
  const proof = await askFromDir(example, "Write a LinkedIn post about billing. We are top on Google.");
  assert.equal(price.draft.status, "held");
  assert.equal(price.draft.text, "");
  assert.deepEqual(price.draft.actions, []);
  assert.equal(proof.draft.status, "held");
  assert.equal(proof.draft.text, "");
});

test("a covered story becomes the reply text", async () => {
  const result = await askFromDir(example, "Why did Monday standup happen?");
  assert.equal(result.draft.status, "ready");
  assert.match(result.draft.text, /Monday standup/);
  assert.deepEqual(result.draft.sources, ["brain/stories/notifications.md"]);
});

test("a covered post keeps the fact line and names the source file", async () => {
  const result = await askFromDir(example, "Write a LinkedIn post about billing");
  assert.equal(result.draft.status, "ready");
  assert.equal(result.draft.kind, "post");
  assert.match(result.draft.text, /not implemented in v1/);
  assert.match(result.draft.text, /## Sources\nbrain\/facts\/project.md/);
});

test("decideLoop caps the extra search and the revision", () => {
  const miss = {
    route: "facts",
    gaps: [{ code: "uncovered", detail: "none" }],
    evalCodes: [],
    retrievesUsed: 0,
    revisesUsed: 0,
    maxRetrieve: 1,
    maxRevise: 1,
  };
  assert.equal(decideLoop(miss), "retrieve_again");
  assert.equal(decideLoop({ ...miss, retrievesUsed: 1 }), "ask_human");
  const proof = {
    route: "draft",
    gaps: [],
    evalCodes: ["invented_proof"],
    retrievesUsed: 0,
    revisesUsed: 0,
    maxRetrieve: 1,
    maxRevise: 1,
  };
  assert.equal(decideLoop(proof), "revise");
  assert.equal(decideLoop({ ...proof, revisesUsed: 1 }), "ask_human");
  assert.equal(
    decideLoop({ ...proof, gaps: [{ code: "missing_price", detail: "49" }] }),
    "ask_human",
  );
});
