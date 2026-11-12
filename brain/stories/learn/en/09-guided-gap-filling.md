<!-- SYNCED from apps/web/public — run: node scripts/sync-learn-stories.mjs -->
<!-- Not ground truth. Distill claims into brain/facts/ before agents state them as fact. -->

# Guided gap filling

Open questions in `brain/open-questions.md` mark what agents must **not** guess. Gap fill **suggests draft answers** from your current facts and story. Suggestions are not facts until you accept them.

## Wizard

On the **Gaps** step, click **Suggest draft answers**. Review each suggestion and **Apply as [CONFIRM] note** or edit manually. Export still requires `validateBrainInputStrict`.

## CLI

```bash
brain fill-gaps --dir ./my-app
brain fill-gaps --dir ./my-app --json
```

Requires `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` in the environment.

## Rules

* No automatic write to `brain/` except what you apply in the wizard or edit by hand.
* Do not treat LLM drafts as metrics or customer proof without confirmation.
* After editing, run `brain validate --dir .`.
