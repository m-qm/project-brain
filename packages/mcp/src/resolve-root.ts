import { access } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const MAX_PARENTS = 8;

async function hasAgents(dir: string): Promise<boolean> {
  try {
    await access(resolve(dir, "brain/AGENTS.md"));
    return true;
  } catch {
    return false;
  }
}

/**
 * Repo root that contains `brain/AGENTS.md`.
 * Order: explicit `dir`, then `BRAIN_DIR`, then `process.cwd()`.
 * Walks up to 8 parents when the start directory has no brain.
 */
export async function resolveBrainDir(explicit?: string): Promise<string> {
  const fromArg = explicit?.trim();
  const fromEnv = process.env.BRAIN_DIR?.trim();
  const start = resolve(fromArg || fromEnv || process.cwd());
  let current = start;

  for (let i = 0; i <= MAX_PARENTS; i++) {
    if (await hasAgents(current)) return current;
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  throw new Error(
    `No brain/AGENTS.md found from ${start} (walked up to ${MAX_PARENTS} parent directories).`,
  );
}
