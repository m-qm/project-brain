# @agentkbase/cli

CLI to scaffold, validate, and brief an **Agent KBase** `brain/` folder for Cursor and other agents.

- Site: [agentkbase.com](https://agentkbase.com)
- Repo: [m-qm/project-brain](https://github.com/m-qm/project-brain) (`packages/cli`)

## Install

```bash
npm install -g @agentkbase/cli
```

Requires **Node.js 20+**.

## Quick start

```bash
brain setup ./my-studio -n "My Studio" --url https://example.com
brain validate --dir ./my-studio
brain brief --dir ./my-studio
```

Review facts and open questions before agents rely on the export. See [What you can say on your site](https://agentkbase.com/learn/12-what-you-sell).

## Common commands

| Command | Purpose |
|---------|---------|
| `brain setup` | Create `brain/`, Cursor rules, optional URL extract |
| `brain validate` | Check required brain files |
| `brain brief` | Print context pack for agents |
| `brain eval` | Run publish checks on draft text |
| `brain extract-url` | Draft brain fields from a public URL |
| `brain search` | Search brain markdown |

Run `brain --help` for the full list.

## MCP (local)

Read-only MCP over your repo’s `brain/` is in [`@agentkbase/mcp`](../mcp/README.md) (separate package).

## License

MIT