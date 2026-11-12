import { agentkbaseMcp } from "./agentkbase.ts";

type ToolExecute = (input: unknown, context?: unknown) => Promise<unknown>;

/**
 * Read `brain_brief` and, when the server lists it, `brain_eval`.
 * Both tools stay read-only. Requires BRAIN_DIR, same as the agent.
 */
export async function loadBrain(): Promise<{
  brief: string;
  evalDraft: (draft: string) => Promise<unknown | null>;
}> {
  const tools = await agentkbaseMcp.listTools();
  const brief = await callNamedTool(tools, "brain_brief", {});
  if (!brief.trim()) {
    throw new Error("brain_brief returned an empty pack.");
  }
  return {
    brief,
    evalDraft: async (draft: string) => {
      const evalTool = findTool(tools, "brain_eval");
      if (!evalTool) return null;
      return callTool(evalTool, { draft, checks: "offer" });
    },
  };
}

async function callNamedTool(
  tools: Record<string, { execute?: ToolExecute }>,
  name: string,
  args: unknown,
): Promise<string> {
  const tool = findTool(tools, name);
  if (!tool) {
    throw new Error(`${name} is not available from the Agent KBase MCP client.`);
  }
  return textFrom(await callTool(tool, args));
}

function findTool(
  tools: Record<string, { execute?: ToolExecute }>,
  name: string,
): ToolExecute | undefined {
  const direct = tools[name]?.execute ?? tools[`agentkbase_${name}`]?.execute;
  if (direct) return direct;
  const match = Object.entries(tools).find(([key]) => key === name || key.endsWith(`_${name}`));
  return match?.[1]?.execute;
}

async function callTool(execute: ToolExecute, args: unknown): Promise<unknown> {
  const result = await execute(args, {});
  if (result && typeof result === "object" && "isError" in result && (result as { isError?: boolean }).isError) {
    throw new Error(textFrom(result) || "The Agent KBase tool returned an error.");
  }
  return result;
}

function textFrom(result: unknown): string {
  if (typeof result === "string") return result;
  if (result && typeof result === "object" && "content" in result) {
    const content = (result as { content?: Array<{ text?: string }> }).content;
    return content?.map((block) => block.text ?? "").join("\n") ?? "";
  }
  return "";
}
