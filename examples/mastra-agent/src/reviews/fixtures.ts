import type { PublicReview } from "./reply-loop.ts";

/** Pack shaped like `brain brief` for Taskflow Lite. Tests use this instead of MCP. */
export const FIXTURE_BRIEF = `# Context pack (Agent KBase)

## brain/AGENTS.md

You are helping on **Taskflow Lite**, a fictional SaaS for small teams to track tasks and weekly goals.

* Stack is Next.js and Postgres; no mobile app in v1.
* Auth is email magic link only until SSO is decided.

## brain/facts/project.md

* Web app: Next.js 15, Postgres, deployed on Vercel.
* Users: internal dogfood only; no public launch yet.
* Billing: not implemented in v1.
* Anything not listed above must be confirmed with the project owner before you state it as fact.

## brain/open-questions.md

* [CONFIRM] Target price for pro tier
* [CONFIRM] Whether SSO ships in Q1 or Q2
`;

export const sampleReviews: readonly PublicReview[] = [
  {
    id: "calm-5",
    author: "Ana",
    rating: 5,
    text: "Clear weekly goals and the task list is easy to follow. Thanks.",
  },
  {
    id: "angry-1",
    author: "Luis",
    rating: 1,
    text: "Horrible. This is an estafa. I want a refund and I will never again use this.",
  },
  {
    id: "price-ask",
    author: "Marta",
    rating: 5,
    text: "Looks useful. What is the price for the pro tier?",
  },
];
