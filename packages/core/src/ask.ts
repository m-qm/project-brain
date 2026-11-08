import { listBrainFiles, readBrainFile, searchBrainFiles } from "./brain-files.js";
import { allowedAmounts, evalDraft, inventedPrices, type EvalCheck } from "./eval-draft.js";

export type AskRoute = "facts" | "story" | "draft";
export type AskDecision = "pass" | "ask_human";
export type LoopAction = AskDecision | "retrieve_again" | "revise";

export type AskGap = {
  code: "missing_price" | "uncovered" | "no_story" | "confirm";
  detail: string;
};

export type AskIssue = {
  code: string;
  detail: string;
};

export type LoopState = {
  route: AskRoute;
  gaps: AskGap[];
  evalCodes: string[];
  retrievesUsed: number;
  revisesUsed: number;
  maxRetrieve: number;
  maxRevise: number;
};

export type AskEvidence = {
  path: string;
  line: number;
  text: string;
};

export type BrainPlan = {
  question: string;
  route: AskRoute;
  delegate: "answer" | "draft";
  checks: EvalCheck[];
  stop: { maxRetrieve: 1; maxRevise: 1 };
};

export type WorkerDraft = {
  status: "ready" | "held";
  kind: "reply" | "post";
  text: string;
  sources: string[];
  actions: Array<"approve" | "reject">;
};

export type AskResult = {
  plan: BrainPlan;
  reads: string[];
  evidence: AskEvidence[];
  gaps: AskGap[];
  issues: AskIssue[];
  loops: LoopAction[];
  decision: AskDecision;
  draft: WorkerDraft;
};

const STOP = new Set([
  "what",
  "does",
  "the",
  "how",
  "did",
  "we",
  "is",
  "in",
  "a",
  "of",
  "for",
  "from",
  "much",
  "can",
  "say",
  "this",
  "that",
  "with",
  "and",
  "or",
  "to",
  "do",
  "not",
  "it",
  "be",
  "are",
  "you",
  "your",
  "our",
  "was",
  "were",
  "have",
  "has",
  "will",
  "just",
  "about",
  "into",
  "them",
  "they",
  "their",
  "when",
  "where",
  "which",
  "who",
  "why",
  "any",
  "all",
  "its",
]);

