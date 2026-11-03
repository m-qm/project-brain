# Trust Center

How we think about security and data on **agentkbase.com**.

## Security contact

Report vulnerabilities or abuse:

* **Email:** [hello@agentkbase.com](mailto:hello@agentkbase.com)
* **security.txt:** [/.well-known/security.txt](https://agentkbase.com/.well-known/security.txt)

Please include steps to reproduce and impact. We aim to acknowledge good-faith reports within a few business days.

## Public site architecture

| Area | Approach |
|------|----------|
| **Brain content** | Stays in **your** repo after export; no required hosted brain vault on the free tier |
| **LLM on public Vercel** | **Off** by default to prevent quota abuse and shared-key risk |
| **Waitlist** | Email via Resend; operator inbox only; see [Privacy](/legal/privacy) |
| **Analytics** | Vercel Web Analytics (aggregate); see Privacy |
| **Dependencies** | Monorepo with lockfile; production deploy from `main` via Vercel |

## Subprocessors (website)

Hosting and email providers may process data to deliver the site:

* [Vercel](https://vercel.com/legal/privacy-policy) (hosting, analytics)
* [Resend](https://resend.com/legal/privacy-policy) (transactional email for waitlist)

## Your responsibilities

* Review exported facts before agents rely on them; use `[CONFIRM]` and open questions for unknowns.
* Keep API keys on your machine or in a private deploy you control.
* Do not commit secrets into `brain/`.

## Compliance artifacts

* [Privacy Policy](/legal/privacy)
* [Terms of Service](/legal/terms)
* [Service level](/legal/sla)
* [Acknowledgements](/legal/acknowledgements)

## Status

External hosting status: [vercel-status.com](https://www.vercel-status.com/) (Vercel platform).
