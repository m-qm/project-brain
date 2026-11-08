import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { renderTemplate } from "@agentkbase/templates";
import type { BrainInput } from "./types.js";
import { slugify } from "./slug.js";
import { writeBrainToDisk } from "./disk.js";
import { ROOT_AGENTS_PATH } from "./pack.js";

export type SetupOptions = {
  /** Write `.engram/config.json` and Engram Cursor rule */
  engram?: boolean;
  /** Overwrite existing Engram files */
  forceEngram?: boolean;
  /** Engram project slug (default: slugified project name) */
  engramProject?: string;
};

export type SetupResult = {
  targetDir: string;
  wrote: string[];
  skipped: string[];
};

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function setupAgentKnowledgeBase(
  targetDir: string,
  input: BrainInput,
  options: SetupOptions = {},
): Promise<SetupResult> {
  const engram = options.engram !== false;
  const wrote: string[] = [];
  const skipped: string[] = [];

  const agentsPath = join(targetDir, ROOT_AGENTS_PATH);
  let agentsBefore: string | null = null;
  if (await exists(agentsPath)) {
    agentsBefore = await readFile(agentsPath, "utf8");
  }

  await writeBrainToDisk(targetDir, input);
  wrote.push("brain/", "README.md");

  const agentsAfter = await readFile(agentsPath, "utf8");
  if (agentsBefore !== agentsAfter) {
    wrote.push(ROOT_AGENTS_PATH);
  } else {
    skipped.push("AGENTS.md (already present)");
  }
  wrote.push(".cursor/rules/project-brain.mdc");

  if (!engram) {
    return { targetDir, wrote, skipped };
  }

  const slug = options.engramProject?.trim() || slugify(input.projectName);
  const configPath = join(targetDir, ".engram/config.json");
  const examplePath = join(targetDir, ".engram/config.example.json");

  if ((await exists(configPath)) && !options.forceEngram) {
    skipped.push(".engram/config.json (already exists)");
  } else {
    if (await exists(examplePath)) {
      const raw = await readFile(examplePath, "utf8");
      const withSlug = raw.replace(/"project":\s*"[^"]*"/, `"project": "${slug}"`);
      await writeFile(configPath, withSlug, "utf8");
    } else {
      await writeFile(configPath, `${JSON.stringify({ project: slug }, null, 2)}\n`, "utf8");
    }
    wrote.push(".engram/config.json");
  }

  const engramRulePath = join(targetDir, ".cursor/rules/engram.mdc");
  if ((await exists(engramRulePath)) && !options.forceEngram) {
    skipped.push(".cursor/rules/engram.mdc (already exists)");
  } else {
    const vars = {
      projectName: input.projectName.trim(),
      projectSlug: slug,
      projectMission: input.projectMission?.trim() || input.projectDescription.trim(),
      projectDescription: input.projectDescription.trim(),
      factBullets: "",
      openQuestions: "",
    };
    await writeFile(engramRulePath, renderTemplate("cursor-rules/engram.mdc", vars), "utf8");
    wrote.push(".cursor/rules/engram.mdc");
  }

  return { targetDir, wrote, skipped };
}

export function printSetupSummary(result: SetupResult): string {
  const lines = [
    "Agent KBase is the knowledge layer every agent reads.",
    `Ready: ${result.targetDir}`,
    "",
    "Wrote:",
    ...result.wrote.map((p) => `  • ${p}`),
  ];
  if (result.skipped.length) {
    lines.push("", "Skipped:", ...result.skipped.map((p) => `  • ${p}`));
  }
  lines.push(
    "",
    "Next:",
    "  1. Ask the agent a client question, then run brain eval on the answer.",
    "  2. Cross out any service, price, or deadline you do not sell.",
    "  3. Write who you serve, and what you will not claim.",
    "  4. Nothing goes live until you say yes.",
    "",
    "Then:",
    "",
    "  brain validate --dir .",
    "  brain brief --dir .",
    "",
    "Engram (optional, later):",
    "  Enable the Engram MCP in Cursor if you want session memory across chats.",
    "  The project slug lives in .engram/config.json.",
    "",
    "  Optional Langfuse traces: set LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY",
    "  on the CLI (LANGFUSE_BASE_URL for a self-hosted instance).",
    "  Spans record the tool, pass/fail, issue codes, and paths. Fact and draft",
    "  text stays local unless LANGFUSE_TRACE_CONTENT=1.",
  );
  return lines.join("\n");
}
