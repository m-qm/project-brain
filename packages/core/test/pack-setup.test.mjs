import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";
import { writeBrainToDisk } from "../dist/disk.js";
import {
  ROOT_AGENTS_BLOCK_END,
  ROOT_AGENTS_BLOCK_START,
  ROOT_AGENTS_PATH,
  buildPackFiles,
  rootAgentsMd,
} from "../dist/pack.js";
import { printSetupSummary, setupAgentKnowledgeBase } from "../dist/setup.js";
import { validateBrainDir } from "../dist/validate-disk.js";
import { brainArchiveBasename, buildZipBuffer } from "../dist/zip.js";

const example = fileURLToPath(new URL("../../../examples/fictional-saas-brain/", import.meta.url));

const input = {
  projectName: "Northwind Studio",
  projectDescription: "Initech pays 4900 EUR a month for a retainer.",
  factBullets: ["Client Initech pays 4900 EUR"],
  storyTitle: "Intake",
  storyProblem: "Calls pile up",
  storyBuilt: "A form",
  storyProof: "The waitlist dropped",
  openQuestions: ["[CONFIRM] public price"],
};

test("pack emits one short root AGENTS.md and does not copy draft facts into it", () => {
  const files = buildPackFiles(input);
  assert.deepEqual(
    files.map((file) => file.path),
    [
      "README.md",
      "AGENTS.md",
      "brain/AGENTS.md",
      "brain/facts/project.md",
      "brain/facts/README.md",
      "brain/stories/TEMPLATE.md",
      "brain/stories/intake.md",
      "brain/open-questions.md",
      ".cursor/rules/project-brain.mdc",
      ".engram/config.example.json",
    ],
  );

  const root = files.find((file) => file.path === ROOT_AGENTS_PATH);
  assert.equal(root?.content, rootAgentsMd());
  assert.match(root.content, /Read `brain\/facts\/project\.md` and `brain\/open-questions\.md`/);
  assert.match(root.content, /Do not invent a price, a client, or a metric/);
  assert.match(root.content, /Stop on `\[CONFIRM\]`/);
  assert.match(root.content, /Run `brain eval` before a public draft/);
  assert.equal(root.content.includes("4900"), false);
  assert.equal(root.content.includes("Initech"), false);
  assert.equal(root.content.includes("Northwind"), false);
  assert.equal(root.content.startsWith("---\n"), false);

  const brainAgents = files.find((file) => file.path === "brain/AGENTS.md");
  assert.match(brainAgents.content, /Northwind Studio/);
});

test("a fresh zip includes the whole root AGENTS.md", async () => {
  const zip = await JSZip.loadAsync(await buildZipBuffer(input));
  const path = `${brainArchiveBasename(input)}/AGENTS.md`;
  const text = await zip.file(path).async("string");
  assert.equal(text, rootAgentsMd());
});

test("setup writes root AGENTS.md and lists it only when the file changed", async () => {
  const dir = await mkdtemp(join(tmpdir(), "agentkbase-setup-"));
  const first = await setupAgentKnowledgeBase(dir, input, { engram: false });
  assert.ok(first.wrote.includes("AGENTS.md"));
  assert.equal(first.skipped.some((line) => line.startsWith("AGENTS.md")), false);
  assert.equal(await readFile(join(dir, "AGENTS.md"), "utf8"), rootAgentsMd());
  await assert.rejects(readFile(join(dir, ".engram/config.json"), "utf8"));

  const summary = printSetupSummary(first);
  assert.match(summary, /the knowledge layer every agent reads/);
  assert.match(summary, /• AGENTS\.md/);
  assert.equal(summary.includes("Parallel layers"), false);
  assert.equal(summary.includes("npx"), false);
  assert.equal(summary.includes("@agentkbase/mcp"), false);

  const preface = "# Existing rules\n\nKeep this.\n";
  await writeFile(join(dir, "AGENTS.md"), preface, "utf8");
  const appended = await setupAgentKnowledgeBase(
    dir,
    { ...input, projectName: "Second Studio" },
    { engram: false },
  );
  const merged = await readFile(join(dir, "AGENTS.md"), "utf8");
  assert.ok(appended.wrote.includes("AGENTS.md"));
  assert.match(merged, /^# Existing rules\n\nKeep this\.\n\n<!-- agentkbase:agents:start -->/);
  assert.equal(merged.split(ROOT_AGENTS_BLOCK_START).length, 2);
  assert.equal(merged.endsWith(rootAgentsMd()), true);
  const facts = await readFile(join(dir, "brain/facts/project.md"), "utf8");
  assert.match(facts, /Second Studio/);

  const again = await setupAgentKnowledgeBase(dir, input, { engram: false });
  assert.equal(again.wrote.includes("AGENTS.md"), false);
  assert.ok(again.skipped.includes("AGENTS.md (already present)"));
  assert.equal(await readFile(join(dir, "AGENTS.md"), "utf8"), merged);
  const againSummary = printSetupSummary(again);
  assert.doesNotMatch(againSummary, /^  • AGENTS\.md$/m);
  assert.match(againSummary, /Skipped:[\s\S]*AGENTS\.md \(already present\)/);
});

test("writeBrainToDisk appends the marked block instead of replacing an existing root file", async () => {
  const dir = await mkdtemp(join(tmpdir(), "agentkbase-disk-"));
  await writeFile(join(dir, "AGENTS.md"), "# Keep\n", "utf8");
  await writeBrainToDisk(dir, input);
  const text = await readFile(join(dir, "AGENTS.md"), "utf8");
  assert.match(text, /^# Keep\n\n/);
  assert.ok(text.includes(ROOT_AGENTS_BLOCK_START));
  assert.ok(text.includes(ROOT_AGENTS_BLOCK_END));
  await writeBrainToDisk(dir, input);
  assert.equal(await readFile(join(dir, "AGENTS.md"), "utf8"), text);
});

test("setup summary leads with a client question and brain eval", () => {
  const summary = printSetupSummary({
    targetDir: "/tmp/studio",
    wrote: ["brain/", "README.md", ".cursor/rules/project-brain.mdc"],
    skipped: [],
  });
  const lines = summary.split("\n");
  const next = lines.indexOf("Next:");
  assert.equal(
    lines[next + 1],
    "  1. Ask the agent a client question, then run brain eval on the answer.",
  );
  assert.equal(lines[next + 2], "  2. Cross out any service, price, or deadline you do not sell.");
  assert.equal(lines[next + 3], "  3. Write who you serve, and what you will not claim.");
  assert.equal(lines[next + 4], "  4. Nothing goes live until you say yes.");
  const engram = lines.findIndex((line) => line.startsWith("Engram (optional, later):"));
  assert.ok(engram > next + 4);
  assert.match(summary, /^Agent KBase is the knowledge layer every agent reads\./);
  assert.equal(summary.includes("Parallel layers for Cursor agents"), false);
  assert.equal(summary.includes("npx"), false);
  assert.equal(summary.includes("@agentkbase/mcp"), false);
  assert.match(summary, /brain validate --dir \./);
  assert.match(summary, /brain brief --dir \./);
});

test("validation still does not require a root AGENTS.md", async () => {
  const result = await validateBrainDir(example);
  assert.equal(result.ok, true);
  assert.equal(
    result.issues.some((issue) => issue.message === "Missing required file: AGENTS.md"),
    false,
  );
});
