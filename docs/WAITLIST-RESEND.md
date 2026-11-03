# Company Brain waitlist (Resend)

Signups go through `POST /api/waitlist`, which sends you a notification email via [Resend](https://resend.com). No Make, no Sheets webhook.

## Vercel env (Production)

| Variable | Example |
|----------|---------|
| `RESEND_API_KEY` | `re_…` from [Resend → API Keys](https://resend.com/api-keys) (Sending access) |
| `RESEND_FROM` | `Agent KBase <notifications@agentkbase.com>` |
| `WAITLIST_NOTIFY_EMAIL` | `mireiaquerol@gmail.com` (inbox for each signup) |

Redeploy after changing env vars.

## Verify agentkbase.com on Resend

Required so you can send **from** `@agentkbase.com` **to** Gmail (not only Resend’s test inbox).

1. [Resend → Domains](https://resend.com/domains) → **Add domain** → `agentkbase.com`
2. Add these in **Porkbun** → `agentkbase.com` → **DNS** (Host = subdomain only, leave TTL default). Keep existing Vercel `@` / `www` records.

| Type | Host (Porkbun) | Answer / Content |
|------|----------------|------------------|
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDS2AmvsUopfoVBpoC0lLQkQNzbTu+0tOIxtwwtdUryKP1PN2Tf3GAuRVvD34TNvNTlgcX+FyEucEuOcNLRRim4yFBFnMk9BscHgOEzEUaCG1KenfxBT4Q138WwqKtz8WUSOxmlj47IGwD0oYjulTaNUjCD92mXxhozf9wAy3s4kwIDAQAB` |
| CNAME | `rsend` | `rsend-euw1.forge.rmta.net` |
| CNAME | `send` | `send.forge.rmta.net` |
| TXT | `_dmarc` | `v=DMARC1; p=none;` |

3. In Resend → domain → **Enable Sending**, then **Verify**. Status should become **Verified** (often 5–30 minutes).
4. Check propagation:

```bash
dig TXT resend._domainkey.agentkbase.com +short
dig CNAME rsend.agentkbase.com +short
dig CNAME send.agentkbase.com +short
```

You should see the TXT `p=MIGf…` and the two `forge.rmta.net` targets, not `uixie.porkbun.com`.
5. Set `RESEND_FROM` to an address on that domain, e.g. `Agent KBase <notifications@agentkbase.com>`.

Use a **full access** or domain-capable API key if you manage domains via API; send-only keys work once the domain is verified in the dashboard.

## Test

```bash
curl -sS -X POST 'https://agentkbase.com/api/waitlist' \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","source":"curl-test"}'
```

Expect: `{"ok":true,"stored":true}` and a notification at `WAITLIST_NOTIFY_EMAIL`.

## Optional later

Resend **Audiences** can hold the subscriber list for launch email; that needs an API key with audience permissions and a small code change.
