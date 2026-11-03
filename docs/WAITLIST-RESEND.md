# Company Brain waitlist (Resend)

Signups use `POST /api/waitlist` ([`apps/web/app/api/waitlist/route.ts`](../apps/web/app/api/waitlist/route.ts) + [`apps/web/lib/waitlist-notify.ts`](../apps/web/lib/waitlist-notify.ts)).

## Product flow

```text
/company-brain form
    → POST /api/waitlist { email, source }
    → Resend: notify owner (WAITLIST_NOTIFY_EMAIL)
    → Resend: optional confirmation to submitter
    → JSON { ok, stored, subscriberNotified }
```

**Owner inbox:** only `WAITLIST_NOTIFY_EMAIL` (default `mireiaquerol@gmail.com`). No alternate bridge inbox in code.

## Vercel env (Production)

| Variable | Required | Value |
|----------|----------|--------|
| `RESEND_API_KEY` | Yes | From the **same** Resend account as domain `agentkbase.com` |
| `RESEND_FROM` | Yes | `Agent KBase <notifications@agentkbase.com>` |
| `WAITLIST_NOTIFY_EMAIL` | Recommended | `mireiaquerol@gmail.com` |

Optional (UI only):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SETUP_CALL_URL` | Calendly for DFY CTA, e.g. `https://calendly.com/mireiaquerol/15min` |

Redeploy after env changes.

Local dev: copy [`apps/web/.env.example`](../apps/web/.env.example) → `.env.local` and set the three Resend vars to test sends (use a real submitter address you control).

## Domain verification (required for Gmail)

Until `agentkbase.com` is **Verified** in Resend, owner notify fails and the API returns **503** with a user-facing domain message. There is no code path to another inbox.

Checklist:

1. [Resend → Domains](https://resend.com/domains) → `agentkbase.com` → **Verified**
2. API key from the same account → Vercel `RESEND_API_KEY`
3. Porkbun DNS: DKIM on `resend._domainkey` only; `rsend` + `send` CNAMEs; `_dmarc`; no duplicate DKIM on apex `@`

Details and MX confusion: [WAITLIST-EMAIL-TROUBLESHOOTING.md](./WAITLIST-EMAIL-TROUBLESHOOTING.md).

## API behavior

| Status | Meaning |
|--------|---------|
| **200** | Owner email sent; `stored: true`; `subscriberNotified` true/false depending on confirmation send |
| **400** | Invalid email, JSON, or blocked placeholder (`you@company.com`, `*@example.com`, etc.) |
| **503** | No `RESEND_API_KEY`, or domain not verified (Resend rejection) |
| **502** | Resend error other than pending domain |

Blocked placeholders are listed in `route.ts` (`BLOCKED_EMAILS`).

## Test

```bash
curl -sS -X POST 'https://agentkbase.com/api/waitlist' \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@real-domain.com","source":"curl-test"}'
```

Success:

```json
{"ok":true,"stored":true,"subscriberNotified":true}
```

Mail at `WAITLIST_NOTIFY_EMAIL` + confirmation at the address in the JSON (if Resend allows).

## Analytics

Client fires `company_brain_waitlist` on success (see [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md)). Discovery follow-up: [DISCOVERY-KICKOFF.md](./DISCOVERY-KICKOFF.md) template B (reply to notification).

## Optional later

* Resend **Audiences** for a marketing list (not wired in v1).
* Resend **Enable receiving** only if you want inbound `@agentkbase.com` mailboxes (replaces Porkbun MX on `@`).
