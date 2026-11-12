import { loadBrain } from "./src/mcp/read-brain.ts";
import { runReview } from "./src/reviews/run-review.ts";
import { sampleReviews } from "./src/reviews/fixtures.ts";
import { agentkbaseMcp } from "./src/mcp/agentkbase.ts";

const brain = await loadBrain();
const results = [];
for (const review of sampleReviews) {
  const result = await runReview(review, {
    brief: brain.brief,
    evalDraft: brain.evalDraft,
    approved: false,
    google: null,
  });
  results.push({
    author: result.review.author,
    rating: result.review.rating,
    status: result.status,
    posted: result.posted,
    reply: result.reply ?? null,
    reason: result.reason ?? null,
    note: result.note,
  });
}

const briefHead = brain.brief.split("\n").find((line) => line.includes("Taskflow")) ?? "brief loaded";
console.log(JSON.stringify({ briefHead, tools: "mastra MCPClient → local @agentkbase/mcp", results }, null, 2));
await agentkbaseMcp.disconnect();
