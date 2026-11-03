# Company Brain waitlist (Resend)

Signups go through `POST /api/waitlist`, which emails **you** and optionally the submitter via [Resend](https://resend.com). **Only** `mireiaquerol@gmail.com` (or `WAITLIST_NOTIFY_EMAIL`). No `hello@dualperspective.digital` bridge.

## Vercel env (Production)

| Variable | Value |
|----------|--------|
| `RESEND_API_KEY` | From the **same** Resend account as `agentkbase.com` |
| `RESEND_FROM` | `Agent KBase <notifications@agentkbase.com>` |
| `WAITLIST_NOTIFY_EMAIL` | `mireiaquerol@gmail.com` |

Redeploy after changes.

## Required: verify `agentkbase.com` for sending

Until the domain is **Verified**, Resend returns 403 and the form shows a temporary error. There is no alternate inbox in code.

1. [Resend → Domains](https://resend.com/domains) → `agentkbase.com` → **Verify** (status **Verified**).
2. [Resend → API Keys](https://resend.com/api-keys): key must be from **that same account/team**.
3. Porkbun DNS for `agentkbase.com`:
   * TXT **`resend._domainkey`** → `p=MIGf…` (DKIM only here, **not** on apex `@`)
   * CNAME **`rsend`** → `rsend-euw1.forge.rmta.net`
   * CNAME **`send`** → `send.forge.rmta.net`
   * TXT **`_dmarc`** → `v=DMARC1; p=none;`
4. Remove duplicate DKIM `p=MIGf…` from apex `@` if present (keep Google verification + SPF).

Porkbun **MX** on `agentkbase.com` does not affect waitlist. Do not enable Resend **Receive** unless you want `@agentkbase.com` mailboxes.

See [WAITLIST-EMAIL-TROUBLESHOOTING.md](./WAITLIST-EMAIL-TROUBLESHOOTING.md).

## Test

```bash
curl -sS -X POST 'https://agentkbase.com/api/waitlist' \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@real-domain.com","source":"curl-test"}'
```

Expect: `{"ok":true,"stored":true,"subscriberNotified":true}` and mail at `WAITLIST_NOTIFY_EMAIL`.

## Optional later

Resend **Audiences** for the public list; **Enable receiving** only if you want inbound `@agentkbase.com`.
