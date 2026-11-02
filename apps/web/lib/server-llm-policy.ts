/**
 * Public agentkbase.com must keep server LLM off: unauthenticated /api/* + a shared
 * ANTHROPIC_API_KEY would let anyone run extract/gap-fill on your dime.
 *
 * Enable only on private self-host (auth, rate limits, or trusted team).
 */
export function allowServerLlmInWebApi(): boolean {
  return process.env.AGENTKBASE_ALLOW_SERVER_LLM === "true";
}

/** Build-time flag for wizard UI (set on private deploys only). */
export function hostedLlmWizardEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AGENTKBASE_HOSTED_LLM === "true";
}
