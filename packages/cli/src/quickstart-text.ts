export function reviewAfterExtractText(): string {
  return `
Review the draft before you use it
===================================
  1. Cross out any service, price, or deadline you do not sell.
  2. Write who you serve, and what you will not claim.
  3. Ask what a client would ask. The answer has to be in brain/ or marked [CONFIRM].
  4. Nothing goes live until you say yes.

Guide: https://agentkbase.com/learn/12-what-you-sell
`.trim();
}

export function quickstartText(): string {
  return `
Agent KBase — quick start
===========================

Studio or consultancy (start here):

  npm install -g @agentkbase/cli
  brain setup ./my-studio -n "Studio name" --url https://your-studio.com

${reviewAfterExtractText()}

Then:

  brain validate --dir ./my-studio
  brain brief --dir ./my-studio

Builders, from a repo checkout:

  pnpm install
  pnpm run build:packages
  pnpm brain setup ./my-app -n "My Product" -d "One line mission"

What you get in the target repo:
  brain/              facts, stories, AGENTS.md
  .cursor/rules/      when to load brain + Engram
  .engram/config.json Engram project slug (optional MCP)

Open the target repo in Cursor. Enable Engram MCP in settings if you use it.

Install guide: https://agentkbase.com/learn/01-first-brain
`.trimStart();
}
