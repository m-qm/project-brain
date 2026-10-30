# Build and dev (why things “break”)

## What usually went wrong

1. **`next dev` + stale `.next`**  
   A dev server was still running (or crashed) while chunks changed. Next then looks for old files like `./951.js` → 500 errors.  
   **Fix:** stop dev (Ctrl+C), `pnpm --filter @project-brain/web run clean`, then `pnpm dev` again.

2. **Edited `packages/core` but only ran `pnpm dev`**  
   The web app imports **`@project-brain/core` from `dist/`**, not TypeScript sources. Core changes are invisible until you rebuild core.  
   **Fix:** `pnpm run build:packages` (or full `pnpm build`).

3. **Edited `packages/templates/files/*` without embed**  
   Templates are baked into `content.generated.ts` on **`templates` prebuild**.  
   **Fix:** `pnpm --filter @project-brain/templates build`.

4. **`pnpm build` while `next dev` is writing `.next`**  
   Can corrupt the cache.  
   **Fix:** stop dev before production build.

5. **Port 3000 already in use**  
   A zombie `next dev` answers with an old broken server.  
   **Fix:** `kill $(lsof -i :3000 -t)` then `pnpm dev`.

## Commands (from repo root)

| Goal | Command |
|------|---------|
| Daily dev | `pnpm dev` (rebuilds libs first) |
| Production build | `pnpm build` |
| Nuclear reset | `pnpm clean` then `pnpm install` && `pnpm build` |
| CLI only | `pnpm run build:packages` then `pnpm brain …` |

## Order of packages

```
templates (embed) → core → cli
                  ↘ web (Next)
```

CI runs the full chain so main stays green.
