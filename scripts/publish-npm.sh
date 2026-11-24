#!/usr/bin/env bash
# Publish @agentkbase/* to the npm registry (run from repo root after npm login).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! npm whoami >/dev/null 2>&1; then
  echo "Not logged in to npm. Run: npm login"
  echo "Or export NPM_TOKEN and use: npm config set //registry.npmjs.org/:_authToken \"\$NPM_TOKEN\""
  exit 1
fi

echo "Building packages…"
pnpm run build:packages

publish_pkg() {
  local name="$1"
  echo ""
  echo "Publishing ${name}…"
  pnpm --filter "${name}" publish --access public --no-git-checks
}

# core first (cli + mcp depend on it)
publish_pkg @agentkbase/core
publish_pkg @agentkbase/cli
publish_pkg @agentkbase/mcp

echo ""
echo "Done. Check https://www.npmjs.com/package/@agentkbase/cli (and core, mcp)."