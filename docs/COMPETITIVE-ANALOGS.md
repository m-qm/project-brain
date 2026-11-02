# Competitive and analog scan (Agent KBase monetization)

Short memo for positioning paid **Company Brain Pack** vs alternatives. Not a formal market study; refresh quarterly.

## Positioning line

**Agent KBase:** curated **ground truth in git** with validation for Cursor agents. Not a hosted wiki, not a generic prompt library.

## Analog categories

| Category | Examples | What they sell | Gap Agent KBase fills |
|----------|----------|----------------|------------------------|
| **Cursor rules / skills marketplaces** | Cursor directory, SkillTree, community skills repos | How to work (recipes) | What is true (facts, boundaries) |
| **“Second brain” Notion templates** | Notion AI packs, PARA templates | Hosted notes, backlinks | Repo-native, versioned, agent `AGENTS.md` routing |
| **AI readiness / audit consulting** | SkillTree full-stack audits, agency “AI strategy” | Human report + roadmap | Executable `brain/` customer owns post-engagement |
| **Open source KB / docs in repo** | ADRs, `docs/` only, Backstage | Static documentation | Structured facts vs stories vs gaps; export gate |
| **RAG / vector SaaS** | Custom GPT, Pinecone wrappers | Retrieval over uploads | Low ceremony git; no vendor lock for truth |
| **DevOps / platform catalogs** | Backstage, Cortex | Service metadata | Product GTM + ops narrative for **vibecoder SaaS**, not microservices only |

## SkillTree relationship (same funnel)

| Layer | SkillTree | Agent KBase OSS | Company Brain Pack (paid) |
|-------|-----------|-----------------|----------------------------|
| Role | Audit + skills | Starter map + zip | Multi-department validated pack |
| Monetization | Paid audit (existing) | Free OSS | One-time pack + DFY upsell |
| Deliverable | Report + skill connect | `brain.zip` | Extended layout per [COMPANY-BRAIN-SCOPE.md](COMPANY-BRAIN-SCOPE.md) |

**Message:** SkillTree shows what is broken; Agent KBase holds what is true; Pack turns audit into durable repo files.

## Differentiation to stress in sales

1. **Validation before export** — reduces agent hallucination surface.
2. **Open questions file** — explicit unknowns instead of silent invention.
3. **Engram optional** — memory across chats without replacing git truth.
4. **No shared LLM key on public site** — paid LLM via CLI or private deploy (trust + abuse).

## Risks from analogs

| Risk | Mitigation |
|------|------------|
| “I can prompt my way there” | Demo one `[CONFIRM]` failure from URL-only extract |
| Notion “good enough” | Emphasize git PR review of facts, CI validate hook |
| Pack piracy | Pair self-serve pack with office hours or DFY for high ARPU |
| Hosted competitors add git export | Move faster on pack + SkillTree bundle |

## Pricing references (public, approximate)

Use only as anchors in interviews, not claims:

* Notion template bundles: often **$20–80** one-time.
* Niche course + templates: **$100–300**.
* Small consulting “AI setup”: **$500–3,000** fixed.
* SkillTree audits: internal pricing drives DFY floor.

## Conclusion for v1

Compete on **git-native company truth + SkillTree funnel**, not on hosted LLM wizard. First paid SKU should be **digital pack + DFY upsell**, not subscription SaaS.
