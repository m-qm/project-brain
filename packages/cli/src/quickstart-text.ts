export function quickstartText(): string {
  return `
Agent KBase — quick start
===========================

From npm (recommended):

  npm install -g @agentkbase/cli
  brain setup -n "My Product" -d "One line mission" ~/path/to/your-repo

From source (project-brain repo on GitHub):

  pnpm install
  pnpm run build:packages
  pnpm brain setup -n "My Product" -d "One line mission" ~/path/to/your-repo

With a public website draft:

  pnpm brain setup --url https://yoursite.com -n "My Product" ~/path/to/your-repo

Check the output:

  pnpm brain validate --dir ~/path/to/your-repo
  pnpm brain brief --dir ~/path/to/your-repo

What you get in the target repo:
  brain/              facts, stories, AGENTS.md
  .cursor/rules/      when to load brain + Engram
  .engram/config.json Engram project slug (optional MCP)

Open the target repo in Cursor. Enable Engram MCP in settings if you use it.

Docs: https://agentkbase.com/learn  (or pnpm dev → localhost:3000/learn)
`.trimStart();
}
