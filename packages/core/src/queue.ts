import { randomBytes } from "node:crypto";
import { mkdir, readFile, readdir, realpath, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import type { WorkerDraft } from "./ask.js";

export type QueueStatus = "pending" | "approved" | "rejected";
export type QueueDecision = "approve" | "reject";

export type QueueItem = {
  id: string;
  status: QueueStatus;
  kind: WorkerDraft["kind"];
  question: string;
  text: string;
  sources: string[];
  createdAt: string;
  decidedAt?: string;
};

export type EnqueueResult =
  | { enqueued: false; reason: "held" }
  | { enqueued: true; item: QueueItem };

const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

function isInside(parent: string, child: string): boolean {
  const rel = relative(parent, child);
  return rel === "" || (!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel));
}

async function existingReal(path: string): Promise<string | undefined> {
  let current = path;
  for (;;) {
    try {
      return await realpath(current);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "ENOENT") throw error;
      const parent = dirname(current);
      if (parent === current) return undefined;
      current = parent;
    }
  }
}

/** The queue directory has to stay outside brain/, including when a symlink points back in. */
export async function assertQueueOutsideBrain(brainRoot: string, queueDir: string): Promise<void> {
  const brainDir = resolve(brainRoot, "brain");
  const queue = resolve(queueDir);
  if (isInside(brainDir, queue)) throw new Error("The queue stays outside brain/.");
  const realBrain = await existingReal(brainDir);
  const realQueue = await existingReal(queue);
  if (realBrain && realQueue && isInside(realBrain, realQueue)) {
    throw new Error("The queue stays outside brain/.");
  }
}

function assertId(id: string): void {
  if (!ID_RE.test(id)) throw new Error("Queue id is not a single file name.");
}

function itemPath(queueDir: string, id: string): string {
  assertId(id);
  return resolve(queueDir, `${id}.json`);
}

async function readItem(queueDir: string, id: string): Promise<QueueItem> {
  try {
    const raw = await readFile(itemPath(queueDir, id), "utf8");
    const item = JSON.parse(raw) as QueueItem;
    if (item.id !== id) throw new Error(`Queue item ${id} is unreadable.`);
    return item;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") throw new Error(`No queue item ${id}.`);
    throw error;
  }
}

/** A ready draft becomes a pending piece. A held draft is not written. */
export async function enqueueDraft(input: {
  brainRoot: string;
  queueDir: string;
  question: string;
  draft: WorkerDraft;
  id?: string;
  now?: Date;
}): Promise<EnqueueResult> {
  const question = input.question.trim();
  if (!question) throw new Error("Question is empty.");
  if (input.draft.status !== "ready" || input.draft.text.trim() === "") {
    return { enqueued: false, reason: "held" };
  }
  await assertQueueOutsideBrain(input.brainRoot, input.queueDir);
  const id = input.id ?? `q${randomBytes(6).toString("hex")}`;
  assertId(id);
  const item: QueueItem = {
    id,
    status: "pending",
    kind: input.draft.kind,
    question,
    text: input.draft.text,
    sources: [...input.draft.sources],
    createdAt: (input.now ?? new Date()).toISOString(),
  };
  await mkdir(input.queueDir, { recursive: true });
  await assertQueueOutsideBrain(input.brainRoot, input.queueDir);
  await writeFile(itemPath(input.queueDir, id), `${JSON.stringify(item, null, 2)}\n`, "utf8");
  return { enqueued: true, item };
}

export async function listQueue(brainRoot: string, queueDir: string): Promise<QueueItem[]> {
  await assertQueueOutsideBrain(brainRoot, queueDir);
  let names: string[];
  try {
    names = await readdir(queueDir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  const items: QueueItem[] = [];
  for (const name of names) {
    if (!name.endsWith(".json")) continue;
    items.push(await readItem(queueDir, name.slice(0, -".json".length)));
  }
  items.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  return items;
}

/** One decision. A second approve or reject leaves the piece as it was. */
export async function decideQueueItem(input: {
  brainRoot: string;
  queueDir: string;
  id: string;
  decision: QueueDecision;
  now?: Date;
}): Promise<QueueItem> {
  await assertQueueOutsideBrain(input.brainRoot, input.queueDir);
  const item = await readItem(input.queueDir, input.id);
  if (item.status !== "pending") {
    throw new Error(`Queue item ${item.id} is already ${item.status}.`);
  }
  const decided: QueueItem = {
    ...item,
    status: input.decision === "approve" ? "approved" : "rejected",
    decidedAt: (input.now ?? new Date()).toISOString(),
  };
  await writeFile(itemPath(input.queueDir, item.id), `${JSON.stringify(decided, null, 2)}\n`, "utf8");
  return decided;
}
