# Agent KBase

**Skills tell the agent what it can do. Agent KBase tells it what is true. Engram remembers what you already decided across chats.**

Open source **agent knowledge base** for Cursor: curated facts in git (`brain/`), optional Engram, CLI + web wizard at [agentkbase.com](https://agentkbase.com).

*Repo name:* `project-brain` on GitHub. Not affiliated with [projectbrain.tools](https://www.projectbrain.tools/).

Generate a **knowledge base in git** (`brain/`) plus **Engram config and Cursor rules** so agents consult both in parallel:

```bash
pnpm brain setup -n "My Product" --url https://yoursite.com
```

Import skills from [SkillTree](https://skilltree.ai) or Cursor skills. Same pack from CLI or web wizard.

## Quick start (CLI)

**From npm** (after publish):

```bash
npm install -g @agentkbase/cli
brain setup ./my-app -n "My Product" -d "One line mission"
brain validate --dir ./my-app
brain brief --dir ./my-app
```

**From source:** run these from the **repository root** (`project-brain/`), not from `packages/cli`.

```bash
pnpm install
pnpm build          # templates → core → cli → web (see docs/BUILD.md if dev acts weird)
pnpm brain setup ./my-app -n "My Product" -d "One line mission"
pnpm brain validate --dir ./my-app
pnpm brain brief --dir ./my-app
```

Validate the included example:

```bash
pnpm validate:example
```

Or call the CLI directly:

```bash
node packages/cli/dist/index.js init ./my-app
node packages/cli/dist/index.js validate --dir ./examples/fictional-saas-brain
```

## Web wizard

```bash
pnpm dev
```

Do not append extra words to that command (some shells pass them to Next.js and break dev).

`pnpm dev` rebuilds `templates`, `core`, and `cli` first so the wizard matches the latest code.

If you see missing chunk errors (`951.js`) or 500 on every page: stop dev, run `pnpm clean`, then `pnpm dev` again. Details: [docs/BUILD.md](docs/BUILD.md).

Then open [http://localhost:3000](http://localhost:3000) or [https://agentkbase.com](https://agentkbase.com), use **Try wizard**, export `brain.zip`, unzip into your project.

**Extract from website:** paste a public URL in step 1 of the wizard, or run `pnpm brain extract-url https://yoursite.com --init ./my-app`. See [docs/07-extract-from-website.md](docs/07-extract-from-website.md).

Deploy: see [docs/DEPLOY-VERCEL.md](docs/DEPLOY-VERCEL.md).

## Monorepo

| Path | Role |
|------|------|
| [packages/core](packages/core) | validate, pack, brief, zip (shared) |
| [packages/templates](packages/templates) | markdown templates |
| [packages/cli](packages/cli) | `brain` CLI |
| [apps/web](apps/web) | landing + wizard |
| [docs](docs) | tutorials |
| [examples/fictional-saas-brain](examples/fictional-saas-brain) | sample brain |

## Docs

1. [First brain in 15 minutes](docs/01-first-brain.md)
2. [Facts vs stories](docs/02-facts-vs-stories.md)
3. [Open questions](docs/03-open-questions.md)
4. [SkillTree import](docs/04-import-skills-skilltree.md)
5. [Engram (optional)](docs/05-engram.md)
6. [Application mode (optional)](docs/06-application-mode.md)
7. [Eval and routing patterns (advanced)](docs/advanced/eval-and-routing.md)

## License

MIT
