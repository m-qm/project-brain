import type { BrainInput } from "./types.js";
import type { WebsiteExtract } from "./extract-from-html.js";

export function mergeExtractIntoBrain(
  current: BrainInput,
  extract: WebsiteExtract,
  mode: "replace" | "fill-empty",
): BrainInput {
  const s = extract.suggested;
  if (mode === "replace") {
    return {
      projectName: s.projectName ?? current.projectName,
      projectMission: s.projectMission ?? current.projectMission,
      projectDescription: s.projectDescription ?? current.projectDescription,
      factBullets: s.factBullets?.length ? s.factBullets : current.factBullets,
      storyTitle: s.storyTitle ?? current.storyTitle,
      storyProblem: s.storyProblem ?? current.storyProblem,
      storyBuilt: s.storyBuilt ?? current.storyBuilt,
      storyProof: s.storyProof ?? current.storyProof,
      openQuestions: s.openQuestions?.length ? s.openQuestions : current.openQuestions,
    };
  }

  return {
    projectName: current.projectName || s.projectName || "",
    projectDescription: current.projectDescription || s.projectDescription || "",
    factBullets:
      current.factBullets.some((b) => b.trim()) && current.factBullets.length > 0
        ? current.factBullets
        : (s.factBullets ?? current.factBullets),
    storyTitle: current.storyTitle || s.storyTitle || "",
    storyProblem: current.storyProblem || s.storyProblem || "",
    storyBuilt: current.storyBuilt || s.storyBuilt || "",
    storyProof: current.storyProof || s.storyProof || "",
    openQuestions:
      current.openQuestions.some((q) => q.trim()) && current.openQuestions.length > 0
        ? current.openQuestions
        : (s.openQuestions ?? current.openQuestions),
  };
}
