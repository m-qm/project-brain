import { mkdir, readFile, writeFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";

/** Drafts the owner refused. Ask may read this file. It must not quote it as a fact. */
export const REFUSED_REL = "brain/facts/refused.md";

export function normalizeDraftText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function isRefusalPath(path: string): boolean {
  return path.replace(/\\/g, "/") === REFUSED_REL;
}

function assertInsideFacts(brainRoot: string, file: string): void {
  const facts = resolve(brainRoot, "brain", "facts");
  const rel = relative(facts, file);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error("Refusals stay in brain/facts.");
  }
}

export async function readRefusalTexts(brainRoot: string): Promise<string[]> {
  let raw: string;
  try {
    raw = await readFile(resolve(brainRoot, REFUSED_REL), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => normalizeDraftText(line.slice(2)))
    .filter(Boolean);
}

/** Remember a draft the owner refused. A second no to the same text does not add a line. */
export async function recordRefusal(brainRoot: string, draftText: string): Promise<void> {
  const text = normalizeDraftText(draftText);
  if (!text) return;
  const file = resolve(brainRoot, "brain", "facts", "refused.md");
  assertInsideFacts(brainRoot, file);
  if ((await readRefusalTexts(brainRoot)).includes(text)) return;
  await mkdir(resolve(brainRoot, "brain", "facts"), { recursive: true });
  let prior = "";
  try {
    prior = await readFile(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const header = "# Refused\n\nThe owner said no to these drafts. Do not send them again.\n";
  const next = prior.trim() ? `${prior.trimEnd()}\n- ${text}\n` : `${header}\n- ${text}\n`;
  await writeFile(file, next, "utf8");
}
