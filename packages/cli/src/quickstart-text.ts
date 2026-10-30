export function quickstartText(): string {
  return `
Agent KBase — quick start
===========================

Run these from the project-brain repository (Agent KBase OSS; clone from GitHub).

  pnpm install
  pnpm run build:packages

Scaffold a full agent knowledge base into YOUR project:

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
