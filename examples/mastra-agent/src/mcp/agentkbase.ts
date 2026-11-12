import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { MCPClient } from "@mastra/mcp";

const brainDir = process.env.BRAIN_DIR;
if (!brainDir) {
  throw new Error("Set BRAIN_DIR to the repo root that contains brain/.");
}

const localServer = fileURLToPath(new URL("../../../../packages/mcp/dist/index.js", import.meta.url));
const useLocal = existsSync(localServer);

export const agentkbaseMcp = new MCPClient({
  id: "agentkbase",
  servers: {
    agentkbase: useLocal
      ? {
          command: process.execPath,
          args: [localServer],
          env: { BRAIN_DIR: brainDir },
        }
      : {
          command: "npx",
          args: ["-y", "@agentkbase/mcp"],
          env: { BRAIN_DIR: brainDir },
        },
  },
});
