# Deploy web to Vercel (agentkbase.com)

## Monorepo settings

* **Project name:** `agentkbase`
* **Root Directory:** `apps/web`
* **Install:** `pnpm install` (runs from `apps/web`; pnpm finds the workspace root)
* **Build:** `pnpm -w run build`

Link and deploy from the **repository root** (not only `apps/web`), so `packages/core` and `packages/templates` are included.

**Important:** Put `vercel.json` only in [`apps/web/vercel.json`](../apps/web/vercel.json), not the repo root. **Do not** set Install/Build in the Vercel dashboard to `cd ../.. && …`: with Root Directory `apps/web` or `.`, that can escape the clone and fail with `ERR_PNPM_NO_PKG_MANIFEST` in `/`. Dashboard overrides beat `vercel.json`; keep them aligned with the commands above.

```bash
cd project-brain
vercel link    # project: agentkbase
vercel deploy --prod
```

Production URL (until DNS propagates): check `vercel project ls` or the Vercel dashboard.

## Porkbun DNS (keep Porkbun nameservers)

1. **Turn off URL Forwarding** for `agentkbase.com` (conflicts with Vercel).
2. Under **DNS Records**, set:

| Type  | Host | Answer |
|-------|------|--------|
| A     | `@`  | `216.198.79.1` |
| A     | `@`  | `64.29.17.1` |
| CNAME | `www`| `17524d388fcc1135.vercel-dns-017.com` |

(Vercel may also accept legacy `76.76.21.21` on `@` and `cname.vercel-dns.com` on `www`; use what the dashboard shows for project **web**.)

Remove conflicting A/CNAME/ALIAS on `@` and `www`.

3. Wait up to an hour (often minutes). Check:

```bash
vercel domains verify agentkbase.com
```

## Alternative: Vercel nameservers

In Porkbun → DNS, switch nameservers to `ns1.vercel-dns.com` and `ns2.vercel-dns.com`. Vercel manages all records.

## Custom domain in Vercel

Domains attached to project **agentkbase**: `agentkbase.com`, `www.agentkbase.com`.

Dashboard: [Project domains](https://vercel.com/mqms-projects/agentkbase/settings/domains)

## LLM on the public wizard (do **not** on agentkbase.com)

**Do not** put `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` on the public Vercel project without authentication. Anyone can `POST /api/extract-url` and `/api/fill-gaps` and burn your quota.

Default production behavior:

* Wizard **multipage heuristic** extract (no key).
* **No** server LLM unless you explicitly opt in.

The web API only calls LLM providers when **`AGENTKBASE_ALLOW_SERVER_LLM=true`**. Leave it unset on agentkbase.com.

Vibe coders who want LLM use **`@agentkbase/cli`** locally with their own key (`brain extract-url --deep`, `brain fill-gaps`).

### Private / self-hosted deploy only

If you run a **trusted** instance (team login, rate limits, or internal VPN):

1. `AGENTKBASE_ALLOW_SERVER_LLM=true`
2. `NEXT_PUBLIC_AGENTKBASE_HOSTED_LLM=true` (shows deep scan + gap LLM in the wizard UI)
3. `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY` fallback)
4. Optional: `ANTHROPIC_EXTRACT_MODEL` (default `claude-3-5-haiku-latest`)

Local dev: copy `apps/web/.env.example` → `.env.local` and set the flags above only when testing LLM routes.

## Analytics

[Vercel Web Analytics](https://vercel.com/docs/analytics) is enabled on project **agentkbase**. The app includes `@vercel/analytics` in `app/layout.tsx` (page views, no cookies banner required for the default setup).

View traffic: [Vercel → agentkbase → Analytics](https://vercel.com/mqms-projects/agentkbase/analytics).

Custom events: `wizard_export`, `wizard_extract`, `learn_doc` (props: `slug`, optional `section`; hub uses `slug: index`).

Company Brain fake door: `company_brain_view`, `company_brain_waitlist`, `company_brain_setup_call` (props: `source`, optional `stored`).

Optional env for `/company-brain`:

* `WAITLIST_WEBHOOK_URL` — POST JSON `{ email, source, product, at }` on waitlist signup
* `WAITLIST_WEBHOOK_API_KEY` — optional; sent as `x-make-apikey` when Make webhook API key auth is enabled
* `NEXT_PUBLIC_SETUP_CALL_URL` — Cal.com or mailto for “Book setup call (DFY)”

### Waitlist → Google Sheet (Make.com)

1. [Make.com](https://www.make.com) → **Create scenario** → **Webhooks → Custom webhook** → copy the URL.
2. Add module **Google Sheets → Add a row** (connect Google, pick a spreadsheet, create columns `email`, `source`, `product`, `at`).
3. Map webhook body fields to those columns (JSON keys match the POST body from `/api/waitlist`).
4. Optional: add **Slack → Create a message** on the same webhook for alerts.
5. Vercel → **agentkbase** → Settings → Environment Variables → `WAITLIST_WEBHOOK_URL` = webhook URL (Production). **Redeploy** after saving.
6. Test at [agentkbase.com/company-brain](https://agentkbase.com/company-brain). Success copy should say you are on the list (`stored: true`), not “webhook not configured”.

Without `WAITLIST_WEBHOOK_URL`, signups only fire Vercel Analytics events (`company_brain_waitlist`); no email list is stored.

Speed Insights is a separate paid add on; enable only if you want Core Web Vitals in the dashboard.
