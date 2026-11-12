<!-- SYNCED from apps/web/public — run: node scripts/sync-learn-stories.mjs -->
<!-- Not ground truth. Distill claims into brain/facts/ before agents state them as fact. -->

# Claude and remote MCP

Use Agent KBase from **Claude** (or any MCP client with Streamable HTTP) before you write marketing copy. The server is read-only for publishing: it extracts your public site, stores a temporary hosted profile, and checks drafts against facts.

**Production URL (when deployed):** `https://agentkbase.com/mcp`

**Local dev:** `http://localhost:3000/mcp`

OAuth for Claude directory is in progress. Today the three tools work without login; hosted profiles are stored on the server disk (export **brain.zip** from the [wizard](/wizard) to own files in git).

## Connect (Claude Code, server only)

```bash
claude mcp add --transport http agentkbase https://agentkbase.com/mcp
```

Or add a custom connector in Claude with the same URL and transport **Streamable HTTP**.

## What you can ask

1. **“Scan my site https://my-shop.example and tell me what I can claim.”** → `scan_business_website` then `get_what_we_can_claim`.
2. **“Check this article draft before I post it.”** → `check_draft_before_publish` with your `profileId`.
3. **“Does this LinkedIn caption invent a price?”** → same tool with `checks: offer`.
4. **“What stayed as [CONFIRM] after the scan?”** → read the `brain.openQuestions` in the scan JSON.
5. **“How do I own this in git?”** → export from the [wizard](/wizard); GuruSup-style hosted layers keep truth only on their server — **you get both**.

## Tools

| Tool | Asks for confirmation | What it does |
|------|----------------------|--------------|
| `scan_business_website` | No | Extract public URL → hosted profile + draft facts |
| `get_what_we_can_claim` | No | Brief text for the profile id |
| `check_draft_before_publish` | No | Eval draft vs facts (prices, proof, title, sources, CTA) |

Write tools (save fact, send for approval) ship later on the paid Act layer.

## Permissions and data

- The server reads **public URLs** you pass to scan. It does not read your private repos.
- Hosted profiles are ephemeral copies for Claude sessions until you export to git.
- We log MCP tool calls for abuse protection on the public endpoint. See [privacy](/legal/privacy).

## Local MCP (developers)

For `brain/` in your repo, use the read-only stdio server: [10-mcp](10-mcp.md).

## FAQ

**Your brain is files you own; GuruSup is a hosted layer — we give both.** Export `brain.zip` any time. The remote MCP is for owners who start in Claude without installing the CLI.
