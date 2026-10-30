import type { BrainInput } from "./types.js";
import { buildPackFiles } from "./pack.js";

const MAX_BRIEF_CHARS = 12_000;

export function buildBrief(input: BrainInput): string {
  const files = buildPackFiles(input);
  const pick = (path: string) => files.find((f) => f.path === path)?.content ?? "";

  const parts = [
    "# Context pack (Agent KBase)",
    "",
    "## brain/AGENTS.md",
    pick("brain/AGENTS.md"),
    "",
    "## brain/facts/project.md",
    pick("brain/facts/project.md"),
    "",
    "## brain/open-questions.md",
    pick("brain/open-questions.md"),
    "",
    "## Stories index",
    files
      .filter((f) => f.path.startsWith("brain/stories/") && !f.path.endsWith("TEMPLATE.md"))
      .map((f) => `* ${f.path}`)
      .join("\n"),
  ];

  let text = parts.join("\n");
  if (text.length > MAX_BRIEF_CHARS) {
    text = `${text.slice(0, MAX_BRIEF_CHARS)}\n\n… (truncated)`;
  }
  return text;
}
