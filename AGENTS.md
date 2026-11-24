# Agent KBase — repository

This monorepo builds Agent KBase (CLI, core, MCP, web). **Product and positioning truth** for agents lives in **`brain/`** — start there.

1. Read `brain/AGENTS.md` and `brain/facts/project.md`
2. Read `brain/open-questions.md` before claiming dates, prices, or shipped features
3. Use `pnpm brain validate --dir .` and `brain brief` from repo root before large marketing or architecture edits

Technical conventions: `.cursor/rules/project-brain.mdc`

Web UI: the marketing app (`apps/web`) uses [@ui-sdk/react](https://ui-sdk.dev/) for interactive controls. Before adding or changing ui-sdk usage, read `apps/web/node_modules/@ui-sdk/react/docs/llms.txt` (and `core.md` / `rendering.md` when building new primitives).
