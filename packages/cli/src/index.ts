#!/usr/bin/env node
import { Command } from "commander";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { quickstartText } from "./quickstart-text.js";
import {
  writeBrainToDisk,
  validateBrainDir,
  buildBriefFromDir,
  extractBrainFromWebsiteUrl,
  mergeExtractIntoBrain,
  setupAgentKnowledgeBase,
  printSetupSummary,
  EMPTY_BRAIN_INPUT,
  type BrainInput,
} from "@agentkbase/core";

const program = new Command();

program
  .name("brain")
  .description("Scaffold agent knowledge base (brain + Engram + Cursor rules)")
  .version("0.1.0");

function defaultInput(name: string, description?: string): BrainInput {
  return {
    projectName: name,
    projectDescription:
      description ?? "Describe what this project does in one or two sentences.",
    factBullets: ["Stack and repo URL (edit me)", "Current milestone or release (edit me)"],
    storyTitle: "Core system",
    storyProblem: "(What pain does this project solve?)",
    storyBuilt: "(Main components and boundaries.)",
    storyProof: "(Tests, metrics, or review gates.)",
    openQuestions: ["Deployment target", "Auth provider"],
  };
}

program
  .command("setup")
  .description("One shot: brain/, Cursor rules, and Engram config for agents")
  .argument("[dir]", "Target directory (repo root)", ".")
  .option("-n, --name <name>", "Project name")
  .option("-d, --description <text>", "Mission / one line description")
  .option("--url <url>", "Prefill from public website (calls extract engine)")
  .option("--engram-project <slug>", "Engram project slug (default: slug from name)")
  .option("--no-engram", "Skip .engram/config.json and engram.mdc rule")
  .option("--force-engram", "Overwrite Engram config and rule if present")
  .action(
    async (
      dir: string,
      opts: {
        name?: string;
        description?: string;
        url?: string;
        engramProject?: string;
        engram?: boolean;
        forceEngram?: boolean;
      },
    ) => {
      const target = resolve(dir);
      let input = defaultInput(opts.name ?? "my-project", opts.description);

      if (opts.url?.trim()) {
        const extract = await extractBrainFromWebsiteUrl(opts.url.trim());
        input = mergeExtractIntoBrain(input, extract, "replace") as BrainInput;
        for (const w of extract.warnings) console.log(`NOTE: ${w}`);
      }

      const result = await setupAgentKnowledgeBase(target, input, {
        engram: opts.engram,
        forceEngram: opts.forceEngram,
        engramProject: opts.engramProject,
      });
      console.log(printSetupSummary(result));
    },
  );

program
  .command("init")
  .description("Create brain/ layout only (legacy; prefer brain setup)")
  .argument("[dir]", "Target directory", ".")
  .option("-n, --name <name>", "Project name")
  .option("-d, --description <text>", "One line description")
  .action(async (dir: string, opts: { name?: string; description?: string }) => {
    const target = resolve(dir);
    const input = defaultInput(opts.name ?? "my-project", opts.description);
    await writeBrainToDisk(target, input);
    console.log(`Created project brain in ${target}`);
    console.log("");
    console.log("Tip: run `brain setup` instead for Engram + Cursor rules in one step.");
    console.log("");
    console.log("Next:");
    console.log(`  1. Edit ${join(target, "brain/facts/project.md")}`);
    console.log(`  2. Run: brain validate --dir ${target}`);
    console.log(`  3. Run: brain brief --dir ${target}`);
  });

program
  .command("validate")
  .description("Check required brain files exist")
  .option("--dir <path>", "Brain root directory", ".")
  .action(async (opts: { dir: string }) => {
    const target = resolve(opts.dir);
    const result = await validateBrainDir(target);
    for (const issue of result.issues) {
      const prefix = issue.level === "error" ? "ERROR" : "WARN";
      console.log(`${prefix}: ${issue.message}`);
    }
    if (!result.ok) {
      process.exitCode = 1;
      console.log(`\nValidation failed for ${target}`);
      console.log("Tip: run from the repo root and pass --dir ./examples/fictional-saas-brain or --dir ./my-app");
    } else {
      console.log(`Validation passed (${target}).`);
    }
  });

program
  .command("brief")
  .description("Print a token-bounded context pack for agents")
  .option("--dir <path>", "Brain root directory", ".")
  .action(async (opts: { dir: string }) => {
    const text = await buildBriefFromDir(resolve(opts.dir));
    console.log(text);
  });

program
  .command("extract-url")
  .description("Extract suggested brain fields from a public website")
  .argument("<url>", "https:// marketing or docs page")
  .option("--json", "Print full extract JSON")
  .option("--init <dir>", "Write full agent KB (brain setup) using extracted fields")
  .option("--no-engram", "With --init, skip Engram files")
  .action(
    async (
      url: string,
      opts: { json?: boolean; init?: string; engram?: boolean },
    ) => {
      const extract = await extractBrainFromWebsiteUrl(url);
      if (opts.init) {
        const input = mergeExtractIntoBrain(EMPTY_BRAIN_INPUT, extract, "replace") as BrainInput;
        const target = resolve(opts.init);
        const result = await setupAgentKnowledgeBase(target, input, { engram: opts.engram });
        console.log(printSetupSummary(result));
        return;
      }
      if (opts.json) {
        console.log(JSON.stringify(extract, null, 2));
        return;
      }
      console.log(JSON.stringify(extract.suggested, null, 2));
      for (const w of extract.warnings) console.log(`\nNOTE: ${w}`);
    },
  );

program
  .command("quickstart")
  .description("Plain text setup steps (readable in any terminal)")
  .action(() => {
    console.log(quickstartText());
  });

program
  .command("guide")
  .description("Print path to getting started doc")
  .action(() => {
    const repoRoot = resolve(
      fileURLToPath(new URL("../../../docs/01-first-brain.md", import.meta.url)),
    );
    console.log(repoRoot);
    console.log("\nOpen docs/01-first-brain.md or https://agentkbase.com/learn/01-first-brain");
  });

program.parse();
