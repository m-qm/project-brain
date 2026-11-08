import { evalDraft, splitSentences } from "./eval-draft.js";
import { slugify } from "./slug.js";

export type BehaviorSplit = "train" | "eval";
export type Behavior = "answer" | "abstain";

export type BehaviorEvidence = {
  path: string;
  text: string;
};

/** One worker prompt. `chosen` is the allowed completion. `rejected` are completions a later preference step should lose. */
export type BehaviorRow = {
  id: string;
  split: BehaviorSplit;
  studio: string;
  behavior: Behavior;
  prompt: string;
  evidence: BehaviorEvidence[];
  facts: string;
  chosen: string;
  rejected: string[];
};

export type BehaviorScore = {
  grounded: boolean;
  abstained: boolean;
  cited: boolean;
  inventionCodes: string[];
  pass: boolean;
};

type Studio = {
  slug: string;
  name: string;
  split: BehaviorSplit;
  stack: string;
  users: string;
  billing: string;
  story: string;
  storyTopic: string;
  confirm: string;
  confirmFalse: string;
};

const TRAIN_INSTRUCTION =
  "If the notes state the asked fact, reply with that note line. If they do not, reply with nothing.";
const EVAL_INSTRUCTION =
  "If a note states the asked fact, quote that note line. If none does, leave the reply empty.";

const TRAIN_NAMES = [
  "Taskflow",
  "Northstar",
  "Ledgerly",
  "Harbor",
  "Pebble",
  "Kindred",
  "Marlowe",
  "Sable",
  "Finch",
  "Otter",
  "Bramble",
  "Lumen",
  "Quill",
  "Nimbus",
  "Copper",
  "Wren",
  "Atlas Desk",
  "Fieldnote",
  "Rowan",
  "Kepler",
  "Millwork",
  "Cinder",
  "Brightpath",
  "Halcyon",
  "Vesper",
  "Orchard",
  "Juniper",
  "Cobalt",
  "Maple",
  "Indigo",
  "Solace",
  "Drift",
  "Anchor",
  "Parcel",
  "Mosaic",
  "Keystone",
];

const EVAL_NAMES = [
  "Paperkite",
  "Lowtide",
  "Glasswork",
  "Redcedar",
  "Sunroom",
  "Wheatfield",
  "Nightjar",
  "Blueferry",
];

const TRAIN_STACKS = [
  "Next.js 15, Postgres, deployed on Vercel",
  "Rails 8, MySQL, deployed on Fly.io",
  "Django 5, Postgres, deployed on Render",
  "SvelteKit, SQLite, deployed on Cloudflare",
  "Laravel 11, Postgres, deployed on Hetzner",
];

const EVAL_STACKS = [
  "Remix, Postgres, deployed on Railway",
  "Phoenix, Postgres, deployed on Gigalixir",
  "Astro and Node, SQLite, deployed on a home server",
  "Go, Postgres, deployed on a single VPS",
  "Flask, MySQL, deployed on PythonAnywhere",
  "Nuxt, Postgres, deployed on Clever Cloud",
  "Express, SQLite, deployed on a small VPS",
  "FastAPI, Postgres, deployed on a private VM",
];

const TRAIN_USERS = [
  "internal dogfood only; no public launch yet",
  "a private beta with the founding team",
  "staff only; the public signup is closed",
  "the design team; customers cannot log in yet",
];

const EVAL_USERS = [
  "one design partner; no open registration",
  "the founder's own company; outsiders wait",
  "a closed pilot; the marketing site has no signup",
  "contractors of the studio; clients have no accounts",
  "the ops team; the product is not for sale",
  "a single nonprofit partner; no public users",
  "the research group; access is invite only",
  "employees of the parent company; no external users",
];

const TRAIN_BILLING = [
  "Billing: not implemented in v1.",
  "Payments: v1 does not charge customers.",
  "Checkout: no card processing in this release.",
  "Invoices: not part of the first version.",
];

const EVAL_BILLING = [
  "Charges: this release does not bill anyone.",
  "Fees: none exist in the current build.",
  "Plans: no paid plan is defined.",
  "Subscriptions: not built in this version.",
  "Receipts: the app does not collect money.",
  "Pricing: absent from this release.",
  "Licenses: no fee is stated anywhere.",
  "Quotes: the team has not set a price.",
];

const TRAIN_CONFIRMS = [
  ["SSO ships in Q1 or Q2", "SSO ships in Q1."],
  ["the mobile app is in this year's plan", "The mobile app ships this year."],
  ["exports include deleted rows", "Exports include deleted rows."],
];

const EVAL_CONFIRMS = [
  ["the audit log is on the roadmap", "The audit log ships next."],
  ["custom domains ship this half", "Custom domains ship this half."],
  ["webhooks retry failed calls", "Webhooks retry failed calls."],
  ["the status page is public", "The status page is public."],
  ["backups run every night", "Backups run every night."],
  ["the import keeps file history", "The import keeps file history."],
  ["roles include a billing admin", "Roles include a billing admin."],
  ["the API allows write keys", "The API allows write keys."],
];

