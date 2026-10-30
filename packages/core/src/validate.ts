import type { BrainInput, ValidationIssue, ValidationResult } from "./types.js";

const MIN_FACTS = 1;
const MIN_NAME_LEN = 2;

export function validateBrainInput(input: BrainInput): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!input.projectName?.trim() || input.projectName.trim().length < MIN_NAME_LEN) {
    issues.push({ level: "error", message: "Project name is required (min 2 characters)." });
  }

  if (!input.projectDescription?.trim()) {
    issues.push({ level: "error", message: "Project description is required." });
  }

  const facts = input.factBullets.map((s) => s.trim()).filter(Boolean);
  if (facts.length < MIN_FACTS) {
    issues.push({ level: "error", message: `Add at least ${MIN_FACTS} ground truth fact.` });
  }

  if (!input.storyProblem?.trim()) {
    issues.push({ level: "warn", message: "Story problem is empty." });
  }
  if (!input.storyBuilt?.trim()) {
    issues.push({ level: "warn", message: "Story 'what we built' is empty." });
  }
  if (!input.storyProof?.trim()) {
    issues.push({ level: "warn", message: "Story proof is empty (how you know it works)." });
  }

  const hasError = issues.some((i) => i.level === "error");
  return { ok: !hasError, issues };
}

export function validateBrainInputStrict(input: BrainInput): ValidationResult {
  const base = validateBrainInput(input);
  const extra: ValidationIssue[] = [];

  if (!input.storyProblem?.trim()) {
    extra.push({ level: "error", message: "Story problem is required for export." });
  }
  if (!input.storyBuilt?.trim()) {
    extra.push({ level: "error", message: "Story 'what we built' is required for export." });
  }
  if (!input.storyProof?.trim()) {
    extra.push({ level: "error", message: "Story proof is required for export." });
  }
  if (!input.storyTitle?.trim()) {
    extra.push({ level: "error", message: "Story title is required for export." });
  }

  const issues = [...base.issues.filter((i) => i.level === "error"), ...extra];
  const ok = base.ok && extra.length === 0;
  return { ok, issues: [...base.issues, ...extra] };
}
