import type { BrainInput } from "./types.js";

/** Plain text of claimable facts for eval and ask (hosted brain or wizard export). */
export function factsTextFromBrainInput(input: BrainInput): string {
  const parts = [
    input.projectMission?.trim(),
    input.projectDescription.trim(),
    ...input.factBullets.map((b) => b.trim()).filter(Boolean),
    ...input.openQuestions.map((q) => q.trim()).filter(Boolean),
  ].filter(Boolean) as string[];
  return parts.join("\n");
}
