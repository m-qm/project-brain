import { test } from "node:test";
import assert from "node:assert/strict";
import { evalDraftAgainstBrainInput } from "../dist/eval-from-input.js";

test("evalDraftAgainstBrainInput flags invented price", () => {
  const brain = {
    projectName: "Shop",
    projectDescription: "Haircuts",
    factBullets: ["Price: on request"],
    storyTitle: "",
    storyProblem: "",
    storyBuilt: "",
    storyProof: "",
    openQuestions: [],
  };
  const result = evalDraftAgainstBrainInput(brain, "Book from €99.");
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((i) => i.code === "invented_price"));
});
