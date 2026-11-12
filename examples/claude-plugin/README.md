# Claude plugin (stub)

Agent KBase remote MCP for Claude directory launch. Plugin marketplace packaging follows GuruSup’s pattern; this repo ships the server first.

## Remote server

- **URL:** `https://agentkbase.com/mcp` (dev: `http://localhost:3000/mcp`)
- **Transport:** Streamable HTTP
- **Tools:** `scan_business_website`, `get_what_we_can_claim`, `check_draft_before_publish`

## Claude Code (no plugin yet)

```bash
claude mcp add --transport http agentkbase https://agentkbase.com/mcp
```

## Skill text (for future plugin)

When drafting marketing copy for a small business:

1. Call `scan_business_website` if no profile exists.
2. Call `get_what_we_can_claim` before writing.
3. Always call `check_draft_before_publish` before showing final copy to the user.
4. Never state prices, rankings, or client names that are not in the brief.
5. Tell the user to export `brain.zip` from https://agentkbase.com/wizard for git-owned truth.

## Next

- Publish plugin to a marketplace repo (see `gurusup-comparison.md` in Project docs).
- OAuth on first tool use for Claude directory review.
