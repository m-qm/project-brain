# Content loop brain (Agent KBase)

Two agents, one git brain, a human in the middle.

| Agent | Spec | Command |
| --- | --- | --- |
| Article | `brain/agents/article.md` | `node workers/run.mjs article` |
| LinkedIn | `brain/agents/linkedin.md` | `node workers/run.mjs linkedin` |

`@agentkbase/mcp` stays read-only. See [docs/11-content-ads-workers.md](../../docs/11-content-ads-workers.md).

## Local loop

```bash
node workers/run.mjs article
node workers/run.mjs review article-02
node workers/run.mjs approve article-02
node workers/run.mjs publish
node workers/run.mjs linkedin
```

`linkedin` stays idle until an article is `published`. That is the point. It drafts one caption per published article that does not already have a `li-*` item. Nothing is posted.

Instagram (`ig`) and ads remain as later commands.

## Validate the brain

```bash
brain validate --dir examples/content-ads-brain
brain brief --dir examples/content-ads-brain
```

From the monorepo root: `pnpm brain validate --dir examples/content-ads-brain`.
