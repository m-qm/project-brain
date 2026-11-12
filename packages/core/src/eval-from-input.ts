import { evalDraft, evalLinkedInCaption, type EvalCheck, type DraftEvalResult } from "./eval-draft.js";
import { factsTextFromBrainInput } from "./facts-from-input.js";
import type { BrainInput } from "./types.js";

export function evalDraftAgainstBrainInput(
  input: BrainInput,
  draft: string,
  options?: { title?: string; checks?: EvalCheck | EvalCheck[]; article?: string },
): DraftEvalResult {
  const facts = factsTextFromBrainInput(input);
  if (options?.article?.trim()) {
    return evalLinkedInCaption({ caption: draft, article: options.article, facts });
  }
  return evalDraft({
    draft,
    facts,
    title: options?.title,
    checks: options?.checks,
  });
}
