# Deploy web to Vercel (agentkbase.com)

## Monorepo settings

* **Project name:** `agentkbase`
* **Root Directory:** `apps/web`
* **Install:** `cd ../.. && pnpm install`
* **Build:** `cd ../.. && pnpm run build`

Link and deploy from the **repository root** (not only `apps/web`), so `packages/core` and `packages/templates` are included.

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

## Analytics

[Vercel Web Analytics](https://vercel.com/docs/analytics) is enabled on project **agentkbase**. The app includes `@vercel/analytics` in `app/layout.tsx` (page views, no cookies banner required for the default setup).

View traffic: [Vercel → agentkbase → Analytics](https://vercel.com/mqms-projects/agentkbase/analytics).

Custom events: `wizard_export`, `wizard_extract`, `learn_doc` (props: `slug`, optional `section`; hub uses `slug: index`).

Speed Insights is a separate paid add on; enable only if you want Core Web Vitals in the dashboard.
