#!/usr/bin/env node
import { Command } from "commander";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { quickstartText, reviewAfterExtractText } from "./quickstart-text.js";
import {
  writeBrainToDisk,
  validateBrainDir,
  evalDraftAgainstDir,
  askFromDir,
  buildBehaviorSet,
  checkBehaviorSet,
  decideQueueItem,
  enqueueDraft,
  listQueue,
  buildBriefFromDir,
  extractBrainFromWebsiteUrl,
  mergeExtractIntoBrain,
  type EvalCheck,
  setupAgentKnowledgeBase,
  printSetupSummary,
  EMPTY_BRAIN_INPUT,
  loadBrainInputFromDir,
  suggestGapFills,
  type BrainInput,
  type ExtractScanMode,
} from "@agentkbase/core";
import { observeCommand, summarizeToolInput, summarizeToolPayload } from "@agentkbase/core/observe";

const program = new Command();

program
  .name("brain")
  .description("Draft a knowledge base from a public site, then check it before an agent uses it")
  .version("0.1.1");

function resolveExtractMode(opts: { multipage?: boolean; deep?: boolean }): ExtractScanMode {
  if (opts.deep) return "deep";
  if (opts.multipage) return "multipage";
  return "single";
}

function traceHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "invalid-url";
  }
}

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
  .option("--multipage", "With --url, scan extra same-site pages (heuristic)")
  .option("--deep", "With --url, LLM picks extra pages (falls back to heuristic)")
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
        multipage?: boolean;
        deep?: boolean;
        engramProject?: string;
        engram?: boolean;
        forceEngram?: boolean;
      },
    ) => {
      const target = resolve(dir);
      let input = defaultInput(opts.name ?? "my-project", opts.description);

      if (opts.url?.trim()) {
        const url = opts.url.trim();
        const mode = resolveExtractMode(opts);
        const extract = await observeCommand(
          "brain_extract_url",
          { host: traceHost(url), mode },
          () => extractBrainFromWebsiteUrl(url, { mode }),
          (value) => ({
            ok: true,
            method: value.method,
            scanMode: value.scanMode,
            pageCount: value.pagesFetched.length,
            warningCount: value.warnings.length,
          }),
        );
        input = mergeExtractIntoBrain(input, extract, "replace") as BrainInput;
        for (const w of extract.warnings) console.log(`NOTE: ${w}`);
      }

      const result = await setupAgentKnowledgeBase(target, input, {
        engram: opts.engram,
        forceEngram: opts.forceEngram,
        engramProject: opts.engramProject,
      });
      console.log(printSetupSummary(result));
      if (opts.url?.trim()) console.log(`\n${reviewAfterExtractText()}`);
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
    const result = await observeCommand(
      "brain_validate",
      {},
      () => validateBrainDir(target),
      (value) => ({
        ok: value.ok,
        issueCount: value.issues.length,
        levels: value.issues.slice(0, 8).map((issue) => issue.level),
      }),
    );
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
  .command("eval")
  .description("Check a draft against brain/facts (prices first). Does not write or publish.")
  .option("--dir <path>", "Brain root directory", ".")
  .option("--file <path>", "Draft file to check")
  .option("--text <text>", "Draft text to check")
  .option("--article <path>", "Published article; treat --file/--text as a LinkedIn caption")
  .option("--all", "Run all five review checks, not only invented prices")
  .action(
    async (opts: { dir: string; file?: string; text?: string; article?: string; all?: boolean }) => {
      const draft = opts.text ?? (opts.file ? await readFile(resolve(opts.file), "utf8") : "");
      if (!draft.trim()) {
        console.error("Pass --file or --text with a draft.");
        process.exitCode = 1;
        return;
      }
      const article = opts.article ? await readFile(resolve(opts.article), "utf8") : undefined;
      const checks: EvalCheck = opts.all ? "all" : "offer";
      const result = await observeCommand(
        "brain_eval",
        summarizeToolInput({ draft, checks, article }),
        () => evalDraftAgainstDir(resolve(opts.dir), { draft, checks, article }),
        (value) => ({
          ok: value.ok,
          issueCount: value.issues.length,
          issueCodes: value.issues.map((issue) => issue.code),
        }),
      );
      console.log(JSON.stringify({ dir: result.dir, ok: result.ok, issues: result.issues }, null, 2));
      if (!result.ok) process.exitCode = 1;
    },
  );

program
  .command("ask")
  .description("Plan a question against brain/. Prints evidence and gaps. Does not write or call a model.")
  .argument("[question]", "Question a client would ask")
  .option("--dir <path>", "Brain root directory", ".")
  .option("--text <text>", "Question text, instead of the argument")
  .action(async (question: string | undefined, opts: { dir: string; text?: string }) => {
    const text = (opts.text ?? question ?? "").trim();
    if (!text) {
      console.error("Pass a question or --text.");
      process.exitCode = 1;
      return;
    }
    const result = await observeCommand(
      "brain_ask",
      { query: text },
      () => askFromDir(resolve(opts.dir), text),
      (value) => ({
        ok: value.decision === "pass",
        route: value.plan.route,
        decision: value.decision,
        loops: value.loops,
        draft: value.draft.status,
        gapCodes: value.gaps.map((gap) => gap.code),
        paths: value.reads,
      }),
    );
    console.log(JSON.stringify(result, null, 2));
    if (result.decision !== "pass") process.exitCode = 1;
  });

program
  .command("dataset")
  .description("Print the worker behavior set as JSONL. Eval studios never appear in train.")
  .action(async () => {
    const rows = await observeCommand(
      "brain_dataset",
      {},
      async () => {
        const built = buildBehaviorSet();
        const problems = checkBehaviorSet(built);
        if (problems.length > 0) throw new Error(problems.join("\n"));
        return built;
      },
      (value) => ({
        ok: true,
        rows: value.length,
        train: value.filter((row) => row.split === "train").length,
        eval: value.filter((row) => row.split === "eval").length,
      }),
    );
    for (const row of rows) console.log(JSON.stringify(row));
  });

function queuePaths(dir: string, queue?: string): { brainRoot: string; queueDir: string } {
  const brainRoot = resolve(dir);
  return {
    brainRoot,
    queueDir: queue ? resolve(queue) : join(brainRoot, ".agentkbase", "queue"),
  };
}

const queue = program.command("queue").description("Local approval queue. Writes outside brain/ and does not publish.");

queue
  .command("add")
  .description("Ask brain/ and queue one ready draft. A held question is not stored.")
  .argument("[question]", "Question a client would ask")
  .option("--dir <path>", "Brain root directory", ".")
  .option("--text <text>", "Question text, instead of the argument")
  .option("--queue <path>", "Queue directory, outside brain/")
  .action(async (question: string | undefined, opts: { dir: string; text?: string; queue?: string }) => {
    const text = (opts.text ?? question ?? "").trim();
    if (!text) {
      console.error("Pass a question or --text.");
      process.exitCode = 1;
      return;
    }
    const paths = queuePaths(opts.dir, opts.queue);
    const result = await observeCommand(
      "brain_queue_add",
      { query: text },
      async () => {
        const asked = await askFromDir(paths.brainRoot, text);
        return enqueueDraft({
          brainRoot: paths.brainRoot,
          queueDir: paths.queueDir,
          question: text,
          draft: asked.draft,
        });
      },
      (value) => ({
        ok: value.enqueued,
        enqueued: value.enqueued,
        status: value.enqueued ? value.item.status : "held",
        kind: value.enqueued ? value.item.kind : undefined,
      }),
    );
    console.log(JSON.stringify(result, null, 2));
    if (!result.enqueued) process.exitCode = 1;
  });

queue
  .command("list")
  .description("List queued drafts")
  .option("--dir <path>", "Brain root directory", ".")
  .option("--queue <path>", "Queue directory, outside brain/")
  .action(async (opts: { dir: string; queue?: string }) => {
    const paths = queuePaths(opts.dir, opts.queue);
    const items = await observeCommand(
      "brain_queue_list",
      {},
      () => listQueue(paths.brainRoot, paths.queueDir),
      (value) => ({
        ok: true,
        count: value.length,
        pending: value.filter((item) => item.status === "pending").length,
      }),
    );
    console.log(JSON.stringify(items, null, 2));
  });

function decideCommand(decision: "approve" | "reject"): void {
  queue
    .command(decision)
    .description(decision === "approve" ? "Approve one pending draft" : "Reject one pending draft")
    .argument("<id>", "Queue item id")
    .option("--dir <path>", "Brain root directory", ".")
    .option("--queue <path>", "Queue directory, outside brain/")
    .action(async (id: string, opts: { dir: string; queue?: string }) => {
      const paths = queuePaths(opts.dir, opts.queue);
      try {
        const item = await observeCommand(
          "brain_queue_decide",
          { query: id },
          () =>
            decideQueueItem({
              brainRoot: paths.brainRoot,
              queueDir: paths.queueDir,
              id,
              decision,
            }),
          (value) => ({ ok: true, status: value.status, kind: value.kind }),
        );
        console.log(JSON.stringify(item, null, 2));
      } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
      }
    });
}

