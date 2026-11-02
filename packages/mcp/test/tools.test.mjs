import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { brainBrief, brainRead, brainValidate } from "../dist/tools.js";
import { resolveBrainDir } from "../dist/resolve-root.js";

const example = resolve(fileURLToPath(new URL("../../../examples/fictional-saas-brain", import.meta.url)));
const serverPath = fileURLToPath(new URL("../dist/index.js", import.meta.url));

test("resolveBrainDir walks up to the repo that contains brain/AGENTS.md", async () => {
  const nested = join(example, "brain", "facts");
  const found = await resolveBrainDir(nested);
  assert.equal(found, example);
});

test("resolveBrainDir fails when no brain exists nearby", async () => {
  const empty = await mkdtemp(join(tmpdir(), "agentkbase-empty-"));
  await assert.rejects(() => resolveBrainDir(empty), /No brain\/AGENTS.md/);
});

test("brief and validate read the example brain", async () => {
  const brief = await brainBrief({ dir: example });
  assert.equal(brief.isError, undefined);
  assert.match(brief.content[0].text, /Taskflow Lite/);

  const validation = await brainValidate({ dir: example });
  const parsed = JSON.parse(validation.content[0].text);
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.issues, []);
});

test("brain_read rejects a path outside brain/", async () => {
  const result = await brainRead({ dir: example, path: "../package.json" });
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /outside brain/);
});

test("stdio server answers brain_brief and brain_validate", async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
    cwd: example,
    stderr: "pipe",
  });
  const client = new Client({ name: "agentkbase-test", version: "0.0.0" });
  await client.connect(transport);
  try {
    const listed = await client.listTools();
    const names = listed.tools.map((tool) => tool.name).sort();
    assert.deepEqual(names, [
      "brain_brief",
      "brain_list",
      "brain_open_questions",
      "brain_read",
      "brain_search",
      "brain_validate",
    ]);
    assert.equal(listed.tools.every((tool) => tool.annotations?.readOnlyHint === true), true);

    const brief = await client.callTool({ name: "brain_brief", arguments: {} });
    assert.notEqual(brief.isError, true);
    const briefText = brief.content.find((block) => block.type === "text");
    assert.equal(briefText?.type, "text");
    if (briefText?.type === "text") assert.match(briefText.text, /Taskflow Lite/);

    const validation = await client.callTool({ name: "brain_validate", arguments: {} });
    assert.notEqual(validation.isError, true);
    const validationText = validation.content.find((block) => block.type === "text");
    assert.equal(validationText?.type, "text");
    if (validationText?.type === "text") {
      const parsed = JSON.parse(validationText.text);
      assert.equal(parsed.ok, true);
    }
  } finally {
    await client.close();
  }
});

test("BRAIN_DIR is used when dir is omitted", async () => {
  const previous = process.env.BRAIN_DIR;
  process.env.BRAIN_DIR = example;
  try {
    const found = await resolveBrainDir();
    assert.equal(found, example);
  } finally {
    if (previous === undefined) delete process.env.BRAIN_DIR;
    else process.env.BRAIN_DIR = previous;
  }
});
