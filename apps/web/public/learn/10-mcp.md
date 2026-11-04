# Agent KBase MCP

`@agentkbase/mcp` is a local, read-only [MCP](https://modelcontextprotocol.io) server. It exposes the same brief and validation as the `brain` CLI, plus list, read, and search over `brain/`.

Git stays the write path. The server does not create, edit, or delete facts.

## Install in Cursor

Merge this into `.cursor/mcp.json`. Leave any servers you already have in place.

```json
{
  "mcpServers": {
    "agentkbase": {
      "command": "npx",
      "args": ["-y", "@agentkbase/mcp"]
    }
  }
}
```

Cursor starts the process with your repo as the working directory. The server uses that directory when it contains `brain/AGENTS.md`. Otherwise it checks `BRAIN_DIR`, then walks up to 8 parent directories.

From a checkout of this repository, before the package is published:

```json
{
  "mcpServers": {
    "agentkbase": {
      "command": "node",
      "args": ["packages/mcp/dist/index.js"],
      "env": {
        "BRAIN_DIR": "examples/fictional-saas-brain"
      }
    }
  }
}
```

`brain setup` prints the `npx` snippet. It does not write `.cursor/mcp.json` for you.

## Tools

| Tool | Returns |
|------|---------|
| `brain_brief` | Same text as `brain brief` |
| `brain_validate` | JSON `{ dir, ok, issues }`, same checks as `brain validate` |
| `brain_eval` | JSON `{ dir, ok, issues }`. Draft vs `brain/facts`. Default: invented prices. Does not write or publish. Same as `brain eval` |
| `brain_list` | Markdown paths under `brain/` |
| `brain_read` | One file. The real path must stay inside `brain/` |
| `brain_search` | Case-insensitive hits with path and line (50 max) |
| `brain_open_questions` | Questions from `brain/open-questions.md` |

`brain_read` rejects `..`, absolute paths, and symlinks that resolve outside `brain/`. `brain_list` and `brain_search` omit those symlinks.

Every tool is marked read-only. Pass `dir` when the brain is not in the working directory.

## What this is not

* Not a place to save decisions. That is Engram (`mem_save`). Team facts still land in git.
* Not a hosted API. The files stay in the repo on the machine running the server.
* Not website extract. Use `brain extract-url` for that.
* Not Instagram publishing, Meta Ads, or WhatsApp send. Those connectors are a separate paid Act layer with human approval. They will not ship inside this read-only MCP. See [Content and ads workers](11-content-ads-workers.md).
