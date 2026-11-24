# Content & ads brain (operator loop)

Configured brain and HITL workers for Agent KBase marketing. Not part of the open-core publish path.

## Layout

- `brain/agents/article.md` — article worker instructions
- `brain/agents/linkedin.md` — LinkedIn worker instructions
- `brain/content/article-slate.md` — Google-gap topic slate
- `brain/content/articles/` — article drafts (`status: pending` until a human approves)
- `brain/content/linkedin/` — LinkedIn drafts (only after article is published)

## Rules

- Workers **do not** write `apps/web/public/blog/`, call LinkedIn APIs, or deploy.
- A human copies approved markdown to the site repo and merges after `brain eval --all`.
- Cursor rules: `.cursor/rules/article-agent.mdc`, `linkedin-agent.mdc`, `blog-search-gap.mdc`.

This tree may stay gitignored on operator machines; `brain/agents/*.md` should stay in sync with any versioned copy in `docs/security/`.