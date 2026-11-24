# Open questions

The agent must **not** guess answers here. Ask the human or mark `[CONFIRM]` in drafts.

* [CONFIRM] **Service fee or range** for setup, start call, and written agreement (site: quoted only).
* [CONFIRM] **Pilot scope:** revision rounds, channels (email vs WhatsApp), who clicks publish.
* [CONFIRM] **SLA** for draft review in the mounted company-brain circuit if promised publicly.
* [CONFIRM] First buyer priority: dev who installs vs owner who pays setup.
* [CONFIRM] `@agentkbase/mcp` npm publish version aligned with CLI 0.1.2 (AK-8).
* [CONFIRM] Remote MCP OAuth / Claude directory submit date.
* [CONFIRM] **`MCP_API_KEY` in production:** who mints and rotates the bearer for agentkbase.com (Vercel env); clients get it out-of-band until OAuth ships.
* [CONFIRM] **Remote `/mcp` edge protection (H-11c):** app Bearer is done; choose **one or stack** for abuse/cost — pick before public MCP directory:
  * **A — Cloudflare in front of agentkbase.com:** rate limit + WAF on `POST /mcp`; optional Zero Trust / IP allowlist; Vercel stays origin; **keep** `MCP_API_KEY` in app.
  * **B — Vercel Firewall only:** path rules on `/mcp`, no extra DNS hop; weaker if traffic bypasses CF.
  * **C — Dedicated host `mcp.agentkbase.com`:** strict edge rules on subdomain; marketing site unchanged.
  * **D — App-only (status quo):** Bearer + fail closed only; accept abuse risk until OAuth or paid tier.
  * **Not chosen yet:** Next.js `middleware.ts` rate limit (rejected for H-11 scope); nginx VM as sole guard (prefer CF + Vercel).
