import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import type { BrainInput } from "@agentkbase/core";

const PROFILE_ID_RE = /^[a-f0-9-]{36}$/i;

function profilesDir(): string {
  return process.env.AGENTKBASE_HOSTED_PROFILE_DIR ?? join(process.cwd(), ".agentkbase", "hosted-profiles");
}

export async function saveHostedProfile(input: BrainInput, sourceUrl?: string): Promise<string> {
  const id = randomUUID();
  const dir = profilesDir();
  await mkdir(dir, { recursive: true });
  const payload = {
    id,
    savedAt: new Date().toISOString(),
    sourceUrl: sourceUrl?.trim() || undefined,
    brain: input,
  };
  await writeFile(join(dir, `${id}.json`), JSON.stringify(payload, null, 2), "utf8");
  return id;
}

export async function loadHostedProfile(id: string): Promise<{ brain: BrainInput; sourceUrl?: string } | null> {
  if (!PROFILE_ID_RE.test(id)) return null;
  const dir = profilesDir();
  try {
    const raw = await readFile(join(dir, `${id}.json`), "utf8");
    const data = JSON.parse(raw) as { brain: BrainInput; sourceUrl?: string };
    if (!data.brain?.projectName) return null;
    return { brain: data.brain, sourceUrl: data.sourceUrl };
  } catch {
    return null;
  }
}
