# Eval and routing patterns (advanced)

Production agents fail when the **wrong tool** returns a **fluent** answer. Agent KBase does not ship a router, but the same discipline applies:

## Golden set

Fixed inputs with expected outcomes. Fail the build when routing or retrieval regresses.

## Tracing

Observe decisions after deploy (Langfuse, Langsmith, etc.). Demos are not traces.

## Deterministic hot paths

Prefer code for tool choice; add model tie breaks only with eval proof and a latency budget.

## Wizard as eval gate

The web wizard blocks export until required fields pass `validateBrainInputStrict`. Same idea: no ship without checks.

## Content loop golden set

The checker is in `@agentkbase/core` (`evalDraft`). Product surfaces:

* `brain eval --dir . --file draft.md` (or `--text`)
* MCP `brain_eval` (read-only; same JSON as the CLI)

Default check is invented prices against `brain/facts/`. `--all` runs the five public review checks. Neither command writes `brain/` or publishes.
