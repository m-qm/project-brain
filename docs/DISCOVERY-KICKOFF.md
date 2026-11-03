# Discovery kickoff (week 1)

Goal: **5 calls** in 14 days. Log each call in [discovery-log.md](./discovery-log.md). Update [MONETIZATION.md](./MONETIZATION.md) § Discovery results when done.

## Before you outreach

1. **Waitlist:** Resend → `agentkbase.com` **Verified** (same account as `RESEND_API_KEY` on Vercel). Notifications go only to **mireiaquerol@gmail.com** ([WAITLIST-RESEND.md](./WAITLIST-RESEND.md)). If the form shows a domain verification error, fix DNS before outreach that depends on waitlist capture.
2. **Analytics:** [Vercel → agentkbase → Analytics](https://vercel.com/mqms-projects/agentkbase/analytics). Filter last 7 days. Note counts for `company_brain_view`, `company_brain_waitlist`, `company_brain_setup_call`, `wizard_export`.
3. **Calendly:** 15 min link on `/company-brain` (`NEXT_PUBLIC_SETUP_CALL_URL`).

## Who to contact first (priority)

| # | Segment | Who | Channel |
|---|---------|-----|---------|
| 1 | SkillTree audit alumni | 2 past audit or connect clients | DM or email, personal |
| 2 | Wizard / site | Anyone who booked Calendly or waitlisted | Reply to waitlist email |
| 3 | Vibecoder / small SaaS | 2 founders from IH, X, or local network | Short DM |

## Outreach (copy/paste, adapt)

### A. SkillTree alumni (email or LinkedIn)

Subject: Quick call about git ground truth after your audit?

Hi [Name],

You used SkillTree on [site/repo]. I am building **Company Brain Pack** for Agent KBase: validated marketing, sales, ops, and fulfillment facts in `brain/` for Cursor, not just a landing page story.

Would you spare **20 minutes** this week? I am not selling yet; I want to learn whether a self serve pack or done for you setup fits how you work.

Book here: https://calendly.com/mireiaquerol/15min  
Or reply with two times.

Mireia

### B. Waitlist signup (after Resend notifies you)

Subject: Re: Company Brain waitlist

Hi,

Thanks for joining the waitlist on agentkbase.com. I am running short discovery calls before launch.

Are you open to **20 min** to talk about how you use Cursor and where agent ground truth breaks today? No pitch deck.

https://calendly.com/mireiaquerol/15min

Mireia

### C. Cold founder (DM, keep under 400 chars)

Building OSS Agent KBase (git native brain for Cursor). Running 20 min discovery on a paid **Company Brain Pack** (post audit facts in repo). Used Cursor on a product repo lately? Happy to share wizard free; looking for 5 interviews only.

## On the call

Use [DISCOVERY-INTERVIEW-GUIDE.md](./DISCOVERY-INTERVIEW-GUIDE.md). Record notes in [discovery-log.md](./discovery-log.md) within 1 hour.

## Vercel Analytics cheat sheet

| Event | Meaning |
|-------|---------|
| `company_brain_view` | Opened `/company-brain` (prop `source`) |
| `company_brain_waitlist` | Submitted waitlist (`stored`, `confirmation`) |
| `company_brain_setup_call` | Clicked Calendly CTA |
| `wizard_export` | Exported brain zip from wizard |

Export or screenshot weekly into MONETIZATION § Fake door metrics (add row when you review).

## This week checklist

* [ ] Resend domain Verified + test signup to Gmail
* [ ] Analytics snapshot (7d)
* [ ] 5 outreach messages sent (mix A/B/C)
* [ ] 2 calls booked
* [ ] 1 call completed + logged
