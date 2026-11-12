<!-- SYNCED from apps/web/public — run: node scripts/sync-learn-stories.mjs -->
<!-- Not ground truth. Distill claims into brain/facts/ before agents state them as fact. -->

# Extract from website

Prefill the wizard or CLI from a **public** marketing or docs page.

## Wizard

1. Open `/wizard`.
2. Paste `https://…` and click **Extract from website**.
3. Review every field. Product copy (price, SLA) is not the whole company story until you confirm it.

## CLI

With `@agentkbase/cli` installed (`npm install -g @agentkbase/cli`):

```bash
brain extract-url https://example.com --json
brain extract-url https://example.com --init ./my-app
```

From the monorepo: `pnpm brain extract-url …` (same flags).

### Local LLM test (your key, not Vercel)

The CLI reads **`ANTHROPIC_API_KEY` / `OPENAI_API_KEY` from your shell**, not from Next `.env.local` unless you load it.

**One shot with npx** (published package):

```bash
ANTHROPIC_API_KEY='sk-ant-…' npx @agentkbase/cli extract-url https://auditamia.com/en --deep --json
```

**Monorepo (latest code):** put the key in `apps/web/.env.local`, then:

```bash
pnpm run build:packages
pnpm brain:extract https://auditamia.com/en --deep --json
```

`pnpm brain:extract` sources `apps/web/.env.local` before running `extract-url`.

Success: JSON has `"method": "anthropic"` (or `"openai"`) and scan log steps with `"usedLlm": true`. Without a key you get `"method": "heuristic"` and a warning in `warnings`.

Multi-page and deep scan: [08-multi-page-extract.md](08-multi-page-extract.md).

## How analysis works

1. **Fetch** public HTML (size and timeout limits apply).
2. **Parse** title, meta/OG, headings, and substantive paragraphs.
3. **Synthesize** a company oriented description from the hero section (not meta alone when meta is a short SKU line).
4. **Optional LLM pass:** if `ANTHROPIC_API_KEY` is set (preferred), Claude refines the JSON (`method: "anthropic"`). Otherwise `OPENAI_API_KEY` (`method: "openai"`). Models: `ANTHROPIC_EXTRACT_MODEL` default `claude-3-5-haiku-latest`; `OPENAI_EXTRACT_MODEL` default `gpt-4o-mini`.

Response includes `method`, `warnings`, and `raw` for transparency.

## Limits

* Public http/https only (no localhost or private IPs).
* HTML up to 512KB, 12 second timeout.
* Heuristic synthesis cannot invent customers or metrics not on the page.

Always keep human review before export.

## What extract does *not* do

* **No Cursor skills** — only `brain/facts`, stories, and open questions. Import skills from SkillTree or write `SKILL.md` yourself.
* **No RAG index** — it reads one public URL, not your whole doc corpus.
* **Heuristic vs LLM** — without `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`, synthesis uses headings and body text only; set a key on Vercel or locally for a second pass.

## Richer results

1. Paste the **marketing home** URL (not only `/pricing` unless that is all you have).
2. After extract, add **repo specific** facts: stack, deploy, ICP, metrics.
3. Copy founder notes from `agent.md` or internal docs into `brain/facts/`.
4. For Auditamia-style sites, confirm sample vs live deliverable in open questions.
