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
* **Tools:** `scan_business_website`, `get_what_we_can_claim`, `check_draft_before_publish`
* **APIs:** `POST /api/eval`, `POST /api/hosted-profile` (hosted profile on server disk; export git via wizard)
* **OAuth for Claude directory:** [CONFIRM] not shipped yet

## Repos and site

* GitHub: `m-qm/project-brain`
* Site: https://agentkbase.com (EN + ES)
* Monorepo: `packages/core`, `packages/cli`, `packages/mcp`, `apps/web`

## Write path

Git and human edit. MCP and remote tools do not silently write canonical `brain/`.
