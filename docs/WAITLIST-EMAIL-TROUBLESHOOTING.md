# Waitlist email: why Porkbun MX does not help

## Two different things

| What | Purpose | Waitlist needs it? |
|------|---------|-------------------|
| **Porkbun MX** on `agentkbase.com` (`fwd1.porkbun.com`) | Mail sent **to** `@agentkbase.com` (e.g. `you@agentkbase.com`) | **No** |
| **Resend send** (DKIM + `rsend` + `send` CNAME) | Mail sent **from** `@agentkbase.com` **to** your inbox | **Yes** |

Waitlist notifications are **outbound from Resend**. They never go through Porkbun MX. Changing or fixing Porkbun MX on `agentkbase.com` does **not** fix waitlist delivery.

## Where notifications go today

1. App tries **from** `notifications@agentkbase.com` **to** `mireiaquerol@gmail.com` → fails until Resend shows domain **Verified**.
2. Fallback **from** `onboarding@resend.dev` **to** `hello@dualperspective.digital` (Resend only allows this inbox on the current API key).
3. Optional bridge env `WAITLIST_RESEND_BRIDGE_INBOX` = same as step 2.

You **did** receive mail at **hello@** (Resend id in logs). That path works. Gmail does not receive until step 1 works.

## Do not add Resend “Enable receiving” MX unless you want `@agentkbase.com` inboxes

MX `receive-euw1.forge.rmta.net` on `@` **replaces** Porkbun MX. Use it only if you want to **read email addressed to** `@agentkbase.com` inside Resend. It does **not** replace fixing **send** verification.

## Fix Gmail notifications (recommended)

1. [Resend → Domains](https://resend.com/domains) → `agentkbase.com` → **Verify** (status must be **Verified**, not pending).
2. **Same account** as [API Keys](https://resend.com/api-keys): create or use a key from that account → Vercel `RESEND_API_KEY` → redeploy.
3. On Porkbun **only** for `agentkbase.com`:
   * Keep DKIM on host **`resend._domainkey`** (TXT `p=MIGf…`).
   * **Remove** duplicate DKIM `p=MIGf…` from apex **`@`** if still present (keep Google verification + SPF there).
4. Test signup → notification at **mireiaquerol@gmail.com**.

## Until Verified: read hello@ or forward it

Forward **hello@dualperspective.digital** → **mireiaquerol@gmail.com** in the mail host where **dualperspective.digital** is managed (Google Workspace, Porkbun email for that domain, etc.). That is **not** the MX table on `agentkbase.com`.

## Check a signup was stored

Vercel logs: `[waitlist] ok user@example.com`. Notification subject: `Waitlist …: user@example.com`. Body line: `Submitter email (form field): user@example.com`. Reply-To = that address.
