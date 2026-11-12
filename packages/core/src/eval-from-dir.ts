import { listBrainFiles, readBrainFile } from "./brain-files.js";
import { isRefusalPath } from "./refused.js";
import {
  evalDraft,
  evalLinkedInCaption,
  type DraftEvalResult,
  type EvalCheck,
} from "./eval-draft.js";

export async function loadFactTextFromDir(dir: string): Promise<string> {
  const files = (await listBrainFiles(dir)).filter(
    (path) => path.startsWith("brain/facts/") && !isRefusalPath(path),
  );
  const parts: string[] = [];
  for (const path of files) {
    parts.push(await readBrainFile(dir, path));
  }
  return parts.join("\n\n");
}

export async function evalDraftAgainstDir(
  dir: string,
  input: {
    draft: string;
    title?: string;
    checks?: EvalCheck | EvalCheck[];
    article?: string;
  },
): Promise<DraftEvalResult & { dir: string }> {
  const facts = await loadFactTextFromDir(dir);
  const result = input.article
    ? evalLinkedInCaption({ caption: input.draft, article: input.article, facts })
    : evalDraft({ draft: input.draft, facts, title: input.title, checks: input.checks });
  return { ...result, dir };
}
