# First brain in 15 minutes

Install the CLI from npm (recommended) or from the **Agent KBase** OSS repo (`project-brain` on GitHub).

## From npm

```bash
npm install -g @agentkbase/cli
brain setup -n "My Product" -d "What we do in one sentence" ~/path/to/your-repo
brain validate --dir ~/path/to/your-repo
brain brief --dir ~/path/to/your-repo
```

With a public site draft: `brain setup --url https://yourproduct.com -n "My Product" ~/path/to/your-repo`

## From source (monorepo)

### Full agent KB in one command

Creates `brain/`, Cursor rules, and `.engram/config.json` in **your** project folder.

```bash
# 1) From project-brain repo (once)
pnpm install
pnpm run build:packages

# 2) Scaffold into your app repo (change the path)
pnpm brain setup \
  -n "My Product" \
  -d "What we do in one sentence" \
  ~/path/to/your-repo
```

### With a public site draft

```bash
pnpm brain setup \
  --url https://yourproduct.com \
  -n "My Product" \
  ~/path/to/your-repo
```

Review extracted facts in `brain/facts/project.md` before you trust them.

### After setup

```bash
pnpm brain validate --dir ~/path/to/your-repo
pnpm brain brief --dir ~/path/to/your-repo
```

Paste the brief into Cursor chat, or reference `@brain/` in the repo you opened.

Enable **Engram MCP** in Cursor once so agents use memory alongside `brain/`.

## Legacy: brain files only

```bash
pnpm brain init ./my-app
```

Prefer `setup` so agents load Engram rules in parallel.

## Web wizard

Open the wizard in the browser, export a zip, unzip at your repo root. Prefer CLI `setup` for Engram config; see [Engram doc](05-engram.md).

## Terminal help

If markdown in the browser is hard to read, run:

```bash
pnpm brain quickstart
```

Plain text steps for the terminal (no formatting).
