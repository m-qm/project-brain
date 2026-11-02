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
2. Copy the DNS records Resend shows (SPF + DKIM, usually at Porkbun where agentkbase DNS lives).
3. Add those records in Porkbun → DNS for `agentkbase.com` (see [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md) for DNS context).
4. Wait until Resend shows **Verified**.
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
