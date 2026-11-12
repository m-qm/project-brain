# Indexing Phase 1 (dogfood)

## Problem

Agents working on the monorepo need one searchable place for product truth without reading every learn article as fact.

## What we built

* Curated `brain/facts/*.md` for mission, distribution, and limits.
* `brain/stories/learn/` — **mirror** of public learn guides via `scripts/sync-learn-stories.mjs` (reference + `brain_search`, not canonical).
* Remote MCP and eval APIs documented in `brain/facts/distribution.md`.

## How we know it works

Run from repo root:

```bash
node scripts/sync-learn-stories.mjs
pnpm brain validate --dir .
pnpm brain brief --dir .
```

## Phase 2 (shipped in core)

* **`buildClaimsIndex`** — bullets in `brain/facts/` + `open-questions.md` → claims with `status`, `section`, path, line.
* **`searchBrainWithClaims`** — `brain_search` / MCP: ranked `claims` first, then substring hits in all `brain/`.
* **`brain validate`** warns if zero claims parse from facts.

Not yet: embeddings, drift report (re-scan site vs facts), persisted `.agentkbase/claims.json`.
