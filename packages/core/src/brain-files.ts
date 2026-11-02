import { lstat, readdir, readFile, realpath } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";

/** Thrown when a path leaves `brain/` or the query cannot be run. */
export class BrainPathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BrainPathError";
  }
}

export type BrainSearchHit = {
  /** Repo-relative path, always under `brain/`. */
  path: string;
  /** 1-based line number. */
  line: number;
  text: string;
};

export type BrainSearchResult = {
  hits: BrainSearchHit[];
  truncated: boolean;
};

const MAX_SEARCH_HITS = 50;
const MAX_LINE_CHARS = 240;
const MAX_READ_CHARS = 100_000;

function toPosix(path: string): string {
  return path.split(sep).join("/");
}

function isInside(root: string, candidate: string): boolean {
  const rel = relative(root, candidate);
  return rel !== "" && rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}

async function brainRootReal(dir: string): Promise<string> {
  try {
    return await realpath(resolve(dir, "brain"));
  } catch {
    throw new BrainPathError(`No brain/ directory at ${resolve(dir)}`);
  }
}

/** Accept `brain/facts/project.md` or `facts/project.md`. Reject absolute paths and `..`. */
export function normalizeBrainRel(input: string): string {
  const trimmed = input.trim().replace(/\\/g, "/");
  if (!trimmed) throw new BrainPathError("Path is empty.");
  if (trimmed.startsWith("/") || /^[a-zA-Z]:/.test(trimmed)) {
    throw new BrainPathError("Path must be relative and stay inside brain/.");
  }
  const withBrain = trimmed === "brain" || trimmed.startsWith("brain/") ? trimmed : `brain/${trimmed}`;
  const parts = withBrain.split("/");
  if (parts.some((part) => part === "" || part === "." || part === "..")) {
    throw new BrainPathError("Path is outside brain/.");
  }
  if (withBrain === "brain") {
    throw new BrainPathError("Path must name a file inside brain/.");
  }
  return withBrain;
}

async function resolveFileInsideBrain(
  dir: string,
  relInput: string,
): Promise<{ realFile: string; relPosix: string }> {
  const relPosix = normalizeBrainRel(relInput);
  const root = await brainRootReal(dir);
  const full = resolve(root, relPosix.slice("brain/".length));
  if (!isInside(root, full)) {
    throw new BrainPathError("Path is outside brain/.");
  }

  let realFile: string;
  try {
    const stat = await lstat(full);
    if (!stat.isFile() && !stat.isSymbolicLink()) {
      throw new BrainPathError(`Not a file: ${relPosix}`);
    }
    realFile = await realpath(full);
  } catch (err) {
    if (err instanceof BrainPathError) throw err;
    throw new BrainPathError(`Not found: ${relPosix}`);
  }

  if (!isInside(root, realFile)) {
    throw new BrainPathError("Path is outside brain/.");
  }
  return { realFile, relPosix };
}

async function walkMarkdown(root: string, dir: string, out: string[]): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkMarkdown(root, full, out);
      continue;
    }
    if (!entry.isFile() && !entry.isSymbolicLink()) continue;
    if (!entry.name.endsWith(".md")) continue;
    let real: string;
    try {
      real = await realpath(full);
    } catch {
      continue;
    }
    if (!isInside(root, real)) continue;
    out.push(`brain/${toPosix(relative(root, full))}`);
  }
}

/** Markdown files under `brain/`, sorted, repo-relative. Symlinks that leave `brain/` are omitted. */
export async function listBrainFiles(dir: string): Promise<string[]> {
  const root = await brainRootReal(dir);
  const out: string[] = [];
  await walkMarkdown(root, root, out);
  out.sort();
  return out;
}

/** Read one file. The resolved real path must stay inside `brain/`. */
export async function readBrainFile(dir: string, rel: string): Promise<string> {
  const { realFile } = await resolveFileInsideBrain(dir, rel);
  const text = await readFile(realFile, "utf8");
  if (text.length > MAX_READ_CHARS) {
    return `${text.slice(0, MAX_READ_CHARS)}\n\n… (truncated)`;
  }
  return text;
}

/** Case-insensitive substring search over markdown under `brain/`. */
export async function searchBrainFiles(dir: string, query: string): Promise<BrainSearchResult> {
  const needle = query.trim().toLowerCase();
  if (!needle) throw new BrainPathError("Search query is empty.");

  const files = await listBrainFiles(dir);
  const hits: BrainSearchHit[] = [];
  for (const path of files) {
    const text = await readBrainFile(dir, path);
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].toLowerCase().includes(needle)) continue;
      if (hits.length >= MAX_SEARCH_HITS) {
        return { hits, truncated: true };
      }
      let lineText = lines[i].trim();
      if (lineText.length > MAX_LINE_CHARS) {
        lineText = `${lineText.slice(0, MAX_LINE_CHARS)}…`;
      }
      hits.push({ path, line: i + 1, text: lineText });
    }
  }
  return { hits, truncated: false };
}
