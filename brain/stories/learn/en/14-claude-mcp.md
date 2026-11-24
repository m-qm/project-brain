<!-- SYNCED from apps/web/public — run: node scripts/sync-learn-stories.mjs -->
<!-- Not ground truth. Distill claims into brain/facts/ before agents state them as fact. -->

# Claude and remote MCP

Use Agent KBase from **Claude** (or any MCP client with Streamable HTTP) before you write marketing copy. The server is read-only for publishing: it extracts your public site, stores a temporary hosted profile, and checks drafts against facts.

**Production URL (when deployed):** `https://agentkbase.com/mcp`

**Local dev:** `http://localhost:3000/mcp`

## Authentication (required)

`POST /mcp` expects a shared secret. The server **fails closed**: if `MCP_API_KEY` is not set on the host, every request gets **401 Unauthorized**.

1. **Server:** set `MCP_API_KEY` in Vercel (Production + Preview as needed) or in `apps/web/.env.local` for dev. See `apps/web/.env.example`.
2. **Client:** send `Authorization: Bearer <MCP_API_KEY>` on every MCP HTTP request.

### Claude Code

```bash
export MCP_API_KEY='your-long-random-secret'

claude mcp add --transport http agentkbase https://agentkbase.com/mcp \
  --header "Authorization: Bearer $MCP_API_KEY"
```

Local dev:

```bash
claude mcp add --transport http agentkbase http://localhost:3000/mcp \
  --header "Authorization: Bearer $MCP_API_KEY"
```

Or add a custom connector in Claude with the same URL, transport **Streamable HTTP**, and the same header.

OAuth for the Claude directory is still [CONFIRM] on the roadmap; today operators use this bearer token.

## What you can ask

1. **“Scan my site https://my-shop.example and tell me what I can claim.”** → `scan_business_website` then `get_what_we_can_claim`.
2. **“Check this article draft before I post it.”** → `check_draft_before_publish` with your `profileId`.
3. **“Does this LinkedIn caption invent a price?”** → same tool with `checks: offer`.
4. **“What stayed as [CONFIRM] after the scan?”** → read the `brain.openQuestions` in the scan JSON.
5. **“How do I own this in git?”** → export from the [wizard](/wizard); GuruSup-style hosted layers keep truth only on their server — **you get both**.

## Tools

| Tool | Asks for confirmation | What it does |
|------|----------------------|--------------|
| `scan_business_website` | No | Extract public URL → hosted profile + draft facts (server writes profile JSON) |
| `get_what_we_can_claim` | No | Brief text for the profile id |
| `check_draft_before_publish` | No | Eval draft vs facts (prices, proof, title, sources, CTA) |

Write tools (save fact, send for approval) ship later on the paid Act layer.

## Permissions and data

- The server reads **public URLs** you pass to scan. It does not read your private repos.
- Hosted profiles are ephemeral copies for Claude sessions until you export to git.
- **Rate limits:** not enforced in app code yet; abuse protection may rely on Vercel edge / firewall — see `brain/open-questions.md`.

## Local MCP (developers)

For `brain/` in your repo, use the read-only stdio server: [10-mcp](10-mcp.md).

## FAQ

**Your brain is files you own; GuruSup is a hosted layer — we give both.** Export `brain.zip` any time. The remote MCP is for owners who start in Claude without installing the CLI.

**401 from `/mcp`?** Check `MCP_API_KEY` on the server and that your client sends the matching `Authorization: Bearer` header.