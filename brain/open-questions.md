# Open questions

The agent must **not** guess answers here. Ask the human or mark `[CONFIRM]` in drafts.

* [CONFIRM] **Service fee or range** for setup, start call, and written agreement (site: quoted only).
* [CONFIRM] **Pilot scope:** revision rounds, channels (email vs WhatsApp), who clicks publish.
* [CONFIRM] **SLA** for draft review in the mounted company-brain circuit if promised publicly.
* [CONFIRM] First buyer priority: dev who installs vs owner who pays setup.
* [CONFIRM] `@agentkbase/mcp` npm publish version aligned with CLI 0.1.2 (AK-8).
* [CONFIRM] Remote MCP OAuth / Claude directory submit date.
* [CONFIRM] **`MCP_API_KEY` in production:** who mints and rotates the bearer for agentkbase.com (Vercel env); clients get it out-of-band until OAuth ships.
* **H-11c edge (decided):** **A — Cloudflare** in front of agentkbase.com (rate limit + WAF on `POST /mcp`; keep app Bearer). [CONFIRM] CF account rules applied. Optional later: **C** `mcp.agentkbase.com` if MCP needs its own hostname.
* [CONFIRM] **Remote MCP public directory:** semi-private until OAuth — do not market as “connect without operator key.”
