# Maintainer notes (open source repo)

User-facing tutorials live in this `docs/` folder and on [agentkbase.com/learn](https://agentkbase.com/learn).

**Operator-only material** (waitlist runbooks) belongs in **`docs-local/`**. That directory is **gitignored**. Competitive research and discovery notes are not kept.

The configured content loop stays local and gitignored: `examples/content-ads-brain/` (brain, workers, prompts, review rules) and `scripts/company-brain-skeleton.mjs`. The public sample is `examples/fictional-saas-brain/`.

If you clone fresh, those files are not in git. Restore them from your own copy.

Public deploy ops that every contributor may need: [BUILD.md](./BUILD.md), [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md), [PUBLISH-NPM.md](./PUBLISH-NPM.md).
