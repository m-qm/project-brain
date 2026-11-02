# Import skills from SkillTree

Agent KBase owns **truth and stories**. [SkillTree](https://skilltree.ai) owns **skills** (how to do tasks).

## Order

1. Generate or init your brain (CLI or wizard).
2. Unzip or init into your repo root.
3. Connect SkillTree **once** (link expires after first use):
   * In SkillTree, copy your `https://skilltree.ai/api/connect/sc_…` URL.
   * `POST` to that URL with `{"agentName":"Cursor"}` (or run the connect flow in SkillTree UI).
   * Save the returned `SKILL.md` under **`.cursor/skills/skilltree/SKILL.md`** in this repo (gitignored; contains a private token).
   * Reload Cursor or open a new Agent chat in this workspace.
4. Keep editing `brain/facts/` in git. Refresh skills when SkillTree updates.

**Agent KBase tree on SkillTree:** `mq` (skills layer). **Brain** stays in `brain/` (facts layer).

## Mental model

| Layer | Where |
|-------|--------|
| Skills | SkillTree / Cursor skills |
| Facts & stories | `brain/` in your repo |
| Session memory (optional) | Engram MCP |

Do not store secrets in any layer.
