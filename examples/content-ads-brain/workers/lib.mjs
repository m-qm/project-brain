import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(here, "..");
export const BRAIN = join(ROOT, "brain");
export const QUEUE = join(ROOT, "queue");
export const INSIGHTS = join(ROOT, "insights");

export const STAGES = ["pending", "approved", "published", "rejected"];

export async function ensureQueue() {
  for (const stage of STAGES) {
    await mkdir(join(QUEUE, stage), { recursive: true });
  }
  await mkdir(INSIGHTS, { recursive: true });
}

export function itemPath(stage, id) {
  return join(QUEUE, stage, `${id}.json`);
}

export async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

export async function writeItem(stage, item) {
  await ensureQueue();
  const copy = { ...item, status: stage, updated_at: new Date().toISOString() };
  await writeFile(itemPath(stage, copy.id), `${JSON.stringify(copy, null, 2)}\n`, "utf8");
  return copy;
}

export async function findItem(id) {
  await ensureQueue();
  for (const stage of STAGES) {
    try {
      const item = await readJson(itemPath(stage, id));
      return { stage, item };
    } catch {
      // try next stage
    }
  }
  return null;
}

export async function moveItem(id, toStage) {
  const found = await findItem(id);
  if (!found) throw new Error(`Unknown item: ${id}`);
  if (found.stage === toStage) return found.item;
  const item = await writeItem(toStage, found.item);
  const { unlink } = await import("node:fs/promises");
  await unlink(itemPath(found.stage, id));
  return item;
}

export async function listStage(stage) {
  await ensureQueue();
  const dir = join(QUEUE, stage);
  const names = (await readdir(dir)).filter((n) => n.endsWith(".json"));
  const items = [];
  for (const name of names) {
    items.push(await readJson(join(dir, name)));
  }
  return items.sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

export async function usedDays() {
  const stages = ["pending", "approved", "published"];
  const days = new Set();
  for (const stage of stages) {
    for (const item of await listStage(stage)) {
      if (item.agent === "instagram" && item.day) days.add(item.day);
    }
  }
  return days;
}

export async function readBrainBundle() {
  const files = [
    "AGENTS.md",
    "facts/project.md",
    "facts/brand-guardrails.md",
    "facts/connectors.md",
    "open-questions.md",
    "agents/article.md",
    "agents/linkedin.md",
    "content/review-checklist.md",
    "content/pillars.md",
    "content/article-slate.md",
    "content/calendar-14-days.md",
    "content/posts-01-to-05.md",
  ];
  const parts = [];
  for (const rel of files) {
    const text = await readFile(join(BRAIN, rel), "utf8");
    parts.push(`--- ${rel} ---\n${text}`);
  }
  return parts.join("\n\n");
}

export function parseCannedPosts(md) {
  const blocks = md.split(/^## /m).slice(1);
  return blocks.map((block) => {
    const titleLine = block.split("\n")[0].trim();
    const day = Number(titleLine.match(/^(\d+)/)?.[1]);
    const format = titleLine.match(/^\d+\.\s+(\w+)/)?.[1] ?? "Reel";
    const title = titleLine.replace(/^\d+\.\s+\w+\s+—\s+/, "").trim();
    const es = block.match(/\*\*ES caption\.\*\*\s+([\s\S]*?)\n\n/)?.[1]?.trim() ?? "";
    const en = block.match(/\*\*EN caption\.\*\*\s+([\s\S]*?)\n\n/)?.[1]?.trim() ?? "";
    const visual =
      block.match(/\*\*(?:Slides|Beats|Visual)\.\*\*\s+([\s\S]*?)(?=\n## |\s*$)/)?.[1]?.trim() ?? "";
    return { day, format, title, caption_es: es, caption_en: en, visual };
  });
}

export function nextUnusedDay(canned, used) {
  const sorted = [...canned].sort((a, b) => a.day - b.day);
  return sorted.find((p) => !used.has(p.day)) ?? null;
}

export function parseArticleSlate(md) {
  const blocks = md.split(/^## /m).slice(1);
  return blocks.map((block) => {
    const titleLine = block.split("\n")[0].trim();
    const id = titleLine.match(/article-\d+/)?.[0];
    const title = titleLine.replace(/^[\d.]+\s*article-\d+\s+—\s+/, "").trim();
    const file = block.match(/\*\*file:\*\*\s+`([^`]+)`/)?.[1];
    const slug = block.match(/\*\*slug:\*\*\s+`([^`]+)`/)?.[1];
    const query = block.match(/\*\*query:\*\*\s+(.+)/)?.[1]?.trim();
    return { id, title, file, slug, query };
  });
}

export async function usedArticleIds() {
  const ids = new Set();
  for (const stage of ["pending", "approved", "published"]) {
    for (const item of await listStage(stage)) {
      if (item.agent === "article" && item.id) ids.add(item.id);
    }
  }
  return ids;
}
