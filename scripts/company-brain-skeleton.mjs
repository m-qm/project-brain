#!/usr/bin/env node
/**
 * Post-gate spike: scaffold Company Brain Pack folder layout (empty templates).
 * Usage: node scripts/company-brain-skeleton.mjs ./my-repo
 * Does not replace brain setup; merges alongside existing brain/ if present.
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const target = process.argv[2];
if (!target) {
  console.error("Usage: node scripts/company-brain-skeleton.mjs <repo-root>");
  process.exit(1);
}

const brain = join(target, "brain");
const files = {
  "facts/marketing.md": "# Marketing facts\n\n## ICP\n\n[CONFIRM]\n\n## Offers\n\n## Voice\n\n## Claims not to quote as guarantees\n\n",
  "facts/sales.md": "# Sales facts\n\n## Pipeline stages\n\n## Objections\n\n## Handoff to ops\n\n",
  "facts/operations.md": "# Operations facts\n\n## SLAs\n\n## Tools\n\n## Escalation\n\n",
  "facts/fulfillment.md": "# Fulfillment facts\n\n## Delivery steps\n\n## QA\n\n## Support boundaries\n\n",
  "stories/marketing-narrative.md": "# Marketing narrative\n\n## Problem\n\n## Positioning\n\n",
  "stories/sales-motion.md": "# Sales motion\n\n",
  "stories/delivery-flow.md": "# Delivery flow\n\n",
  "work-logs/README.md":
    "# Work logs\n\nAppend-only dated notes. Agents may add entries; do not rewrite files under facts/.\n",
  "work-logs/TEMPLATE.md":
    "# YYYY-MM-DD · author\n\n## Summary\n\n## Decisions\n\n## Open follow-ups\n\n",
};

for (const [rel, content] of Object.entries(files)) {
  const path = join(brain, rel);
  if (existsSync(path)) {
    console.log("skip (exists):", rel);
    continue;
  }
  mkdirSync(join(brain, rel.split("/").slice(0, -1).join("/")), { recursive: true });
  writeFileSync(path, content);
  console.log("wrote:", rel);
}

console.log("\nNext: fill facts, run brain validate when --company exists. See docs/COMPANY-BRAIN-SCOPE.md");
