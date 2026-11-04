export type EvalCheck = "offer" | "proof" | "title" | "sources" | "cta" | "all";

export type DraftEvalIssue = {
  check: 1 | 2 | 3 | 4 | 5;
  code: string;
  detail: string;
  amounts?: string[];
};

export type DraftEvalResult = {
  ok: boolean;
  title: string;
  issues: DraftEvalIssue[];
};

export const PRICE_RE =
  /(?:from|desde|a partir de)\s*€?\s*(\d+(?:[.,]\d+)*)\s*€?|€\s*(\d+(?:[.,]\d+)*)|(\d+(?:[.,]\d+)*)\s*€/gi;

const EXAMPLE_RE =
  /\b(example|ejemplo|realistic example|ejemplo realista|says|dice|said|dijo|invent|invente|invents|invented|se lo invent|false|falso|falsos|do not exist|no existen|on request|a consultar|the draft|el borrador|the article|el art[ií]culo)\b/i;

const BUILDER_TITLE_RE = /\b(MCP|RAG|LLM|agente de IA|AI agent|what is an agent)\b/i;

const PROOF_RE =
  /\b(top on Google|#\s*1|n[uú]mero\s*1|n[oº]\s*1|ROAS|\d+\s+clients|\d+\s+clientes|\d+\s+visitas|\d+\s+visits|traffic of \d+|posiciones en Google)\b/i;

const UNSAFE_CTA_RE =
  /\b(invoice|invoices|factura|facturas|password|contrase[nñ]a|upload invoices|m[oó]vil personal|tel[eé]fono personal|personal (phone|mobile)|whatsapp me at)\b|\+\d{2}\s*\d{3}|\b[67]\d{2}\s?\d{3}\s?\d{3}\b/i;

const NEGATION_RE = /\b(never|nunca|not |no |ni |do not|don't|must not|sin )\b/i;

export function splitSentences(text: string): string[] {
  return String(text)
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function normalizeAmount(raw: string): string {
  return String(raw).replace(/[^\d]/g, "");
}

export type PriceHit = {
  sentence: string;
  amounts: string[];
  example: boolean;
};

export function priceHits(text: string): PriceHit[] {
  const hits: PriceHit[] = [];
  for (const sentence of splitSentences(text)) {
    const amounts: string[] = [];
    const re = new RegExp(PRICE_RE.source, PRICE_RE.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(sentence))) {
      const raw = m[1] ?? m[2] ?? m[3];
      if (raw) amounts.push(normalizeAmount(raw));
    }
    if (amounts.length === 0) continue;
    hits.push({
      sentence,
      amounts,
      example: EXAMPLE_RE.test(sentence),
    });
  }
  return hits;
}

export function allowedAmounts(factsText: string): Set<string> {
  const set = new Set<string>();
  for (const hit of priceHits(factsText)) {
    for (const amount of hit.amounts) set.add(amount);
  }
  return set;
}

export function inventedPrices(draft: string, factsText: string): PriceHit[] {
  const allowed = allowedAmounts(factsText);
  return priceHits(draft).filter(
    (hit) => !hit.example && hit.amounts.some((amount) => !allowed.has(amount)),
  );
}

function titleFrom(draft: string, explicitTitle?: string): string {
  if (explicitTitle) return explicitTitle;
  const h1 = String(draft).match(/^#\s+(.+)$/m);
  return h1?.[1]?.trim() ?? "";
}

export function hasSources(draft: string): boolean {
  return /##\s+(Sources|Fuentes)\b/i.test(draft) && /brain\/|https?:\/\//i.test(draft);
}

function wants(checks: EvalCheck | EvalCheck[] | undefined, name: Exclude<EvalCheck, "all">): boolean {
  const list = checks === undefined ? ["offer"] : Array.isArray(checks) ? checks : [checks];
  return list.includes("all") || list.includes(name);
}

export function evalDraft(input: {
  draft: string;
  facts: string;
  title?: string;
  checks?: EvalCheck | EvalCheck[];
}): DraftEvalResult {
  const draft = input.draft;
  const factsText = input.facts;
  const title = titleFrom(draft, input.title);
  const issues: DraftEvalIssue[] = [];

  if (wants(input.checks, "title")) {
    if (BUILDER_TITLE_RE.test(title.replace(/Agent KBase/gi, ""))) {
      issues.push({ check: 1, code: "builder_title", detail: title });
    }
  }

  if (wants(input.checks, "offer")) {
    for (const hit of inventedPrices(draft, factsText)) {
      issues.push({
        check: 2,
        code: "invented_price",
        detail: hit.sentence,
        amounts: hit.amounts,
      });
    }
  }

  if (wants(input.checks, "proof")) {
    const proofSentence = splitSentences(draft).find(
      (s) => PROOF_RE.test(s) && !EXAMPLE_RE.test(s) && !NEGATION_RE.test(s),
    );
    const proofInFacts = splitSentences(factsText).some(
      (s) => PROOF_RE.test(s) && !EXAMPLE_RE.test(s) && !NEGATION_RE.test(s),
    );
    if (proofSentence && !proofInFacts) {
      issues.push({ check: 3, code: "invented_proof", detail: proofSentence });
    }
  }

  if (wants(input.checks, "sources") && !hasSources(draft)) {
    issues.push({
      check: 4,
      code: "missing_sources",
      detail: "no Sources/Fuentes with a path or URL",
    });
  }

  if (wants(input.checks, "cta")) {
    const badCta = splitSentences(draft).find(
      (s) => UNSAFE_CTA_RE.test(s) && !NEGATION_RE.test(s) && !EXAMPLE_RE.test(s),
    );
    if (badCta) {
      issues.push({ check: 5, code: "unsafe_cta", detail: badCta });
    }
  }

  return { ok: issues.length === 0, title, issues };
}

export function evalLinkedInCaption(input: {
  caption: string;
  article: string;
  facts: string;
}): DraftEvalResult {
  const extra = inventedPrices(input.caption, `${input.facts}\n${input.article}`);
  const issues: DraftEvalIssue[] = extra.map((hit) => ({
    check: 2,
    code: "linkedin_new_price",
    detail: hit.sentence,
    amounts: hit.amounts,
  }));
  const badCta = splitSentences(input.caption).find(
    (s) => UNSAFE_CTA_RE.test(s) && !NEGATION_RE.test(s) && !EXAMPLE_RE.test(s),
  );
  if (badCta) {
    issues.push({ check: 5, code: "unsafe_cta", detail: badCta });
  }
  return { ok: issues.length === 0, title: "", issues };
}
