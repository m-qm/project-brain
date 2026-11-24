# @agentkbase/core

Shared library for **Agent KBase**: pack brain files, validate layout, build briefs, evaluate drafts, and extract from public URLs.

Used by `@agentkbase/cli`, `@agentkbase/mcp`, and the [agentkbase.com](https://agentkbase.com) web wizard.

- Repo: [m-qm/project-brain](https://github.com/m-qm/project-brain) (`packages/core`)

## Install

Usually consumed as a dependency of the CLI or MCP:

```bash
npm install @agentkbase/core
```

For app bundlers (browser-safe subset):

```js
import { /* … */ } from "@agentkbase/core/browser";
```

## Exports

| Entry | Use |
|-------|-----|
| `@agentkbase/core` | Node: validate, pack, eval, extract |
| `@agentkbase/core/browser` | Wizard / client-safe APIs |
| `@agentkbase/core/observe` | Eval observation helpers |

See `package.json` `exports` for the full map.

## Docs

Product facts live in the monorepo `brain/` folder. User guides: [agentkbase.com/learn](https://agentkbase.com/learn).

## License

MIT