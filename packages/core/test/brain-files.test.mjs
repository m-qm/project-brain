import assert from "node:assert/strict";
import { mkdtemp, mkdir, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  BrainPathError,
  listBrainFiles,
  readBrainFile,
  searchBrainFiles,
} from "../dist/brain-files.js";

const example = fileURLToPath(new URL("../../../examples/fictional-saas-brain/", import.meta.url));

test("lists markdown under the example brain", async () => {
  const files = await listBrainFiles(example);
  assert.deepEqual(files, [
    "brain/AGENTS.md",
    "brain/facts/project.md",
    "brain/open-questions.md",
    "brain/stories/notifications.md",
  ]);
});

test("reads a fact file and rejects paths that leave brain/", async () => {
  const facts = await readBrainFile(example, "facts/project.md");
  assert.match(facts, /Taskflow Lite/);

  await assert.rejects(() => readBrainFile(example, "../package.json"), BrainPathError);
  await assert.rejects(() => readBrainFile(example, "brain/../../package.json"), BrainPathError);
  await assert.rejects(() => readBrainFile(example, "/etc/passwd"), BrainPathError);
});

test("search is case-insensitive and returns path plus line", async () => {
  const result = await searchBrainFiles(example, "postgres");
  assert.equal(result.truncated, false);
  assert.ok(
    result.hits.some((hit) => hit.path === "brain/facts/project.md" && /Postgres/.test(hit.text)),
  );
});

test("omits and refuses symlinks that resolve outside brain/", async () => {
  const root = await mkdtemp(join(tmpdir(), "agentkbase-brain-"));
  const brain = join(root, "brain");
  await mkdir(join(brain, "facts"), { recursive: true });
  await writeFile(join(brain, "facts", "project.md"), "# Inside\n", "utf8");
  const outside = join(root, "outside.md");
  await writeFile(outside, "secret\n", "utf8");
  await symlink(outside, join(brain, "leak.md"));
  await symlink(join(brain, "facts", "project.md"), join(brain, "alias.md"));

  const files = await listBrainFiles(root);
  assert.deepEqual(files, ["brain/alias.md", "brain/facts/project.md"]);

  assert.match(await readBrainFile(root, "brain/alias.md"), /Inside/);
  await assert.rejects(() => readBrainFile(root, "brain/leak.md"), /outside brain/);
});
