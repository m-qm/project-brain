export type BrainInput = {
  projectName: string;
  /** Short mission for agents (optional; falls back to projectDescription in export). */
  projectMission?: string;
  projectDescription: string;
  factBullets: string[];
  storyTitle: string;
  storyProblem: string;
  storyBuilt: string;
  storyProof: string;
  openQuestions: string[];
};

export type PackFile = {
  path: string;
  content: string;
};

export type ValidationIssue = {
  level: "error" | "warn";
  message: string;
};

export type ValidationResult = {
  ok: boolean;
  issues: ValidationIssue[];
};
