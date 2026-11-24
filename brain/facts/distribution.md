# Distribution and product surface

## Open core (free)

| Piece | Role |
|-------|------|
| `brain/` in git | Facts, stories, open questions, AGENTS.md |
| `@agentkbase/cli` | `brain setup`, `validate`, `brief`, `extract-url`, `eval` |
| `@agentkbase/core` | Shared pack, validate, eval logic |
| `@agentkbase/mcp` | Read-only stdio MCP for local `brain/` |
| Web wizard | https://agentkbase.com/wizard — export `brain.zip` |
| Learn / blog | Public guides (mirrored under `brain/stories/learn/` for indexing) |

## Remote MCP v0 (web app)

* **URL:** `/mcp` (e.g. https://agentkbase.com/mcp when deployed)
* **Exposure:** **Semi-private / invite-only** — not a public open API. Owners start on wizard + `/check`; remote MCP is for operators with a bearer the team issues out-of-band until OAuth or per-client keys ship. Do not list in Claude directory without edge limits.
* **Auth:** `Authorization: Bearer <MCP_API_KEY>` on every `POST /mcp`; server env `MCP_API_KEY` required (fail closed). See learn/14-claude-mcp and `apps/web/.env.example`.
* **Edge (H-11c):** **Chosen:** Cloudflare in front of agentkbase.com — rate limit + WAF on `POST /mcp`; Vercel origin; **keep** app Bearer. [CONFIRM] CF rules live in DNS/ops (not in this repo).
* **Tools:** `scan_business_website`, `get_what_we_can_claim`, `check_draft_before_publish` (`scan_*` fetches public URLs and writes hosted profiles on server disk).
* **APIs:** `POST /api/eval`, `POST /api/hosted-profile` (hosted profile on server disk; export git via wizard)
* **OAuth for Claude directory:** [CONFIRM] not shipped yet; bearer secret is the v0 gate

## Repos and site

* GitHub: `m-qm/project-brain`
* Site: https://agentkbase.com (EN + ES)
* Monorepo: `packages/core`, `packages/cli`, `packages/mcp`, `apps/web`

## Write path

Git and human edit. MCP and remote tools do not silently write canonical `brain/`.
