import {
  buildBriefFromDir,
  listBrainFiles,
  loadBrainInputFromDir,
  readBrainFile,
  searchBrainFiles,
  validateBrainDir,
} from "@agentkbase/core";
import { resolveBrainDir } from "./resolve-root.js";

export type ToolTextResult = {
  content: [{ type: "text"; text: string }];
  isError?: boolean;
};

function ok(text: string): ToolTextResult {
  return { content: [{ type: "text", text }] };
}

function fail(err: unknown): ToolTextResult {
  const text = err instanceof Error ? err.message : "Unknown error";
  return { content: [{ type: "text", text }], isError: true };
}

export async function brainBrief(args: { dir?: string }): Promise<ToolTextResult> {
  try {
    const root = await resolveBrainDir(args.dir);
    return ok(await buildBriefFromDir(root));
  } catch (err) {
    return fail(err);
  }
}

export async function brainValidate(args: { dir?: string }): Promise<ToolTextResult> {
  try {
    const root = await resolveBrainDir(args.dir);
    const result = await validateBrainDir(root);
    return ok(JSON.stringify({ dir: root, ok: result.ok, issues: result.issues }, null, 2));
  } catch (err) {
    return fail(err);
  }
}

export async function brainList(args: { dir?: string }): Promise<ToolTextResult> {
  try {
    const root = await resolveBrainDir(args.dir);
    const files = await listBrainFiles(root);
    return ok(JSON.stringify({ dir: root, files }, null, 2));
  } catch (err) {
    return fail(err);
  }
}

export async function brainRead(args: { dir?: string; path: string }): Promise<ToolTextResult> {
  try {
    const root = await resolveBrainDir(args.dir);
    const text = await readBrainFile(root, args.path);
    return ok(text);
  } catch (err) {
    return fail(err);
  }
}

export async function brainSearch(args: { dir?: string; query: string }): Promise<ToolTextResult> {
  try {
    const root = await resolveBrainDir(args.dir);
    const result = await searchBrainFiles(root, args.query);
    return ok(JSON.stringify({ dir: root, query: args.query, ...result }, null, 2));
  } catch (err) {
    return fail(err);
  }
}

export async function brainOpenQuestions(args: { dir?: string }): Promise<ToolTextResult> {
  try {
    const root = await resolveBrainDir(args.dir);
    const input = await loadBrainInputFromDir(root);
    const questions = input.openQuestions
      .map((question) => question.trim())
      .filter((question) => question.length > 0 && question !== "[CONFIRM]");
    return ok(JSON.stringify({ dir: root, questions }, null, 2));
  } catch (err) {
    return fail(err);
  }
}
