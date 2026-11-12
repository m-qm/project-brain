<!-- SYNCED from apps/web/public — run: node scripts/sync-learn-stories.mjs -->
<!-- Not ground truth. Distill claims into brain/facts/ before agents state them as fact. -->

# Facts vs stories vs decisions

## Facts (`brain/facts/`)

Checkable statements: stack, URLs, what shipped, what is out of scope. Update when truth changes.

## Stories (`brain/stories/`)

Narratives for interviews, onboarding, and agents explaining *how* something works and *how you know* it works.

## Decisions (optional `brain/decisions/`)

Short ADRs: choice, reason, date. Link from facts when a fact depends on a decision.

## Anti pattern

Do not put hype or roadmap wishes in facts. If it is not true today, use open questions or a story draft marked draft.
