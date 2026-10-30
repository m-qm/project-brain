# Import skills from SkillTree

Agent KBase owns **truth and stories**. [SkillTree](https://skilltree.ai) owns **skills** (how to do tasks).

## Order

1. Generate or init your brain (CLI or wizard).
2. Unzip or init into your repo root.
3. Paste your SkillTree connect message into the agent **once** (per SkillTree docs).
4. Keep editing `brain/facts/` in git. Refresh skills when SkillTree updates.

## Mental model

| Layer | Where |
|-------|--------|
| Skills | SkillTree / Cursor skills |
| Facts & stories | `brain/` in your repo |
| Session memory (optional) | Engram MCP |

Do not store secrets in either layer.
