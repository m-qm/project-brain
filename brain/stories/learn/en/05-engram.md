<!-- SYNCED from apps/web/public — run: node scripts/sync-learn-stories.mjs -->
<!-- Not ground truth. Distill claims into brain/facts/ before agents state them as fact. -->

# Engram + Agent KBase (parallel layers)

Agents should consult **two knowledge sources**, not one:

| Layer | Where | Best for |
|-------|--------|----------|
| **Agent KBase** | `brain/` in git | Offers, constraints, stories, `[CONFIRM]` gaps — team reviewed |
| **Engram** | MCP memory store | Decisions, bugfixes, session summaries — cross-chat continuity |

SkillTree skills are a third layer (how to work). Brain + Engram answer **what is true** and **what we already decided**.

## One CLI command

From your repo root:

```bash
brain setup --name "Auditamia" --url https://auditamia.com/es
```

Or without URL:

```bash
brain setup -n "My SaaS" -d "One line mission"
```

This writes:

* `brain/` (AGENTS.md, facts, stories, open questions)
* `.cursor/rules/project-brain.mdc` (load git truth first)
* `.cursor/rules/engram.mdc` (mem_context / mem_save protocol)
* `.engram/config.json` (Engram project slug)

Enable **Engram MCP** in Cursor once. After that, every session:

1. Rules tell the agent to read `brain/` **and** call `mem_context`.
2. Durable team facts → edit `brain/facts/`.
3. Session discoveries → `mem_save`; end with `mem_session_summary`.

## Manual tweaks

* Change Engram slug: edit `.engram/config.json` → `project`.
* Disable Engram for a repo: `brain setup --no-engram`.

## vs SkillTree interview

SkillTree builds skills and can interview for a hosted second brain. Agent KBase is **local, git first, OSS**: you own the files, validate before export, optional URL extract. Use both: SkillTree for skill packs, Agent KBase + Engram for repo native KB.
