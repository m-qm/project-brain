import {
  postReviewReply,
  readGoogleBusinessConfig,
  type GoogleBusinessConfig,
} from "../google/business-profile.ts";
import {
  replyToReview,
  type DraftModel,
  type PublicReview,
  type ReviewLoopResult,
} from "./reply-loop.ts";

export type RunReviewOptions = {
  /** A person has to pass true. Anything else leaves the reply unposted. */
  approved?: boolean;
  brief: string;
  evalDraft?: (draft: string) => Promise<unknown>;
  model?: DraftModel;
  /**
   * Explicit client config. `null` means the credentials are missing.
   * When this is omitted, `env` is read (default `process.env`).
   */
  google?: GoogleBusinessConfig | null;
  /** Tests pass `{}` so a developer token in the shell is not used. */
  env?: Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
};

/**
 * Draft or escalate from the brief, then post only when the status is draft
 * and `approved` is true. An escalate never calls the Google reply endpoint.
 */
export async function runReview(review: PublicReview, options: RunReviewOptions): Promise<ReviewLoopResult> {
  const decision = await replyToReview(review, {
    brief: options.brief,
    evalDraft: options.evalDraft,
    model: options.model,
  });

  if (decision.status === "escalate") {
    return decision;
  }

  if (options.approved !== true) {
    return {
      ...decision,
      posted: false,
      reason: "A person has not approved this draft.",
      note: "Not posted.",
    };
  }

  const resolved = resolveGoogle(options);
  if (!resolved.config) {
    return {
      ...decision,
      posted: false,
      reason: resolved.reason,
      note: "Not posted.",
    };
  }
  const config = resolved.config;

  if (!review.id?.trim()) {
    return {
      ...decision,
      posted: false,
      reason: "The review has no id, so the reply was not posted.",
      note: "Not posted.",
    };
  }

  const post = await postReviewReply({
    config,
    reviewId: review.id,
    status: "draft",
    reply: decision.reply,
    approved: true,
    fetchImpl: options.fetchImpl,
  });

  if (!post.posted) {
    return { ...decision, posted: false, reason: post.reason, note: "Not posted." };
  }

  return {
    ...decision,
    posted: true,
    reason: post.reason,
    note: "Posted to Google Business Profile after approval.",
  };
}

function resolveGoogle(options: RunReviewOptions): { config: GoogleBusinessConfig | null; reason: string } {
  if (options.google) return { config: options.google, reason: "" };
  if (options.google === null) {
    return {
      config: null,
      reason: "Missing GOOGLE_BUSINESS_ACCESS_TOKEN, GOOGLE_BUSINESS_ACCOUNT_ID, or GOOGLE_BUSINESS_LOCATION_ID.",
    };
  }
  const read = readGoogleBusinessConfig(options.env ?? process.env);
  if (!read.ok) return { config: null, reason: read.reason };
  return { config: read.config, reason: "" };
}
