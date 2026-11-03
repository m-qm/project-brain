#!/usr/bin/env node
/**
 * Local HITL loop for the two workers. Does not call Instagram or Meta Ads.
 *
 *   node workers/run.mjs article
 *   node workers/run.mjs linkedin
 *   node workers/run.mjs status
 *   node workers/run.mjs approve <id>
 *   node workers/run.mjs reject <id>
 *   node workers/run.mjs publish
 *
 * Instagram / ads remain as later formats of an approved article.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  BRAIN,
  INSIGHTS,
  findItem,
  listStage,
  moveItem,
  nextUnusedDay,
  parseArticleSlate,
  parseCannedPosts,
  readBrainBundle,
  usedArticleIds,
  usedDays,
  writeItem,
} from "./lib.mjs";

const cmd = process.argv[2] ?? "status";
const arg = process.argv[3];

function printItem(item) {
  const title = item.title ?? item.id;
  console.log(`  ${item.id}  [${item.agent}]  ${title}`);
}

async function status() {
  for (const stage of ["pending", "approved", "published", "rejected"]) {
    const items = await listStage(stage);
    console.log(`${stage} (${items.length})`);
    items.forEach(printItem);
    if (items.length === 0) console.log("  (empty)");
  }
}

async function review() {
  const id = arg;
  if (!id) throw new Error("usage: node workers/run.mjs review <id>");
  const found = await findItem(id);
  if (!found) throw new Error(`Unknown item: ${id}`);
  const checklist = await readFile(join(BRAIN, "content/review-checklist.md"), "utf8");
  console.log(`Review ${found.item.id}  [${found.stage}]  ${found.item.title ?? ""}`);
  console.log(`Query: ${found.item.query ?? "(none)"}`);
  console.log("");
  console.log(checklist);
  console.log("If all five are yes: node workers/run.mjs approve " + id);
}

async function article() {
  await readBrainBundle();
  const slate = parseArticleSlate(await readFile(join(BRAIN, "content/article-slate.md"), "utf8"));
  const used = await usedArticleIds();
  const next = slate.find((a) => a.id && !used.has(a.id));
  if (!next) {
    console.log("No unused articles on the slate.");
    return;
  }
  const body = await readFile(join(BRAIN, "content", next.file), "utf8");
  const item = await writeItem("pending", {
    id: next.id,
    agent: "article",
    title: next.title,
    query: next.query,
    file: next.file,
    slug: next.slug,
    body_md: body,
    sources: [
      "brain/facts/project.md",
      "brain/facts/brand-guardrails.md",
      "brain/facts/connectors.md",
      "brain/content/review-checklist.md",
    ],
    quality: {
      human_required: true,
      checklist: "brain/content/review-checklist.md",
      duplicate_check: "manual",
      no_invented_metrics: true,
    },
    would_publish_to: "agentkbase.com/blog (not copied until a human adds it to the site)",
    created_at: new Date().toISOString(),
  });
  console.log(`Article worker queued ${item.id} as pending.`);
  console.log(`Read: brain/content/${next.file}`);
  console.log(`Approve: node workers/run.mjs approve ${item.id}`);
}

async function linkedin() {
  const published = (await listStage("published")).filter((i) => i.agent === "article");
  if (published.length === 0) {
    console.log("LinkedIn worker idle: no published article. Run article → approve → publish first.");
    return;
  }
  let queued = 0;
  for (const articleItem of published) {
    const id = `li-${articleItem.id}`;
    const existing = await findItem(id);
    if (existing) continue;
    let en = "";
    let es = "";
    const liRel = (articleItem.file ?? "").replace("articles/", "linkedin/");
    try {
      const li = await readFile(join(BRAIN, "content", liRel), "utf8");
      en = li.split("## EN")[1]?.split("## ES")[0]?.trim() ?? "";
      es = li.split("## ES")[1]?.trim() ?? "";
    } catch {
      en = articleItem.title;
    }
    await writeItem("pending", {
      id,
      agent: "linkedin",
      source_article_id: articleItem.id,
      title: `LinkedIn: ${articleItem.title}`,
      caption_en: en,
      caption_es: es,
      would_publish_to: "LinkedIn (not sent; draft only)",
      created_at: new Date().toISOString(),
    });
    console.log(`LinkedIn worker queued ${id} as pending.`);
    console.log(`Approve: node workers/run.mjs approve ${id}`);
    queued += 1;
  }
  if (queued === 0) {
    console.log("LinkedIn worker idle: every published article already has a draft.");
  }
}

async function ig() {
  const md = await readFile(join(BRAIN, "content/posts-01-to-05.md"), "utf8");
  const canned = parseCannedPosts(md);
  const used = await usedDays();
  const next = nextUnusedDay(canned, used);
  if (!next) {
    console.log("No unused canned posts. Days 1–5 are already in the queue.");
    console.log("Add copy for days 6–14 in the brain, or approve/publish what is pending.");
    return;
  }
  await readBrainBundle();
  const id = `ig-d${String(next.day).padStart(2, "0")}`;
  const item = await writeItem("pending", {
    id,
    agent: "instagram",
    day: next.day,
    format: next.format,
    title: next.title,
    caption_es: next.caption_es,
    caption_en: next.caption_en,
    visual: next.visual,
    cta: "https://agentkbase.com/company-brain",
    source: "brain/content/posts-01-to-05.md",
    would_publish_to: "instagram (not sent; local queue only)",
    created_at: new Date().toISOString(),
  });
  console.log(`Instagram worker queued ${item.id} as pending.`);
  console.log(`Approve: node workers/run.mjs approve ${item.id}`);
}

async function ads() {
  const published = (await listStage("published")).filter((i) => i.agent === "instagram");
  if (published.length === 0) {
    console.log("Ads worker idle: nothing published yet. Run ig → approve → publish first.");
    return;
  }
  const winners = [];
  for (const post of published) {
    try {
      const insight = JSON.parse(await readFile(join(INSIGHTS, `${post.id}.json`), "utf8"));
      const winner = insight.winner === true || Number(insight.saves) >= 10;
      if (winner) winners.push({ post, insight });
    } catch {
      // no insights file
    }
  }
  if (winners.length === 0) {
    console.log("Ads worker idle: no winners. Add insights/<id>.json with saves >= 10 or winner: true.");
    console.log("Example: insights/ig-d01.json  { \"saves\": 12, \"winner\": true }");
    return;
  }
  const { post, insight } = winners[0];
  const id = `ads-${post.id}`;
  const existing = await findItem(id);
  if (existing) {
    console.log(`Ads draft already exists as ${existing.stage}/${id}.`);
    return;
  }
  const item = await writeItem("pending", {
    id,
    agent: "ads",
    source_post_id: post.id,
    title: `Boost: ${post.title}`,
    caption_es: post.caption_es,
    caption_en: post.caption_en,
    budget_cap_eur: 5,
    kill_rule: "Pause if spend hits the cap with no conversations.",
    insight,
    would_launch_to: "Meta Ads (not sent; draft only)",
    created_at: new Date().toISOString(),
  });
  console.log(`Ads worker queued ${item.id} as pending (cap €5, client ad account, no auto-launch).`);
  console.log(`Approve: node workers/run.mjs approve ${item.id}`);
}

async function publish() {
  const approved = await listStage("approved");
  if (approved.length === 0) {
    console.log("Nothing approved.");
    return;
  }
  for (const item of approved) {
    await moveItem(item.id, "published");
    if (item.agent === "article") {
      console.log(`Published locally: ${item.id} (site copy still needs a human on /blog).`);
    } else if (item.agent === "linkedin") {
      console.log(`LinkedIn draft marked published locally: ${item.id} (not posted).`);
    } else if (item.agent === "instagram") {
      console.log(`Published locally: ${item.id} (no Instagram API call).`);
    } else {
      console.log(`Marked published locally: ${item.id}.`);
    }
  }
}

async function main() {
  if (cmd === "review") return review();
  if (cmd === "article") return article();
  if (cmd === "linkedin") return linkedin();
  if (cmd === "ig") return ig();
  if (cmd === "ads") return ads();
  if (cmd === "status") return status();
  if (cmd === "approve") {
    if (!arg) throw new Error("usage: node workers/run.mjs approve <id>");
    const item = await moveItem(arg, "approved");
    console.log(`Approved ${item.id}. Checklist was required. Publish: node workers/run.mjs publish`);
    return;
  }
  if (cmd === "reject") {
    if (!arg) throw new Error("usage: node workers/run.mjs reject <id>");
    const item = await moveItem(arg, "rejected");
    console.log(`Rejected ${item.id}.`);
    return;
  }
  if (cmd === "publish") return publish();
  throw new Error(`Unknown command: ${cmd}`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
