# Agent instructions — Agent KBase (monorepo)

You are working on **Agent KBase** (`m-qm/project-brain`): open-source business truth in `brain/`, CLI, web wizard, read-only MCP, and optional remote MCP on the site.

## Before you act

Read, in order:

1. `brain/facts/project.md`
2. `brain/facts/distribution.md` and `brain/facts/offer-limits.md`
3. `brain/open-questions.md` — do not guess answers; use `[CONFIRM]` in drafts
4. Relevant `brain/stories/` (including `brain/stories/learn/` as reference docs — not facts until distilled into `facts/`)

## Rules

* Do not state prices, SLAs, rankings, or customer outcomes not listed in `brain/facts/`.
* Public marketing copy must pass the same bar as customers: `brain eval` / company-brain five checks.
* Git is the write path for product truth. MCP does not write `brain/`. Remote hosted profiles export to wizard/`brain.zip`.
* Operator strategy (competitors, pricing experiments) lives outside this repo; do not present it as shipped product.

## Commands

```bash
pnpm brain validate --dir .
pnpm brain brief --dir .
pnpm brain claims --dir .          # Phase 2: parsed fact bullets
pnpm brain search "remote MCP" --dir .
pnpm brain ask "Is OAuth shipped?" --dir .   # plan, evidence, gaps, loops (JSON)
pnpm brain eval --dir . --text "draft..."
```

## Sync learn guides into stories

```bash
node scripts/sync-learn-stories.mjs
```

Copies public learn markdown into `brain/stories/learn/` for search; facts stay in `brain/facts/`.
