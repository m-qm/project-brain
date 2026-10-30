import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { BrainInput } from "./types.js";
import { buildPackFiles } from "./pack.js";

export async function writeBrainToDisk(
  targetDir: string,
  input: BrainInput,
): Promise<void> {
  const files = buildPackFiles(input);
  for (const file of files) {
    const full = join(targetDir, file.path);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, file.content, "utf8");
  }
}

export const REQUIRED_ON_DISK = [
  "brain/AGENTS.md",
  "brain/facts/project.md",
  "brain/open-questions.md",
] as const;
