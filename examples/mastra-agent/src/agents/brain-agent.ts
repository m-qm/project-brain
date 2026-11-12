import { Agent } from "@mastra/core/agent";
import { agentkbaseMcp } from "../mcp/agentkbase";

export const brainAgent = new Agent({
  id: "brain-agent",
  name: "Brain agent",
  instructions: `Answer from the Agent KBase brain.
Call the brief tool before you answer.
Quote a gap as [CONFIRM].
Refuse a price, a client, or a claim that is not in the brief.
The eval tool checks a draft for an invented price.
Do not write brain/. Do not publish.`,
  model: process.env.MASTRA_MODEL ?? "openai/gpt-4o-mini",
  tools: await agentkbaseMcp.listTools(),
});
