import assert from "node:assert/strict";
import { mkdtemp, mkdir, readdir, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { askFromDir, decideQueueItem, enqueueDraft, listQueue } from "../dist/index.js";

const example = fileURLToPath(new URL("../../../examples/fictional-saas-brain/", import.meta.url));

const ready = {
  status: "ready",
  kind: "reply",
  text: "Billing: not implemented in v1.",
  sources: ["brain/facts/project.md"],
  actions: ["approve", "reject"],
};

async function workspace() {
  const root = await mkdtemp(join(tmpdir(), "agentkbase-queue-"));
  await mkdir(join(root, "brain", "facts"), { recursive: true });
  await writeFile(join(root, "brain", "facts", "project.md"), "# Facts\n", "utf8");
  return root;
}

test("a ready draft is pending and a held draft writes nothing", async () => {
  const root = await workspace();
  const queueDir = join(root, ".agentkbase", "queue");
  const added = await enqueueDraft({
    brainRoot: root,
    queueDir,
    question: "Is billing implemented in v1?",
    draft: ready,
    id: "billing",
    now: new Date("2026-11-08T12:00:00.000Z"),
  });
  assert.equal(added.enqueued, true);
  if (!added.enqueued) return;
  assert.equal(added.item.status, "pending");
  assert.equal(added.item.text, ready.text);

  const held = await enqueueDraft({
    brainRoot: root,
    queueDir,
    question: "What is the pro price?",
    draft: { status: "held", kind: "reply", text: "", sources: [], actions: [] },
    id: "price",
  });
  assert.deepEqual(held, { enqueued: false, reason: "held" });
  const names = await readdir(queueDir);
  assert.deepEqual(names, ["billing.json"]);
});

test("the queue refuses a directory inside brain/", async () => {
  const root = await workspace();
  await assert.rejects(
    () =>
      enqueueDraft({
        brainRoot: root,
        queueDir: join(root, "brain", "queue"),
        question: "Is billing implemented in v1?",
        draft: ready,
        id: "billing",
      }),
    /outside brain/,
  );
  assert.deepEqual(await readdir(join(root, "brain")), ["facts"]);
});

test("a symlink back into brain/ is refused before a file is written", async () => {
  const root = await workspace();
  await symlink(join(root, "brain"), join(root, "linked-brain"));
  await assert.rejects(
    () =>
      enqueueDraft({
        brainRoot: root,
        queueDir: join(root, "linked-brain", "queue"),
        question: "Is billing implemented in v1?",
        draft: ready,
        id: "billing",
      }),
    /outside brain/,
  );
  assert.deepEqual(await readdir(join(root, "brain")), ["facts"]);
});

test("approve and reject stick, and a second decision does not flip", async () => {
  const root = await workspace();
  const queueDir = join(root, ".agentkbase", "queue");
  await enqueueDraft({
    brainRoot: root,
    queueDir,
    question: "Is billing implemented in v1?",
    draft: ready,
    id: "billing",
  });
  await enqueueDraft({
    brainRoot: root,
    queueDir,
    question: "How did the digest ship?",
    draft: { ...ready, kind: "post", text: "A Monday cron sends the digest." },
    id: "digest",
  });
  const approved = await decideQueueItem({
    brainRoot: root,
    queueDir,
    id: "billing",
    decision: "approve",
    now: new Date("2026-11-08T12:05:00.000Z"),
  });
  assert.equal(approved.status, "approved");
  await assert.rejects(
    () => decideQueueItem({ brainRoot: root, queueDir, id: "billing", decision: "reject" }),
    /already approved/,
  );
  const rejected = await decideQueueItem({ brainRoot: root, queueDir, id: "digest", decision: "reject" });
  assert.equal(rejected.status, "rejected");
  const items = await listQueue(root, queueDir);
  assert.deepEqual(
    items.map((item) => [item.id, item.status]),
    [
      ["billing", "approved"],
      ["digest", "rejected"],
    ],
  );
});

test("an ask against the example brain queues the billing reply and drops the price", async () => {
  const root = await workspace();
  const queueDir = join(root, ".agentkbase", "queue");
  const covered = await askFromDir(example, "Is billing implemented in v1?");
  const added = await enqueueDraft({
    brainRoot: root,
    queueDir,
    question: "Is billing implemented in v1?",
    draft: covered.draft,
    id: "billing",
  });
  assert.equal(added.enqueued, true);
  if (!added.enqueued) return;
  assert.match(added.item.text, /not implemented in v1/);

  const price = await askFromDir(example, "The website pack is from 49 €.");
  const held = await enqueueDraft({
    brainRoot: root,
    queueDir,
    question: "The website pack is from 49 €.",
    draft: price.draft,
    id: "price",
  });
  assert.equal(held.enqueued, false);
  assert.equal(JSON.stringify(await listQueue(root, queueDir)).includes("49"), false);
});
