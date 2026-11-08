import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { BrainInput } from "./types.js";
import { buildPackFiles, ROOT_AGENTS_BLOCK_START, ROOT_AGENTS_PATH } from "./pack.js";

function isEnoent(err: unknown): boolean {
  return (err as NodeJS.ErrnoException)?.code === "ENOENT";
}

/**
 * Write the root file whole when it is missing. When it already exists, append
 * the marked block once instead of replacing the file.
 * Returns whether the file contents changed.
 */
async function placeRootAgents(full: string, content: string): Promise<boolean> {
  let existing: string;
  try {
    existing = await readFile(full, "utf8");
  } catch (err) {
    if (!isEnoent(err)) throw err;
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, content, "utf8");
    return true;
  }
  if (existing.includes(ROOT_AGENTS_BLOCK_START)) return false;
  const base = existing.replace(/\s*$/, "");
  const next = base.length === 0 ? content : `${base}\n\n${content}`;
  await writeFile(full, next, "utf8");
  return true;
}

export async function writeBrainToDisk(
  targetDir: string,
  input: BrainInput,
): Promise<void> {
  const files = buildPackFiles(input);
  for (const file of files) {
    const full = join(targetDir, file.path);
    if (file.path === ROOT_AGENTS_PATH) {
      await placeRootAgents(full, file.content);
      continue;
    }
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, file.content, "utf8");
  }
}

export const REQUIRED_ON_DISK = [
  "brain/AGENTS.md",
  "brain/facts/project.md",
  "brain/open-questions.md",
] as const;
