# Multi-page extract

Optional scan beyond the URL you paste in the wizard or CLI.

## Modes

| Mode | Flag / wizard | Behavior |
|------|----------------|----------|
| **single** | default | One page (previous behavior). |
| **multipage** | `--multipage` / “Scan extra pages” | Same-site links scored heuristically (`/about`, `/pricing`, …), up to **5 pages** total. |
| **deep** | `--deep` / “Deep scan” | One LLM call picks paths from candidates; requires `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`. Falls back to heuristic if no key. |

## CLI

```bash
brain extract-url https://example.com --multipage --json
brain extract-url https://example.com --deep --json
brain setup --url https://example.com --multipage ./my-app
```

JSON includes `scanMode`, `pagesFetched[]`, and `warnings`.

## Limits

* Same registrable host only; public http/https (see `url-security` in `@agentkbase/core`).
* Per page 512KB HTML; ~1.2MB total crawl budget.
* Serial fetch in v1 (slower but safer on Vercel).

Always review merged facts before export. Validation is unchanged.
