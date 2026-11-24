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
* **Auth:** `Authorization: Bearer <MCP_API_KEY>` on every `POST /mcp`; server env `MCP_API_KEY` required (fail closed). See learn/14-claude-mcp and `apps/web/.env.example`.
* **Tools:** `scan_business_website`, `get_what_we_can_claim`, `check_draft_before_publish`
* **APIs:** `POST /api/eval`, `POST /api/hosted-profile` (hosted profile on server disk; export git via wizard)
* **OAuth for Claude directory:** [CONFIRM] not shipped yet; bearer secret is the v0 gate
* **Rate limit on `/mcp`:** [CONFIRM] not in app code; see open questions (H-11c)

## Repos and site

* GitHub: `m-qm/project-brain`
* Site: https://agentkbase.com (EN + ES)
* Monorepo: `packages/core`, `packages/cli`, `packages/mcp`, `apps/web`

## Write path

Git and human edit. MCP and remote tools do not silently write canonical `brain/`.
