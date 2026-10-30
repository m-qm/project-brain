import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { renderTemplate } from "@agentkbase/templates";
import type { BrainInput } from "./types.js";
import { slugify } from "./slug.js";
import { writeBrainToDisk } from "./disk.js";

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

  await writeBrainToDisk(targetDir, input);
  wrote.push("brain/", "README.md", ".cursor/rules/project-brain.mdc");

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
    `Agent knowledge base ready: ${result.targetDir}`,
    "",
    "Parallel layers for Cursor agents:",
    "  • brain/     — git truth (facts, stories, AGENTS.md)",
    "  • Engram MCP — session memory (mem_context, mem_save)",
    "  • .cursor/rules — when to load each",
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
    "  1. Enable Engram MCP in Cursor (if not already)",
    "  2. brain validate --dir .",
    "  3. brain brief --dir .   # paste into chat or @ brain/",
  );
  return lines.join("\n");
}
