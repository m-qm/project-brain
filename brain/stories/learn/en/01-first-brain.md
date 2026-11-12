<!-- SYNCED from apps/web/public — run: node scripts/sync-learn-stories.mjs -->
<!-- Not ground truth. Distill claims into brain/facts/ before agents state them as fact. -->

# First brain in 15 minutes

Goal: a **validated `brain/`** folder in your repo that Cursor agents can read before they act.

## Install

```bash
npm install -g @agentkbase/cli
```

No install? [Web wizard](https://agentkbase.com/wizard) → export `brain.zip` → unzip at your repo root. For Engram config and Cursor rules in one step, prefer CLI `setup` ([Engram + brain](05-engram.md)).

## Scaffold (recommended)

```bash
brain setup -n "My Product" -d "What we do in one sentence" ~/path/to/your-repo
```

Draft facts from a **public** homepage (always review before export):

```bash
brain setup -n "My Product" --url https://yourproduct.com ~/path/to/your-repo
```

Check `brain/facts/project.md` and `brain/open-questions.md` after URL extract.

## Validate and use

```bash
brain validate --dir ~/path/to/your-repo
brain brief --dir ~/path/to/your-repo
```

Paste the brief into Cursor chat, or `@`-mention files under `brain/`.

Enable **Engram MCP** in Cursor if you want cross-session memory alongside git truth ([guide](05-engram.md)).

## Contributors (from source)

Run from the [project-brain](https://github.com/m-qm/project-brain) repository root:

```bash
pnpm install
pnpm run build:packages
pnpm brain setup -n "My Product" -d "One line mission" ~/path/to/your-repo
pnpm brain validate --dir ~/path/to/your-repo
```

Use `pnpm brain …` anywhere this doc says `brain …`.

## Legacy: files only

```bash
brain init ./my-app
```

Creates `brain/` without Engram or Cursor rules. Prefer `setup`.

## Terminal quickstart

```bash
brain quickstart
```

Plain-text steps when you are not in the browser. The studio path is [Paste your site](12-what-you-sell.md). This page is the install.
