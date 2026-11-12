<!-- SYNCED from apps/web/public — run: node scripts/sync-learn-stories.mjs -->
<!-- Not ground truth. Distill claims into brain/facts/ before agents state them as fact. -->

# Open questions

Agents guess when context runs out. Open questions are an explicit **stop list**.

## Rules

* If work depends on an unanswered item, the agent asks you.
* Use `[CONFIRM]` in drafts the human will review.
* Empty confirm placeholders fail `brain validate` with a warning.

## Examples

* [CONFIRM] Production URL
* [CONFIRM] Whether feature X is in scope for v1

When you learn the answer, move it to `brain/facts/` and remove it from open questions.