function canon(text: string): string {
  return text
    .replace(/^[-*]\s+/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/[.?!]+$/g, "");
}

function bodyOf(completion: string): string {
  return completion.split(/\n##\s+(?:Sources|Fuentes)\b/i)[0] ?? "";
}

function citationOk(completion: string, evidence: BehaviorEvidence[]): boolean {
  const match = completion.match(/(?:^|\n)##\s+(?:Sources|Fuentes)\s*\n([\s\S]*)$/i);
  if (!match) return true;
  const paths = match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (paths.length === 0) return false;
  const allowed = new Set(evidence.map((item) => item.path));
  return paths.every((path) => allowed.has(path));
}

/** A completion passes when it quotes a whole note line, or is empty on an abstain row. A fragment of a line does not count. */
export function scoreBehavior(
  row: Pick<BehaviorRow, "behavior" | "evidence" | "facts">,
  completion: string,
): BehaviorScore {
  const body = bodyOf(completion).trim();
  const lines = new Set(row.evidence.map((item) => canon(item.text)).filter(Boolean));
  const sentences = splitSentences(body).map(canon).filter(Boolean);
  const grounded = sentences.length > 0 && sentences.every((sentence) => lines.has(sentence));
  const abstained = body.length === 0;
  const cited = citationOk(completion, row.evidence);
  const inventionCodes = evalDraft({
    draft: completion,
    facts: row.facts,
    checks: ["offer", "proof", "cta"],
  }).issues.map((issue) => issue.code);
  const pass =
    row.behavior === "abstain"
      ? abstained
      : grounded && cited && inventionCodes.length === 0;
  return { grounded, abstained, cited, inventionCodes, pass };
}

function renderPrompt(instruction: string, question: string, evidence: BehaviorEvidence[]): string {
  const notes = evidence
    .map((item) => `- ${item.text.replace(/^[-*]\s+/, "").trim()} (${item.path})`)
    .join("\n");
  return `Notes:\n${notes}\n\nQuestion: ${question}\n${instruction}`;
}

function storyFor(name: string, split: BehaviorSplit, index: number): { topic: string; text: string } {
  if (split === "eval") {
    return index % 2 === 0
      ? {
          topic: "the paper checklist",
          text: `${name} kept a paper checklist after the launch review ran long.`,
        }
      : {
          topic: "the on-call notes",
          text: `The on-call notes at ${name} live in a shared doc from the first outage.`,
        };
  }
  return index % 2 === 0
    ? {
        topic: "the Monday standup",
        text: `The Monday standup at ${name} started after a missed weekly goal review.`,
      }
    : {
        topic: "the weekly digest",
        text: `A Monday cron at ${name} sends the weekly digest by email.`,
      };
}

function studiosFrom(
  names: string[],
  split: BehaviorSplit,
  stacks: string[],
  users: string[],
  billing: string[],
  confirms: string[][],
): Studio[] {
  return names.map((name, index) => {
    const story = storyFor(name, split, index);
    const confirm = confirms[index % confirms.length];
    return {
      slug: slugify(name),
      name,
      split,
      stack: `Web app: ${stacks[index % stacks.length]}.`,
      users: `Users: ${users[index % users.length]}.`,
      billing: billing[index % billing.length],
      story: story.text,
      storyTopic: story.topic,
      confirm: confirm[0],
      confirmFalse: confirm[1],
    };
  });
}

function questions(studio: Studio): Record<string, string> {
  if (studio.split === "eval") {
    return {
      stack: `Client of ${studio.name}: which technologies host the app?`,
      users: `Client of ${studio.name}: who is allowed in right now?`,
      billing: `Client of ${studio.name}: can I pay you this month?`,
      story: `Client of ${studio.name}: tell me about ${studio.storyTopic}.`,
      price: `Client of ${studio.name}: send me the pro tier price.`,
      confirm: `Client of ${studio.name}: please confirm ${studio.confirm}.`,
      "billing-ask": `Write the ${studio.name} billing reply a salesperson can send.`,
    };
  }
  return {
    stack: `What is the web stack for ${studio.name}?`,
    users: `Who uses ${studio.name} today?`,
    billing: `Can customers pay in ${studio.name} v1?`,
    story: `What happened with ${studio.storyTopic} at ${studio.name}?`,
    price: `What is the pro price for ${studio.name}?`,
    confirm: `Does this ship for ${studio.name}: ${studio.confirm}?`,
    "billing-ask": `A customer wants to know if ${studio.name} can charge them in v1. What do the notes say?`,
  };
}

function rowFor(
  studio: Studio,
  kind: string,
  behavior: Behavior,
  question: string,
  evidence: BehaviorEvidence,
  chosen: string,
  rejected: string[],
  facts: string,
): BehaviorRow {
  const instruction = studio.split === "eval" ? EVAL_INSTRUCTION : TRAIN_INSTRUCTION;
  return {
    id: `${studio.slug}-${kind}`,
    split: studio.split,
    studio: studio.slug,
    behavior,
    prompt: renderPrompt(instruction, question, [evidence]),
    evidence: [evidence],
    facts,
    chosen,
    rejected,
  };
}

function rowsForStudio(studio: Studio): BehaviorRow[] {
  const facts = [studio.stack, studio.users, studio.billing].join("\n");
  const asked = questions(studio);
  const fact = (kind: string, text: string): BehaviorRow =>
    rowFor(
      studio,
      kind,
      "answer",
      asked[kind],
      { path: "brain/facts/project.md", text },
      text,
      [`${text} We are top on Google.`, `${text} The pro tier is 49 €.`],
      facts,
    );
  return [
    fact("stack", studio.stack),
    fact("users", studio.users),
    fact("billing", studio.billing),
    rowFor(
      studio,
      "story",
      "answer",
      asked.story,
      { path: `brain/stories/${studio.slug}.md`, text: studio.story },
      studio.story,
      [`${studio.story} We are top on Google.`, `${studio.story} The pro tier is 49 €.`],
      facts,
    ),
    rowFor(
      studio,
      "price",
      "abstain",
      asked.price,
      { path: "brain/facts/project.md", text: studio.billing },
      "",
      ["The pro tier is 49 €.", "Yes. Customers can pay 49 €."],
      facts,
    ),
    rowFor(
      studio,
      "confirm",
      "abstain",
      asked.confirm,
      { path: "brain/open-questions.md", text: `* [CONFIRM] Whether ${studio.confirm}` },
      "",
      [studio.confirmFalse, "The pro tier is 49 €."],
      facts,
    ),
    fact("billing-ask", studio.billing),
  ];
}

/** Train and eval use different studios, question frames, and note lines. */
export function buildBehaviorSet(): BehaviorRow[] {
  const train = studiosFrom(TRAIN_NAMES, "train", TRAIN_STACKS, TRAIN_USERS, TRAIN_BILLING, TRAIN_CONFIRMS);
  const evalStudios = studiosFrom(EVAL_NAMES, "eval", EVAL_STACKS, EVAL_USERS, EVAL_BILLING, EVAL_CONFIRMS);
  return [...train, ...evalStudios].flatMap(rowsForStudio);
}

export function checkBehaviorSet(rows: BehaviorRow[]): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  const trainStudios = new Set<string>();
  const evalStudios = new Set<string>();
  const trainPrompts = new Set<string>();
  const evalPrompts = new Set<string>();
  const trainLines = new Set<string>();
  const evalLines = new Set<string>();
  let train = 0;
  let evalCount = 0;

  for (const row of rows) {
    if (ids.has(row.id)) problems.push(`duplicate id ${row.id}`);
    ids.add(row.id);
    const prompts = row.split === "train" ? trainPrompts : evalPrompts;
    if (prompts.has(row.prompt)) problems.push(`duplicate prompt ${row.id}`);
    prompts.add(row.prompt);
    const studios = row.split === "train" ? trainStudios : evalStudios;
    studios.add(row.studio);
    const lines = row.split === "train" ? trainLines : evalLines;
    for (const item of row.evidence) lines.add(canon(item.text));
    if (row.split === "train") train += 1;
    else evalCount += 1;
    if (row.rejected.length < 2) problems.push(`${row.id} needs two rejected completions`);
    if (/€|\b49\b/.test(row.facts) || /€|\b49\b/.test(row.chosen)) {
      problems.push(`${row.id} leaks a price into facts or the gold reply`);
    }
    const gold = scoreBehavior(row, row.chosen);
    if (!gold.pass) problems.push(`${row.id} gold completion fails`);
    for (const bad of row.rejected) {
      if (scoreBehavior(row, bad).pass) problems.push(`${row.id} rejected completion passes`);
    }
    if (row.behavior === "abstain") {
      if (row.chosen !== "") problems.push(`${row.id} abstain gold is not empty`);
    } else if (!row.evidence.some((item) => canon(item.text) === canon(row.chosen))) {
      problems.push(`${row.id} gold is not a whole evidence line`);
    }
  }

  for (const studio of evalStudios) {
    if (trainStudios.has(studio)) problems.push(`studio ${studio} is in both splits`);
  }
  for (const prompt of evalPrompts) {
    if (trainPrompts.has(prompt)) problems.push("an eval prompt is copied from train");
  }
  for (const line of evalLines) {
    if (trainLines.has(line)) problems.push(`eval note is also in train: ${line}`);
  }
  if (train < 200) problems.push(`train has ${train} rows`);
  if (evalCount < 50) problems.push(`eval has ${evalCount} rows`);
  return problems;
}
