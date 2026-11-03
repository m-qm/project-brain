# Agent instructions — Agent KBase content loop

Two agents. Same brain. A human between them.

1. **Article agent** — `brain/agents/article.md`  
   Writes the next unused row on `brain/content/article-slate.md`. Leaves it `pending`.

2. **LinkedIn agent** — `brain/agents/linkedin.md`  
   Drafts ES/EN only after that article is `published`. Never from pending text.

**Mission:** Ship a blog post without inventing the offer, then draft distribution from approved text. agentkbase.com is the case study.

## Before you act

Read, in order:

1. `brain/facts/project.md`
2. `brain/facts/brand-guardrails.md`
3. `brain/facts/connectors.md`
4. `brain/open-questions.md` (do not guess unanswered items)
5. The agent file for the job you are doing
6. `brain/content/review-checklist.md`

## Rules

* Do not invent metrics, follower counts, ROAS, rankings, or client names.
* Do not promise viral reach or SEO timelines.
* Do not ask anyone for invoices, passwords, or a personal phone number.
* Do not name a founder, city, employer, or CV.
* Voice is the product, never a person. Use “we” for Agent KBase.
* Never publish. Leave items in `pending` until a human marks `approved`.
* LinkedIn drafts only from a `published` article.
* If a task depends on an open question, stop and ask the human.
