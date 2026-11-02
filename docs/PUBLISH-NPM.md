# Publish to npm (`@agentkbase`)

Scoped packages require an npm **organization** whose name matches the scope.

1. Create org **agentkbase** at [npmjs.com](https://www.npmjs.com/org/create) (free tier is fine for public packages).
2. Log in: `npm whoami` → your user must be an owner of `@agentkbase`.
3. Build and publish from repo root:

```bash
pnpm run build:packages
pnpm publish -r --access public --no-git-checks
```

Publishing requires **2FA OTP** (`--otp=…`) or a granular token with bypass 2FA.

Packages (order matters via workspace deps):

* `@agentkbase/templates`
* `@agentkbase/core`
* `@agentkbase/mcp` (bin: `agentkbase-mcp`)
* `@agentkbase/cli` (bin: `brain`)

Verify:

```bash
npm view @agentkbase/cli version
npm view @agentkbase/mcp version
npm install -g @agentkbase/cli
brain quickstart
```

Public pages:

* https://www.npmjs.com/package/@agentkbase/cli
* https://www.npmjs.com/package/@agentkbase/mcp
* https://www.npmjs.com/org/agentkbase

After publish, the README npm badge and site install snippet point at the live package.
