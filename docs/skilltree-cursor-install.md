# SkillTree skill in Cursor (local only)

The SkillTree connect link is **one-time**. It creates a skill file with a **private API token**. That file must **not** be committed.

## Where it lives

| Location | When to use |
|----------|-------------|
| `~/.cursor/skills/skilltree/SKILL.md` | Any workspace in Cursor (recommended) |
| `<repo>/.cursor/skills/skilltree/SKILL.md` | Per repo (gitignored in project-brain) |

This repo gitignores `.cursor/skills/skilltree/`.

## Install

1. In SkillTree, copy your connect URL: `https://skilltree.ai/api/connect/sc_…`
2. Run once (replace the URL):

```bash
curl -sS -X POST "YOUR_CONNECT_URL" \
  -H "Content-Type: application/json" \
  -d '{"agentName":"Cursor"}' \
  | node -e "
const fs=require('fs'); const path=require('path');
let d=''; process.stdin.on('data',c=>d+=c);
process.stdin.on('end',()=>{
  const j=JSON.parse(d);
  if(!j.ok){ console.error(j); process.exit(1); }
  const p=path.join(process.env.HOME,'.cursor/skills/skilltree/SKILL.md');
  fs.mkdirSync(path.dirname(p),{recursive:true});
  fs.writeFileSync(p,j.skillMd);
  console.log('Installed', p, 'tree', j.tree?.name);
});"
```

3. Reload Cursor or start a **new Agent** chat.
4. Say: **Upload my writing skills to mq** (or your tree name).

## Agent KBase

`brain/` is separate from SkillTree. Connect SkillTree for **skills**; use Agent KBase for **facts** in git.
