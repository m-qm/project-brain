export type PublicReview = {
  id?: string;
  author: string;
  rating: number;
  text: string;
};

export type ReviewLoopResult = {
  status: "draft" | "escalate";
  reply?: string;
  reason?: string;
  posted: boolean;
  review: PublicReview;
  gaps: string[];
  note: string;
};

export type DraftModel = (input: { review: PublicReview; brief: string }) => Promise<string>;

export type ReplyLoopInput = {
  brief: string;
  /** When set, the draft is checked with this callback. `brain_eval` is one such callback. */
  evalDraft?: (draft: string) => Promise<unknown>;
  /** Optional. With no model, the reply is assembled from brief lines. */
  model?: DraftModel;
};

const HOSTILE: ReadonlyArray<{ label: string; pattern: RegExp }> = [
  {
    label: "insult",
    pattern: /\b(idiot|stupid|incompetent|useless|moron|dumb|pathetic|garbage|trash|basura|in[uú]til|timo|timador)\b/i,
  },
  {
    label: "legal threat",
    pattern: /\b(lawyer|attorney|lawsuit|legal action|sue you|i will sue|we'll sue|abogado|demanda)\b/i,
  },
  { label: "refund demand", pattern: /\b(refund|reembolso|money back)\b/i },
  { label: "never again", pattern: /never again/i },
  { label: "estafa", pattern: /\bestafa\b/i },
  { label: "horrible", pattern: /\bhorrible\b/i },
];

const PRICE_ASK = /\b(how much|what(?:'s| is) the (?:price|cost)|price|pricing|cu[aá]nto|precio|tarifa)\b/i;
const CLIENT_ASK =
  /\b(client name|name of (?:the |your )?client|which clients|your clients|who is (?:the |your )?client|customer name|nombre del cliente|qui[eé]n es (?:el |tu |vuestro )?cliente)\b/i;
const DATE_ASK = /\b(what date|which date|launch date|when did|when will|fecha|deadline|on what day|what day)\b/i;
const AMOUNT = /(?:[$€£]\s*\d|\b\d+(?:[.,]\d+)?\s*(?:€|eur|euros|\$|usd|dollars)\b)/gi;
const NOT_POSTED = "Not posted.";

export function briefGaps(brief: string): string[] {
  return brief
    .split("\n")
    .map((line) => line.trim().replace(/^[-*]\s+/, ""))
    .filter((line) => line.includes("[CONFIRM]"));
}

export function replyToReview(review: PublicReview, input: ReplyLoopInput): Promise<ReviewLoopResult> {
  return decide(review, input);
}

async function decide(review: PublicReview, input: ReplyLoopInput): Promise<ReviewLoopResult> {
  const gaps = briefGaps(input.brief);
  const hostile = hostileLabels(review.text);
  const rating = review.rating;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return escalate(review, gaps, "Rating must be a whole number from 1 to 5.");
  }

  if (rating <= 2 || hostile.length > 0) {
    const parts = [`Rating is ${rating}.`];
    if (hostile.length > 0) parts.push(`The text is hostile (${hostile.join(", ")}).`);
    if (gaps.length > 0) parts.push(`Look at: ${gaps.join("; ")}.`);
    return escalate(review, gaps, parts.join(" "));
  }

  const missing = missingAsks(review.text, input.brief);
  if (missing.length > 0) {
    const look = [...missing, ...gaps.filter((gap) => !missing.includes(gap))];
    return escalate(
      review,
      look,
      `The review asks for ${missing.join("; ")}. That is not answered from the folder.`,
    );
  }

  const reply = input.model ? (await input.model({ review, brief: input.brief })).trim() : draftFromBrief(review, input.brief);
  if (!reply) {
    return escalate(review, gaps, "The draft is empty. A model was not used, and the brief has no lines to assemble.");
  }

  const invented = inventedAmounts(reply, input.brief);
  if (invented.length > 0) {
    return escalate(review, gaps, `The draft names a price that is not in the brief (${invented.join(", ")}). [CONFIRM]`);
  }

  if (input.evalDraft) {
    let evalResult: unknown;
    try {
      evalResult = await input.evalDraft(reply);
    } catch {
      return escalate(review, gaps, "brain_eval could not check the draft. [CONFIRM]");
    }
    if (evalReportsInventedPrice(evalResult)) {
      return escalate(review, gaps, "brain_eval reported an invented price. [CONFIRM]");
    }
  }

  return {
    status: "draft",
    reply,
    posted: false,
    review,
    gaps: [],
    note: NOT_POSTED,
  };
}

function escalate(review: PublicReview, gaps: string[], reason: string): ReviewLoopResult {
  return {
    status: "escalate",
    reason: `${reason} ${NOT_POSTED}`,
    posted: false,
    review,
    gaps,
    note: NOT_POSTED,
  };
}

function hostileLabels(text: string): string[] {
  return HOSTILE.filter((item) => item.pattern.test(text)).map((item) => item.label);
}

function missingAsks(text: string, brief: string): string[] {
  const missing: string[] = [];
  if (PRICE_ASK.test(text) && amountsIn(factText(brief)).size === 0) {
    missing.push("[CONFIRM] price");
  }
  if (CLIENT_ASK.test(text) && !briefHasClient(brief)) {
    missing.push("[CONFIRM] client name");
  }
  if (DATE_ASK.test(text) && !briefHasDate(brief)) {
    missing.push("[CONFIRM] date");
  }
  return missing;
}

function briefHasClient(brief: string): boolean {
  return factLines(brief).some((line) => /\bclients?\b/i.test(line) && !/\bno clients?\b/i.test(line));
}

function briefHasDate(brief: string): boolean {
  return factLines(brief).some(
    (line) =>
      /\b(19|20)\d{2}-\d{2}-\d{2}\b/.test(line) ||
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/i.test(line),
  );
}

function factLines(brief: string): string[] {
  const project: string[] = [];
  const other: string[] = [];
  let inProject = false;
  let inOpen = false;
  for (const raw of brief.split("\n")) {
    const line = raw.trim();
    if (/^##\s+/.test(line)) {
      inProject = /facts\/project\.md/.test(line);
      inOpen = /open-questions\.md/.test(line);
      continue;
    }
    if (inOpen || !/^[-*]\s+/.test(line)) continue;
    const text = line.replace(/^[-*]\s+/, "").trim();
    if (!text || text.includes("[CONFIRM]")) continue;
    if (/do not invent|anything not listed|must be confirmed/i.test(text)) continue;
    (inProject ? project : other).push(text);
  }
  return [...project, ...other];
}

function factText(brief: string): string {
  return factLines(brief).join("\n");
}

function draftFromBrief(review: PublicReview, brief: string): string {
  const author = review.author.replace(/\s+/g, " ").trim();
  const thanks = author ? `Thanks, ${author}.` : "Thanks.";
  const name = brief.match(/\*\*([^*]{1,80})\*\*/)?.[1]?.trim();
  const facts = factLines(brief).slice(0, 2);
  const parts = [thanks];
  if (name) parts.push(name + ".");
  for (const fact of facts) parts.push(fact.endsWith(".") ? fact : `${fact}.`);
  return parts.join(" ");
}

function amountsIn(text: string): Set<string> {
  const found = new Set<string>();
  for (const match of text.matchAll(AMOUNT)) {
    const digits = match[0].replace(/[^\d]/g, "");
    if (digits) found.add(digits);
  }
  return found;
}

function inventedAmounts(draft: string, brief: string): string[] {
  const allowed = amountsIn(factText(brief));
  return [...amountsIn(draft)].filter((amount) => !allowed.has(amount));
}

export function evalReportsInventedPrice(result: unknown): boolean {
  const value = unwrapEval(result);
  if (!value || typeof value !== "object") return false;
  const issues = (value as { issues?: unknown }).issues;
  if (!Array.isArray(issues)) return false;
  return issues.some((issue) => {
    if (!issue || typeof issue !== "object") return false;
    const code = (issue as { code?: unknown }).code;
    return code === "invented_price" || code === "linkedin_new_price";
  });
}

function unwrapEval(result: unknown): unknown {
  if (typeof result === "string") {
    try {
      return JSON.parse(result) as unknown;
    } catch {
      return null;
    }
  }
  if (result && typeof result === "object" && "content" in result) {
    const content = (result as { content?: Array<{ text?: string }> }).content;
    const text = content?.map((block) => block.text ?? "").join("\n") ?? "";
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return null;
    }
  }
  return result;
}
