# Agent KBase monetization — investigation deliverable

Status: **investigation complete (repo artifacts)**; customer discovery **pending operator** (use [DISCOVERY-INTERVIEW-GUIDE.md](DISCOVERY-INTERVIEW-GUIDE.md)).

## Decision gate (provisional v1)

Until interview data overrides this:

| Field | Choice |
|-------|--------|
| **v1 primary SKU** | **Company Brain Pack** (one-time digital): extended templates + validate rules + guide |
| **v1 premium SKU** | **Done-for-you brain delivery** upsell from **SkillTree** audit |
| **Deferred** | Hosted Pro (Stripe + metered LLM), maintenance subscription |
| **OSS** | Starter wizard + CLI remain free |

**Funnel:** SkillTree audit → offer Pack self-serve or DFY setup → validated `brain.zip` in customer repo.

**Narrative:** “SkillTree shows what is broken. Agent KBase holds what is true in git. Company Brain Pack turns the audit into marketing, sales, ops, and fulfillment facts your Cursor agents read.”

## Unit economics (sketch)

Assumptions for planning; replace with real hours after first DFY delivery.

### A. Company Brain Pack (self-serve)

| Item | Estimate |
|------|----------|
| Price test band | **€49** (lean) / **€149** (with video + strict validate) |
| Marginal cost | Near zero (digital) |
| Support cost | ~30 min per buyer if email support → cap or community |
| Build cost (one-time) | Templates + docs + validate flag (~2–4 eng weeks post-gate) |

**Break-even:** ~20 sales at €49 covers a week of build if outsourced; primary value is funnel + DFY lead gen.

### B. Done-for-you (DFY)

| Item | Estimate |
|------|----------|
| Price band | **€499** (lean) / **€1,200** (audit handoff + 30d async Q&A) |
| Hours per brain | 6–12 h (intake, map audit, fill pack, validate, handoff call) |
| Effective rate @ €799 / 8h | ~€100/h |
| LLM cost | Customer BYOK or facilitator key on facilitator machine only |

**Capacity:** ~4 DFY/month at 8h each without hiring.

### C. Hosted Pro (deferred)

| Item | Estimate |
|------|----------|
| Price idea | €15–29/mo |
| LLM cost per deep extract | ~$0.05–0.30 depending on pages |
| Abuse multiplier without auth | Unbounded → **do not ship** until auth + per-user caps |

## Options scorecard (recap)

See plan; winners for v1: **A + B**. Fallback if discovery fails: **F** (SkillTree only).

## Discovery results (fill after calls)

| Metric | Target | Actual |
|--------|--------|--------|
| Calls completed | 5–8 | _pending_ |
| Preferred SKU (mode) | — | _pending_ |
| Median pack price accept | — | _pending_ |
| Median DFY price accept | — | _pending_ |
| Top objection | — | _pending_ |

## Fake door (live)

* URL: `/company-brain` on agentkbase.com
* Events: `company_brain_view`, `company_brain_waitlist`, `company_brain_setup_call`
* Waitlist: `POST /api/waitlist` → optional `WAITLIST_WEBHOOK_URL`

## Related docs

* Scope: [COMPANY-BRAIN-SCOPE.md](COMPANY-BRAIN-SCOPE.md)
* Interviews: [DISCOVERY-INTERVIEW-GUIDE.md](DISCOVERY-INTERVIEW-GUIDE.md)
* Analogs: [COMPETITIVE-ANALOGS.md](COMPETITIVE-ANALOGS.md)
* Post-gate build: [POST-GATE-BUILD.md](POST-GATE-BUILD.md)

## Public LLM policy (unchanged)

Do not fund shared `ANTHROPIC_API_KEY` on public Vercel. Paid LLM stays CLI BYOK, DFY facilitator, or future Hosted Pro.
