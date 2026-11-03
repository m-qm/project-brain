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
| **Agent runtime + memory platforms** | [MIOSA](https://miosa.ai/), [OSA](https://osa.dev/), [Optimal Engine](https://www.miosa.ai/docs/optimal-engine) | Sandboxes, deploy, managed memory/RAG | **Company truth in git** (GTM/ops departments), SkillTree audit handoff, validate export |

## MIOSA / Optimal Engine (March 2026 scan)

**What they are:** Three-layer stack from the same ecosystem.

| Layer | Product | Positioning | Typical monetization |
|-------|---------|-------------|----------------------|
| Intelligence | **OSA** (Apache 2.0 terminal agent) | Harness, skills, `~/.osa/`, native memory, MCP | Free OSS → “Start on Miosa” |
| Compute | **MIOSA** | Sandboxes, desktops, App Engine, BYOK + hosted models | **$0** ($1/mo usage) → **$20** → **$500** → **$2,000**/mo (credits) |
| Memory | **Optimal Engine** | Capture → claims → reviewed facts → search/`ask` for agents; MCP + `optimal` CLI; managed “Memory” on MIOSA | Managed engine (org-gated); self-host OSS |

**Audience:** Builders of agent products (coding agents, chat apps) and OSA users who need compute and optional external memory—not “marketing facts in a repo” as the primary story.

**Closest overlap with Agent KBase:** Optimal Engine (“memory and knowledge engine for a person, a team, or a company”) and OSA identity/skills in `~/.osa/`.

**Not overlap:** Per-second sandbox/compute, previews, production deploy, competing with E2B/Daytona/Vercel Sandbox on price tables.

### Position vs Optimal Engine

| They stress | Agent KBase / Company Brain Pack |
|-------------|----------------------------------|
| Central engine + MCP retrieval | **Git-native:** PR review, optional CI validate, customer owns files after churn |
| Ingest Slack/GitHub/Linear into memory | **Department pack:** marketing, sales, ops, fulfillment in `brain/` ([COMPANY-BRAIN-SCOPE.md](COMPANY-BRAIN-SCOPE.md)) |
| Claims promoted to facts after review | **`[CONFIRM]`**, human-filled fields, `open-questions.md` |
| Managed Memory billed on MIOSA | **SkillTree audit → Pack/DFY** (paid human promotion of audit → facts) |
| `ask` returns context; agent writes answer | Facts vs stories vs gaps; **AGENTS.md** routing for Cursor |

**Complementary line (not a fight):** *Sandboxes run the code; `brain/AGENTS.md` tells the agent what the company is allowed to claim before it executes.*

**Partner wedge:** AgencyMIOSA-style builders deliver agents; Pack/DFY delivers **reviewed `brain/` in the customer repo**.

### Funnel benchmarks (upsell patterns to copy)

| Their ladder | Agent KBase analogue |
|--------------|----------------------|
| OSA: install, no account | OSS wizard + free `brain.zip` |
| MIOSA Developer **$20/mo** | **Company Brain Pack** **€49–149** one-time (similar “serious builder” step, no infra bill) |
| Business **$500/mo** | **DFY brain** **€499–1,200** (prod-minded buyer; you sell outcome in git, not VMs) |
| Optimal Engine / Memory (gated) | Deferred Hosted Pro or sync add-on only if reopened |

**Copy to steal:** show price/tier before commitment (they show Memory size + hourly before create); bundle Pack + async Q&A like one “wallet” SKU.

**Discovery metrics to counter their benchmarks:** time to first **validated** export; % human-filled vs draft post-SkillTree; wrong-pricing citations before/after `brain/facts/marketing.md`.

**Do not benchmark:** sandbox startup latency, deploy/WAF, hosted chat token pricing, MCP sandbox tool surface.

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
* MIOSA Developer **$20/mo**; Business **$500/mo** (compute + credits, not company brain content).

## Conclusion for v1

Compete on **git-native company truth + SkillTree funnel**, not on hosted LLM wizard or agent **runtime** (MIOSA). First paid SKU should be **digital pack + DFY upsell**, not subscription SaaS. Treat Optimal Engine as the nearest **memory** analog; differentiate on git ownership, department scope, and audit funnel—not on RAG infrastructure.
