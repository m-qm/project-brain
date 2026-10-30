import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const MAX_BRIEF_CHARS = 12_000;

export async function buildBriefFromDir(dir: string): Promise<string> {
  const read = async (rel: string) => {
    try {
      return await readFile(join(dir, rel), "utf8");
    } catch {
      return "";
    }
  };

  const storiesDir = join(dir, "brain/stories");
  let storyIndex = "";
  try {
    const names = await readdir(storiesDir);
    storyIndex = names
      .filter((n) => n.endsWith(".md") && n !== "TEMPLATE.md")
      .map((n) => `* brain/stories/${n}`)
      .join("\n");
  } catch {
    storyIndex = "(no stories yet)";
  }

  const parts = [
    "# Context pack (Agent KBase)",
    "",
    "## brain/AGENTS.md",
    await read("brain/AGENTS.md"),
    "",
    "## brain/facts/project.md",
    await read("brain/facts/project.md"),
    "",
    "## brain/open-questions.md",
    await read("brain/open-questions.md"),
    "",
    "## Stories index",
    storyIndex,
  ];

  let text = parts.join("\n");
  if (text.length > MAX_BRIEF_CHARS) {
    text = `${text.slice(0, MAX_BRIEF_CHARS)}\n\n… (truncated)`;
  }
  return text;
}
