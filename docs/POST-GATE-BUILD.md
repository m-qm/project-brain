# Post–decision gate build notes

Do **not** start until [MONETIZATION.md](MONETIZATION.md) discovery section confirms or adjusts v1 SKU.

## If v1 = Company Brain Pack (A)

1. Add templates under `packages/templates-pro/` or paid zip (licensing TBD).
2. Implement files from [COMPANY-BRAIN-SCOPE.md](COMPANY-BRAIN-SCOPE.md).
3. Core: `validateBrainInputStrict` → `validateCompanyBrain(dir)` with file presence + secret scan + `[CONFIRM]` rules.
4. CLI: `brain init --company-pack`, `brain validate --company`.
5. Wizard: optional import step (download pack, merge with wizard export).
6. Learn doc: “Company brain layout”.

**Spike only (no ship):** folder scaffold generator from empty `BrainInput` → multi-file skeleton.

## If v1 = Done-for-you (B)

1. Internal Notion/Google Doc checklist mapped to pack files ([DFY playbook](#dfy-playbook-outline) below).
2. Cal.com / email intake; deliver zip via secure link.
3. SkillTree report appendix template: “Brain handoff section”.
4. No product code required for first 3 DFY sales.

### DFY playbook outline

| Step | Owner | Output |
|------|-------|--------|
| 1. Intake | Facilitator | Site URL, audit PDF, 90 min recording |
| 2. Map | Facilitator | Audit findings → pack file headings |
| 3. Draft | Facilitator + CLI extract | Draft facts per department |
| 4. Review | Customer | Mark `[CONFIRM]` resolves |
| 5. Validate | Facilitator | `brain validate --company` passes |
| 6. Handoff | 30 min call | AGENTS routing, work-log habit |

## If v1 = Hosted Pro (C) — Phase 2+

1. Auth provider (Clerk/Supabase).
2. Stripe Checkout + webhook.
3. Per-tenant env for `AGENTKBASE_ALLOW_SERVER_LLM` + rate limits.
4. Export to git remains primary; hosted is draft workspace.

## Work-log convention (all paths)

Ship `brain/work-logs/TEMPLATE.md` and AGENTS.md rule: append dated entries; never overwrite `facts/` in agent session without human PR.

## Current repo state (investigation only)

* Fake door: `/company-brain`
* No `--company` validate flag yet
* No paid template package yet
