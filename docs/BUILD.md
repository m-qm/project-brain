# Build and dev (why things “break”)

## Root cause (monorepo + Next dev)

The web app imports **`@agentkbase/core` from compiled `dist/`**, not TypeScript sources. Next keeps **webpack/Turbopack chunks** under `apps/web/.next`.

Dev breaks when **two things happen at once**:

1. Something **deletes or rewrites `.next` while a compile is in flight** (auto-restart scripts, `rm -rf .next` mid-save, or `pnpm build` while `next dev` runs).
2. **Fast Refresh** serves a new client bundle while the server still references old chunk ids → `__webpack_modules__[moduleId] is not a function`, `Cannot find module './962.js'`, or `_buildManifest.js.tmp.* ENOENT`.

**What we removed:** Turbopack + a watcher that **`rm -rf .next` and restarted Next** whenever `packages/core/dist` changed. That raced with every wizard save and corrupted the cache.

**Default now:** one stable **`next dev` (webpack)** process, **no automatic `.next` wipe**, no Turbopack/webpack split config.

## What usually went wrong

1. **`TypeError: __webpack_modules__[moduleId] is not a function` / missing `./962.js` / `_buildManifest.js.tmp` ENOENT**  
   Corrupted dev cache (see above).  
   **Fix:** stop dev (Ctrl+C), `rm -rf apps/web/.next`, start again, **hard refresh** (Cmd+Shift+R). Kill zombies on 3000 if needed: `kill $(lsof -i :3000 -t) 2>/dev/null`.

2. **Edited `packages/core` but web behavior unchanged**  
   Web reads **`dist/`**. `tsc --watch` updates dist, but Next may need a **manual dev restart** to pick up API route changes.  
   **Fix:** stop/start `pnpm dev`, or use `pnpm dev:resync` (restarts Next on core dist changes **without** deleting `.next`).

3. **Edited `packages/templates/files/*` without embed**  
   **Fix:** `pnpm --filter @agentkbase/templates build`.

4. **`pnpm build` while `next dev` is running**  
   Root `pnpm build` **refuses** if port 3000 is busy and **wipes `apps/web/.next` first**.  
   **Fix:** stop dev (Ctrl+C), then `pnpm build`.

5. **`Invariant: no direct app page entry found for /_not-found`**  
   Mixed or half-written `.next` (dev + production build at once).  
   **Fix:** stop dev, `rm -rf apps/web/.next`, single `pnpm build` from repo root.

6. **Google Fonts / compile errors on `/wizard`**  
   Layout uses **system fonts** (no `next/font` network fetch in dev).

7. **Port 3000 already in use**  
   Old broken server still running. **Fix:** kill process on 3000, then `pnpm dev`.

## Commands (from repo root)

| Goal | Command |
|------|---------|
| **Daily dev (UI + wizard)** | `pnpm dev:fast` — builds libs once, then stable `next dev` (no core auto-restart) |
| Full monorepo watch | `pnpm dev` — same + `tsc --watch` on core/cli (restart Next yourself after core edits) |
| Core + web together | `pnpm dev:resync` — restarts Next when `core/dist` changes; does **not** wipe `.next` |
| Fresh cache | `pnpm --filter @agentkbase/web run dev:clean` |
| Production build | `pnpm build` (stop dev first) |
| Nuclear reset | `pnpm clean` then `pnpm install` && `pnpm build` |
| CLI only | `pnpm run build:packages` then `pnpm brain …` |

## Order of packages

```
templates (embed) → core → cli
                  ↘ web (Next)
```

CI runs the full chain so main stays green.
