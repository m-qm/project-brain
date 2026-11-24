# @agentkbase/mcp

Read-only **MCP** server for a local `brain/` directory (stdio). Agents can brief, search, read facts, list open questions, validate, and eval drafts — without writing git truth.

- Site: [agentkbase.com](https://agentkbase.com)
- Learn: [Claude and remote MCP](https://agentkbase.com/learn/14-claude-mcp) (hosted scan/check on the website is separate from this package)

## Install

```bash
npm install -g @agentkbase/mcp
```

Requires **Node.js 20+**.

## Cursor / Claude Desktop (stdio)

Point MCP at a repo that contains `brain/AGENTS.md`:

```json
{
  "mcpServers": {
    "agentkbase": {
      "command": "npx",
      "args": ["-y", "@agentkbase/mcp"],
      "env": {
        "BRAIN_DIR": "/absolute/path/to/your/repo"
      }
    }
  }
}
```

Or run `agentkbase-mcp` from a global install with `BRAIN_DIR` set.

## Tools (read-only)

Examples: `brain_brief`, `brain_search`, `brain_read`, `brain_validate`, `brain_eval`, `brain_open_questions`. The server does **not** create or edit `brain/` files.

## Remote MCP

Streamable HTTP on `https://agentkbase.com/mcp` (scan + check against hosted profiles) is documented on the site; it is not this stdio package.

## License

MIT