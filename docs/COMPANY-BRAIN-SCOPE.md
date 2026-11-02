# Company Brain Pack — v1 scope (investigation draft)

Defines what a paid **full company brain** contains before schema or template implementation. OSS Agent KBase stays the starter pack (`facts/project.md`, one story, open questions). The Company Brain Pack extends the same git layout with department files and work-log conventions.

## Design principles

* **Git-native:** customer owns `brain/` in their repo; no required hosted vault.
* **Validate before export:** stricter rules than starter wizard; `[CONFIRM]` on anything marketing-sourced.
* **Agents read, humans approve:** extract and LLM may **draft**; pricing, SLAs, and client names are **human-filled** unless sourced from signed internal docs.
* **Work-logs append only:** agents may add dated entries; they must not rewrite `facts/` without explicit human edit.

## Target folder layout (v1)

```
brain/
  AGENTS.md                 # routing: which files to read per task type
  open-questions.md
  facts/
    project.md              # mission, boundaries (from OSS)
    marketing.md            # ICP, offers, voice, claim limits
    sales.md                # pipeline, objections, handoffs to ops
    operations.md           # SLAs, tools, escalation
    fulfillment.md          # delivery steps, QA, support boundaries
  stories/
    marketing-narrative.md
    sales-motion.md
    delivery-flow.md
  work-logs/
    README.md               # append-only rules
    TEMPLATE.md             # YYYY-MM-DD · author · summary
  .engram/                  # optional, same as OSS
```

## Department deliverables

| Area | File(s) | Must be human-filled | May be draft (URL extract / LLM / SkillTree audit) |
|------|---------|----------------------|-----------------------------------------------------|
| **Marketing** | `facts/marketing.md`, `stories/marketing-narrative.md` | Guaranteed savings, legal claims, pricing promises | ICP sketch, offer list from homepage, voice notes |
| **Sales** | `facts/sales.md`, `stories/sales-motion.md` | Contract terms, discount policy, named accounts | Objection themes, funnel stages from interview |
| **Operations** | `facts/operations.md` | On-call, PII handling, vendor credentials | Tool stack list, rough SLA from site |
| **Fulfillment** | `facts/fulfillment.md`, `stories/delivery-flow.md` | Custom SOW steps, client-specific QA | Generic delivery checklist from audit |
| **Work-logs** | `work-logs/*.md` | N/A (runtime) | Template only; agents append after human enables |

## AGENTS.md routing (v1 behavior)

Agents should:

1. Always read `facts/project.md` and `open-questions.md`.
2. For **copy / landing / ads** → `facts/marketing.md` + marketing story.
3. For **outbound / CRM / proposals** → `facts/sales.md` + sales story.
4. For **incidents / internal process** → `facts/operations.md`.
5. For **client delivery** → `facts/fulfillment.md` + delivery story.
6. For **what changed this week** → latest `work-logs/` entries (append new file or section, never delete history).

## Validation rules (Pack-only, future `validate --company`)

* Each required fact file exists and is non-empty.
* Every line matching pricing or SLA patterns in marketing/sales either cites `[CONFIRM]` or links to an open question.
* At least one work-log template present; no secrets in tracked files (warn on API key patterns).
* Stories reference facts; no story-only metrics absent from facts.

## SkillTree funnel hook

SkillTree audit outputs map loosely:

| Audit theme | Pack destination |
|-------------|------------------|
| Positioning / ICP | `facts/marketing.md` |
| Funnel / CRM | `facts/sales.md` |
| Tooling / risk | `facts/operations.md` |
| Delivery / support | `facts/fulfillment.md` |
| Open risks | `open-questions.md` |

Done-for-you delivery: facilitator transfers audit notes into the pack, then customer sign-off call.

## Explicitly out of v1

* Hosted sync SaaS (Phase 2).
* Automatic SkillTree API import (manual copy first).
* Multi-tenant team permissions inside Agent KBase.
* Subscription maintenance tier (document as Phase 2 in MONETIZATION.md).

## Success criteria for v1 product

Customer can unzip the pack, run `brain validate --dir .` (future flag), and Cursor agents stop inventing cross-department facts on a realistic small SaaS repo within one week of editing.
