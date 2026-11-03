# Waitlist email troubleshooting

Quick reference for **Company Brain** signups (`POST /api/waitlist`). Setup lives in [WAITLIST-RESEND.md](./WAITLIST-RESEND.md).

## How it works (one path)

1. Visitor submits email on `/company-brain`.
2. Server sends **two** outbound emails via Resend (same verified domain):
   * **You:** `WAITLIST_NOTIFY_EMAIL` (default `mireiaquerol@gmail.com`), subject `Waitlist: {their email}`, **Reply-To** = submitter.
   * **Them:** confirmation (“You're on the Company Brain waitlist”).
3. Success only if the **owner** notify send succeeds. If Resend rejects the send, the API returns an error and **nothing is treated as stored** (no silent fallback inbox).

There is **no** `hello@dualperspective.digital`, **no** `onboarding@resend.dev` bridge, and **no** Make webhook in the app.

## Porkbun MX vs Resend send (do not confuse)

| What | Purpose | Waitlist needs it? |
|------|---------|-------------------|
| **Porkbun MX** on `agentkbase.com` (`fwd1.porkbun.com`) | Mail sent **to** `@agentkbase.com` (e.g. `hello@agentkbase.com`) | **No** |
| **Resend send** (DKIM + `rsend` + `send` CNAME) | Mail sent **from** `@agentkbase.com` **to** Gmail (and others) | **Yes** |

Waitlist notifications are **outbound from Resend**. They never go through Porkbun MX. Fixing or changing Porkbun MX on `agentkbase.com` does **not** fix waitlist delivery.

**dualperspective.digital** (Mailgun MX, forwarding, etc.) is **unrelated** to this flow.

## Do not enable Resend “Receive” unless you want `@agentkbase.com` inboxes

MX `receive-euw1.forge.rmta.net` on `@` **replaces** Porkbun MX. Use it only if you want to **read email addressed to** `@agentkbase.com` inside Resend. It does **not** replace fixing **send** verification.

## Fix: notifications to Gmail

1. [Resend → Domains](https://resend.com/domains) → `agentkbase.com` → **Verify** (status **Verified**, not Pending).
2. [Resend → API Keys](https://resend.com/api-keys): `RESEND_API_KEY` on Vercel must be from **that same account/team** as the domain.
3. Vercel Production env:
   * `RESEND_FROM` = `Agent KBase <notifications@agentkbase.com>`
   * `WAITLIST_NOTIFY_EMAIL` = `mireiaquerol@gmail.com`
4. Porkbun DNS for **agentkbase.com** only:
   * TXT **`resend._domainkey`** → `p=MIGf…` (DKIM **only** here)
   * CNAME **`rsend`** → `rsend-euw1.forge.rmta.net`
   * CNAME **`send`** → `send.forge.rmta.net`
   * TXT **`_dmarc`** → `v=DMARC1; p=none;`
   * **Remove** duplicate DKIM `p=MIGf…` from apex **`@`** if still present (keep Google site verification + SPF on `@`).
5. Redeploy, then test (see [WAITLIST-RESEND.md](./WAITLIST-RESEND.md#test)).

## Until the domain is Verified

* The form shows: *Waitlist mail is not live yet (domain verification). Email hello@agentkbase.com…*
* API: **503** when Resend body mentions domain not verified / validation error.
* Leads are **not** saved server-side when send fails; finish DNS + Verify, then retest.
* Manual signups: people can still email **hello@agentkbase.com** (Porkbun forward to your Gmail if configured for `@agentkbase.com`).

## Common Resend failures

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| 403 / “domain is not verified” | DNS pending or wrong Resend account | Verify domain; match API key account |
| Owner mail ok, no confirmation | Second send failed (quota, invalid submitter address) | Check Vercel logs `confirmation email failed`; signup still returns `ok: true` if owner mail succeeded |
| 502 / generic error | Bad API key, network, other Resend error | Vercel → Logs → `[waitlist] resend notify failed` + status/body snippet |
| 503 / not configured | Missing `RESEND_API_KEY` | Set key on Vercel Production, redeploy |

## Confirm a signup worked

* **Vercel logs:** `[waitlist] ok user@example.com domain`
* **Your inbox:** subject `Waitlist: user@example.com`; body includes `Submitter email (form field): user@example.com`
* **Reply** goes to the submitter (Reply-To header)

## Removed (do not re-add without a decision)

* `WAITLIST_RESEND_BRIDGE_INBOX`, Make `WAITLIST_WEBHOOK_URL`, sends to `hello@dualperspective.digital`
