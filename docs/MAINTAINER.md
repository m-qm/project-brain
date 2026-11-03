# Maintainer notes (open source repo)

User-facing tutorials live in this `docs/` folder and on [agentkbase.com/learn](https://agentkbase.com/learn).

**Operator-only material** (monetization, discovery, waitlist runbooks, Act pack scope, dogfood checklist) belongs in **`docs-local/`** at the repo root. That directory is **gitignored** and is not published with the OSS repo. Start with `docs-local/ACT-PACK.md` and `docs-local/DOGFOOD.md`.

If you clone fresh and need those files, restore them from your backup or private copy.

Public deploy ops that every contributor may need: [BUILD.md](./BUILD.md), [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md), [PUBLISH-NPM.md](./PUBLISH-NPM.md).
