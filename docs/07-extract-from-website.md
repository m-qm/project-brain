# Extract from website

Prefill the wizard or CLI from a **public** marketing or docs page.

## Wizard

1. Open `/wizard`.
2. Paste `https://…` and click **Extract from website**.
3. Review every field. Product copy (price, SLA) is not the whole company story until you confirm it.

## CLI

```bash
pnpm brain extract-url https://example.com --json
pnpm brain extract-url https://example.com --init ./my-app
```

## How analysis works

1. **Fetch** public HTML (size and timeout limits apply).
2. **Parse** title, meta/OG, headings, and substantive paragraphs.
3. **Synthesize** a company oriented description from the hero section (not meta alone when meta is a short SKU line).
4. **Optional:** if `OPENAI_API_KEY` is set on the server or CLI environment, an LLM pass refines the JSON (`method: "openai"` in output). Model defaults to `gpt-4o-mini`; override with `OPENAI_EXTRACT_MODEL`.

Response includes `method`, `warnings`, and `raw` for transparency.

## Limits

* Public http/https only (no localhost or private IPs).
* HTML up to 512KB, 12 second timeout.
* Heuristic synthesis cannot invent customers or metrics not on the page.

Always keep human review before export.

## What extract does *not* do

* **No Cursor skills** — only `brain/facts`, stories, and open questions. Import skills from SkillTree or write `SKILL.md` yourself.
* **No RAG index** — it reads one public URL, not your whole doc corpus.
* **Heuristic vs LLM** — without `OPENAI_API_KEY`, synthesis uses headings and body text only; set the key on Vercel or locally for a second pass.

## Richer results

1. Paste the **marketing home** URL (not only `/pricing` unless that is all you have).
2. After extract, add **repo specific** facts: stack, deploy, ICP, metrics.
3. Copy founder notes from `agent.md` or internal docs into `brain/facts/`.
4. For Auditamia-style sites, confirm sample vs live deliverable in open questions.