const DRAFT_RE = /\b(draft|linkedin|article|caption|write\s+(?:a|an|the))\b/i;
const STORY_RE = /\b(how did we|why did we|what did we (?:build|ship)|story)\b/i;
const PRICE_ASK_RE = /\b(how much|what(?:'s| is) the (?:price|cost)|what does it cost)\b/i;
const MAX_EVIDENCE = 8;

export function planTask(question: string): BrainPlan {
  const text = question.trim();
  if (DRAFT_RE.test(text)) {
    return {
      question: text,
      route: "draft",
      delegate: "draft",
      checks: ["offer", "proof", "cta"],
      stop: { maxRetrieve: 1, maxRevise: 1 },
    };
  }
  if (STORY_RE.test(text)) {
    return {
      question: text,
      route: "story",
      delegate: "answer",
      checks: [],
      stop: { maxRetrieve: 1, maxRevise: 1 },
    };
  }
  return {
    question: text,
    route: "facts",
    delegate: "answer",
    checks: [],
    stop: { maxRetrieve: 1, maxRevise: 1 },
  };
}

const HARD_GAP = new Set(["missing_price", "confirm"]);
const MISS_GAP = new Set(["uncovered", "no_story"]);
const REVISABLE = new Set(["invented_proof", "unsafe_cta"]);

/** One wider search, then one revision, then a person. A price or [CONFIRM] never loops. */
export function decideLoop(state: LoopState): LoopAction {
  if (state.gaps.some((gap) => HARD_GAP.has(gap.code))) return "ask_human";
  if (state.evalCodes.includes("invented_price")) return "ask_human";
  if (state.gaps.some((gap) => MISS_GAP.has(gap.code))) {
    return state.retrievesUsed < state.maxRetrieve ? "retrieve_again" : "ask_human";
  }
  if (state.evalCodes.some((code) => REVISABLE.has(code))) {
    return state.revisesUsed < state.maxRevise ? "revise" : "ask_human";
  }
  return "pass";
}

/** A reply or post made only of evidence lines. A held decision has no message to approve. */
export function draftFromAsk(result: Omit<AskResult, "draft">): WorkerDraft {
  const kind = result.plan.delegate === "draft" ? "post" : "reply";
  const held: WorkerDraft = { status: "held", kind, text: "", sources: [], actions: [] };
  if (result.decision !== "pass" || result.evidence.length === 0) return held;
  const lines: string[] = [];
  const sources: string[] = [];
  for (const item of result.evidence) {
    const line = item.text.replace(/^[-*]\s+/, "").trim();
    if (line && !lines.includes(line)) lines.push(line);
    if (!sources.includes(item.path)) sources.push(item.path);
  }
  if (lines.length === 0) return held;
  const body = lines.join("\n");
  const text = kind === "post" ? `${body}\n\n## Sources\n${sources.join("\n")}` : body;
  return { status: "ready", kind, text, sources, actions: ["approve", "reject"] };
}

export function questionTerms(question: string): string[] {
  const terms: string[] = [];
  for (const match of question.toLowerCase().matchAll(/[a-z0-9]{3,}/g)) {
    const term = match[0];
    if (STOP.has(term) || terms.includes(term)) continue;
    terms.push(term);
    if (terms.length >= 8) break;
  }
  return terms;
}

export async function askFromDir(dir: string, question: string): Promise<AskResult & { dir: string }> {
  const plan = planTask(question);
  if (!plan.question) throw new Error("Question is empty.");

  const files = await listBrainFiles(dir);
  const factsPaths = files.filter((path) => path.startsWith("brain/facts/"));
  const factsText = (
    await Promise.all(factsPaths.map(async (path) => readBrainFile(dir, path)))
  ).join("\n\n");
  const terms = questionTerms(plan.question);
  const strict = terms.filter((term) => term.length >= 6);
  const firstTerms = strict.length > 0 ? strict : terms;
  const hardGaps = hardStops(plan.question, factsText, await confirmLines(dir, files), terms);

  let evidence: AskEvidence[] = [];
  let reads: string[] = [];
  if (plan.route === "story") {
    evidence = await searchTerms(dir, firstTerms, "brain/stories/");
    reads = uniquePaths(evidence);
  } else {
    evidence = await factLines(dir, factsPaths, firstTerms);
    reads = factsPaths;
  }

  let softGaps = coverageGaps(plan.route, evidence);
  const issues = draftIssues(plan, factsText);
  let retrievesUsed = 0;
  let revisesUsed = 0;
  const loops: LoopAction[] = [];

  while (loops.length < 4) {
    const action = decideLoop({
      route: plan.route,
      gaps: [...hardGaps, ...softGaps],
      evalCodes: issues.map((issue) => issue.code),
      retrievesUsed,
      revisesUsed,
      maxRetrieve: plan.stop.maxRetrieve,
      maxRevise: plan.stop.maxRevise,
    });
    loops.push(action);
    if (action === "retrieve_again") {
      retrievesUsed += 1;
      const wider = await searchTerms(dir, terms, "brain/");
      if (wider.length > 0) {
        evidence = wider;
        for (const path of uniquePaths(wider)) {
          if (!reads.includes(path)) reads.push(path);
        }
        softGaps = [];
      }
      continue;
    }
    if (action === "revise") {
      revisesUsed += 1;
      continue;
    }
    return finish(dir, plan, reads, evidence, [...hardGaps, ...softGaps], issues, loops, action);
  }

  return finish(dir, plan, reads, evidence, [...hardGaps, ...softGaps], issues, loops, "ask_human");
}

function finish(
  dir: string,
  plan: BrainPlan,
  reads: string[],
  evidence: AskEvidence[],
  gaps: AskGap[],
  issues: AskIssue[],
  loops: LoopAction[],
  decision: AskDecision,
): AskResult & { dir: string } {
  const base = { dir, plan, reads, evidence, gaps, issues, loops, decision };
  return { ...base, draft: draftFromAsk(base) };
}

function hardStops(question: string, factsText: string, confirms: Array<{ text: string }>, terms: string[]): AskGap[] {
  const gaps: AskGap[] = [];
  if (inventedPrices(question, factsText).length > 0) {
    gaps.push({
      code: "missing_price",
      detail: "The question states an amount that is not in brain/facts.",
    });
  } else if (PRICE_ASK_RE.test(question) && allowedAmounts(factsText).size === 0) {
    gaps.push({
      code: "missing_price",
      detail: "The question asks for a price and brain/facts has none.",
    });
  }
  for (const line of confirms) {
    const haystack = line.text.toLowerCase();
    if (!terms.some((term) => haystack.includes(term))) continue;
    gaps.push({ code: "confirm", detail: line.text });
    if (gaps.filter((gap) => gap.code === "confirm").length >= 4) break;
  }
  return gaps;
}

function coverageGaps(route: AskRoute, evidence: AskEvidence[]): AskGap[] {
  if (evidence.length > 0) return [];
  if (route === "story") return [{ code: "no_story", detail: "No story file matches this question." }];
  return [{ code: "uncovered", detail: "No fact line matches this question." }];
}

function draftIssues(plan: BrainPlan, factsText: string): AskIssue[] {
  if (plan.route !== "draft") return [];
  const result = evalDraft({ draft: plan.question, facts: factsText, checks: plan.checks });
  return result.issues.map((issue) => ({ code: issue.code, detail: issue.detail }));
}

async function factLines(dir: string, paths: string[], terms: string[]): Promise<AskEvidence[]> {
  const evidence: AskEvidence[] = [];
  for (const path of paths) {
    const text = await readBrainFile(dir, path);
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith("#")) continue;
      const haystack = line.toLowerCase();
      if (!terms.some((term) => haystack.includes(term))) continue;
      evidence.push({ path, line: i + 1, text: clip(line) });
      if (evidence.length >= MAX_EVIDENCE) return evidence;
    }
  }
  return evidence;
}

async function searchTerms(dir: string, terms: string[], prefix: string): Promise<AskEvidence[]> {
  const evidence: AskEvidence[] = [];
  const seen = new Set<string>();
  for (const term of terms) {
    const result = await searchBrainFiles(dir, term);
    for (const hit of result.hits) {
      if (!hit.path.startsWith(prefix)) continue;
      const key = `${hit.path}:${hit.line}`;
      if (seen.has(key)) continue;
      seen.add(key);
      evidence.push({ path: hit.path, line: hit.line, text: clip(hit.text) });
      if (evidence.length >= MAX_EVIDENCE) return evidence;
    }
  }
  return evidence;
}

async function confirmLines(
  dir: string,
  files: string[],
): Promise<Array<{ text: string }>> {
  if (!files.includes("brain/open-questions.md")) return [];
  const text = await readBrainFile(dir, "brain/open-questions.md");
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.includes("[CONFIRM]"))
    .map((line) => ({ text: clip(line) }));
}

function uniquePaths(evidence: AskEvidence[]): string[] {
  const paths: string[] = [];
  for (const item of evidence) {
    if (!paths.includes(item.path)) paths.push(item.path);
  }
  return paths;
}

function clip(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= 240) return trimmed;
  return `${trimmed.slice(0, 240)}…`;
}
