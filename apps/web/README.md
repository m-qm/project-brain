# Agent KBase web

Next.js landing, wizard, and learn pages.

## Local

From repository root:

```bash
pnpm install
pnpm build
pnpm dev
```

## Deploy on Vercel

1. Import the **monorepo** repository.
2. Set **Root Directory** to `apps/web`.
3. **Install Command:** `cd ../.. && pnpm install`
4. **Build Command:** `cd ../.. && pnpm --filter @project-brain/templates build && pnpm --filter @project-brain/core build && pnpm --filter @project-brain/web build`
5. Deploy. Add the URL to GitHub repository **Website**.

## Hiring demo

Record a short Loom: wizard → download zip → unzip in a sample repo → open Cursor → agent cites `brain/facts/project.md`.
