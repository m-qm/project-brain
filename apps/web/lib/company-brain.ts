import { readFile } from "node:fs/promises";
import { join } from "node:path";
import snapshot from "@/lib/company-brain.snapshot.json";

const FILES = [
  "brain/facts/project.md",
  "brain/facts/offer-limits.md",
  "brain/open-questions.md",
  "brain/stories/positioning.md",
] as const;

let cached: string | null = null;

async function readRel(root: string, rel: string): Promise<string | null> {
  const bare = rel.replace(/^brain\//, "");
  for (const candidate of [join(root, rel), join(root, bare)]) {
    try {
      return await readFile(candidate, "utf8");
    } catch {
      // Try the next location.
    }
  }
  return null;
}

async function fromDisk(): Promise<string | null> {
  const roots = [
    process.env.BRAIN_DIR,
    join(process.cwd(), "brain"),
    join(process.cwd(), ".."),
    join(process.cwd(), "..", ".."),
  ].filter((root): root is string => Boolean(root));

  for (const root of roots) {
    const chunks: string[] = ["# Company brain", ""];
    let found = false;
    for (const rel of FILES) {
      const text = await readRel(root, rel);
      if (!text) continue;
      found = true;
      chunks.push(`## ${rel}`, text.trim(), "");
    }
    if (found && chunks.some((chunk) => chunk.includes("## brain/facts/project.md"))) {
      return chunks.join("\n").slice(0, 14000);
    }
  }
  return null;
}

/** Product truth for the Telegram bot. Disk when the repo is present, snapshot on Vercel. */
export async function loadCompanyBrain(): Promise<string> {
  if (cached) return cached;
  cached = (await fromDisk()) || snapshot.text;
  return cached;
}
