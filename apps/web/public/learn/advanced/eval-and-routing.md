# Eval and routing patterns (advanced)

Production agents fail when the **wrong tool** returns a **fluent** answer. Agent KBase does not ship a router, but the same discipline applies:

## Golden set

Fixed inputs with expected outcomes. Fail the build when routing or retrieval regresses.

## Tracing

`brain validate`, `brain eval`, `brain brief`, `brain fill-gaps`, `brain extract-url`, and the MCP tools export a Langfuse span when both `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY` are set. `LANGFUSE_BASE_URL` points at a self-hosted instance. Leave the keys unset and nothing is sent.

Each span records the call name, pass or fail, issue codes, hit counts, and file paths. Fact text, drafts, and search lines stay on the machine. Set `LANGFUSE_TRACE_CONTENT=1` to include those bodies, truncated to 2,000 characters.

A client can join the server span to its own trace by sending a W3C `traceparent` on the MCP request `_meta`. One MCP process shares a Langfuse session until the client sends `sessionId` or `langfuseSessionId` in that same `_meta`.

Demos are not traces. `LANGFUSE_LOG_LEVEL=INFO` writes to stdout and will break the stdio MCP server; the default level for this process is `ERROR`.

## Deterministic hot paths

Prefer code for tool choice; add model tie breaks only with eval proof and a latency budget.

## Wizard as eval gate

The web wizard blocks export until required fields pass `validateBrainInputStrict`. Same idea: no ship without checks.

## Content loop golden set

The checker is in `@agentkbase/core` (`evalDraft`). Product surfaces:

* `brain eval --dir . --file draft.md` (or `--text`)
* MCP `brain_eval` (read-only; same JSON as the CLI)

Default check is invented prices against `brain/facts/`. `--all` runs the five public review checks. Neither command writes `brain/` or publishes.
