/** True only on private deploys that set NEXT_PUBLIC_AGENTKBASE_HOSTED_LLM=true */
export const wizardHostedLlmEnabled =
  process.env.NEXT_PUBLIC_AGENTKBASE_HOSTED_LLM === "true";

export const CLI_LLM_EXTRACT_HINT =
  "npx @agentkbase/cli extract-url YOUR_URL --deep --json";

export const CLI_LLM_GAP_HINT = "brain fill-gaps --dir ./your-brain";