decideCommand("approve");
decideCommand("reject");

program
  .command("brief")
  .description("Print a token-bounded context pack for agents")
  .option("--dir <path>", "Brain root directory", ".")
  .action(async (opts: { dir: string }) => {
    const text = await observeCommand(
      "brain_brief",
      {},
      () => buildBriefFromDir(resolve(opts.dir)),
      (value) => summarizeToolPayload(value, false),
    );
    console.log(text);
  });

program
  .command("extract-url")
  .description("Extract suggested brain fields from a public website")
  .argument("<url>", "https:// marketing or docs page")
  .option("--json", "Print full extract JSON")
  .option("--multipage", "Scan extra same-site pages (heuristic)")
  .option("--deep", "LLM picks extra pages (requires API key; falls back to heuristic)")
  .option("--init <dir>", "Write full agent KB (brain setup) using extracted fields")
  .option("--no-engram", "With --init, skip Engram files")
  .action(
    async (
      url: string,
      opts: { json?: boolean; multipage?: boolean; deep?: boolean; init?: string; engram?: boolean },
    ) => {
      const mode = resolveExtractMode(opts);
      const extract = await observeCommand(
        "brain_extract_url",
        { host: traceHost(url), mode },
        () => extractBrainFromWebsiteUrl(url, { mode }),
        (value) => ({
          ok: true,
          method: value.method,
          scanMode: value.scanMode,
          pageCount: value.pagesFetched.length,
          warningCount: value.warnings.length,
        }),
      );
      if (opts.init) {
        const input = mergeExtractIntoBrain(EMPTY_BRAIN_INPUT, extract, "replace") as BrainInput;
        const target = resolve(opts.init);
        const result = await setupAgentKnowledgeBase(target, input, { engram: opts.engram });
        console.log(printSetupSummary(result));
        console.log(`\n${reviewAfterExtractText()}`);
        return;
      }
      if (!opts.json) {
        console.log(reviewAfterExtractText());
        console.log("");
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
  .command("fill-gaps")
  .description("Suggest draft answers for open questions (does not write brain/ until you edit)")
  .option("--dir <path>", "Load draft from brain/ on disk", ".")
  .option("--json", "Print GapFillResult JSON")
  .action(async (opts: { dir: string; json?: boolean }) => {
    const result = await observeCommand(
      "brain_fill_gaps",
      {},
      async () => suggestGapFills(await loadBrainInputFromDir(resolve(opts.dir))),
      (value) => ({
        ok: true,
        suggestionCount: value.suggestions.length,
        warningCount: value.warnings.length,
      }),
    );
    if (opts.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      for (const s of result.suggestions) {
        console.log(`Q: ${s.question}`);
        console.log(`A (${s.source}): ${s.draftAnswer}`);
        console.log("");
      }
      for (const w of result.warnings) console.log(`NOTE: ${w}`);
    }
    console.log("\nEdit brain/open-questions.md or re-run wizard, then: brain validate --dir .");
  });

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
    const localGuide = fileURLToPath(new URL("../../../docs/01-first-brain.md", import.meta.url));
    console.log("Studio: https://agentkbase.com/learn/12-what-you-sell");
    console.log("https://agentkbase.com/learn/01-first-brain");
    if (existsSync(localGuide)) console.log(`Local: ${localGuide}`);
  });

program.parse();
