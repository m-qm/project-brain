import type { PublicReview } from "../reviews/reply-loop.ts";

/**
 * Google Business Profile reviews, checked against the docs on 2026-11-10:
 * - list: GET https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews
 *   https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list
 * - reply: PUT https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews/{reviewId}/reply
 *   https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/updateReply
 *   body: { "comment": string } (ReviewReply). Verified locations only.
 *
 * Google has to approve Business Profile API access for the Cloud project.
 * The location owner has to connect that location. The OAuth scope is
 * https://www.googleapis.com/auth/business.manage. This file does not start
 * an OAuth flow and does not store a token.
 */

export const GOOGLE_BUSINESS_ACCESS_TOKEN = "GOOGLE_BUSINESS_ACCESS_TOKEN";
export const GOOGLE_BUSINESS_ACCOUNT_ID = "GOOGLE_BUSINESS_ACCOUNT_ID";
export const GOOGLE_BUSINESS_LOCATION_ID = "GOOGLE_BUSINESS_LOCATION_ID";

const REVIEWS_ORIGIN = "https://mybusiness.googleapis.com/v4";

const STAR_RATING: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

export type GoogleBusinessConfig = {
  accessToken: string;
  accountId: string;
  locationId: string;
};

export type GoogleEnv = {
  ok: true;
  config: GoogleBusinessConfig;
} | {
  ok: false;
  reason: string;
};

export type ListReviewsResult = {
  reviews: PublicReview[];
  error?: string;
};

export type PostReplyInput = {
  config: GoogleBusinessConfig;
  reviewId: string;
  status: "draft" | "escalate";
  reply?: string;
  approved?: unknown;
  fetchImpl?: typeof fetch;
};

export type PostReplyResult = {
  posted: boolean;
  reason: string;
};

export function readGoogleBusinessConfig(env: Record<string, string | undefined>): GoogleEnv {
  const missing: string[] = [];
  const accessToken = env[GOOGLE_BUSINESS_ACCESS_TOKEN]?.trim() ?? "";
  const accountId = env[GOOGLE_BUSINESS_ACCOUNT_ID]?.trim() ?? "";
  const locationId = env[GOOGLE_BUSINESS_LOCATION_ID]?.trim() ?? "";
  if (!accessToken) missing.push(GOOGLE_BUSINESS_ACCESS_TOKEN);
  if (!accountId) missing.push(GOOGLE_BUSINESS_ACCOUNT_ID);
  if (!locationId) missing.push(GOOGLE_BUSINESS_LOCATION_ID);
  if (missing.length > 0) {
    return { ok: false, reason: `Missing ${missing.join(", ")}.` };
  }
  return { ok: true, config: { accessToken, accountId, locationId } };
}

export function reviewsListUrl(accountId: string, locationId: string): string {
  const account = pathSegment(accountId, "accounts");
  const location = pathSegment(locationId, "locations");
  return `${REVIEWS_ORIGIN}/accounts/${encodeURIComponent(account)}/locations/${encodeURIComponent(location)}/reviews?pageSize=50`;
}

export function reviewReplyUrl(accountId: string, locationId: string, reviewId: string): string {
  const account = pathSegment(accountId, "accounts");
  const location = pathSegment(locationId, "locations");
  const review = reviewId.trim();
  return `${REVIEWS_ORIGIN}/accounts/${encodeURIComponent(account)}/locations/${encodeURIComponent(location)}/reviews/${encodeURIComponent(review)}/reply`;
}

/** True only for a draft a person has approved, with reply text and no [CONFIRM] gap. */
export function canPostReply(input: { status: string; approved: unknown; reply?: string }): boolean {
  return (
    input.status === "draft" &&
    input.approved === true &&
    Boolean(input.reply?.trim()) &&
    !input.reply?.includes("[CONFIRM]")
  );
}

export async function listGoogleReviews(
  config: GoogleBusinessConfig | null | undefined,
  options: { fetchImpl?: typeof fetch } = {},
): Promise<ListReviewsResult> {
  if (!config?.accessToken || !config.accountId || !config.locationId) {
    return {
      reviews: [],
      error: `Missing ${GOOGLE_BUSINESS_ACCESS_TOKEN}, ${GOOGLE_BUSINESS_ACCOUNT_ID}, or ${GOOGLE_BUSINESS_LOCATION_ID}.`,
    };
  }
  const fetchImpl = options.fetchImpl ?? fetch;
  const response = await fetchImpl(reviewsListUrl(config.accountId, config.locationId), {
    method: "GET",
    headers: authHeaders(config.accessToken, false),
  });
  if (!response.ok) {
    return { reviews: [], error: `Google Business Profile replied HTTP ${response.status}.` };
  }
  const body = (await response.json()) as { reviews?: unknown };
  const reviews = Array.isArray(body.reviews) ? body.reviews.map(toReview) : [];
  return { reviews };
}

/**
 * PUT the review reply. Refuses an escalate, a draft that is not approved,
 * a missing review id, and missing credentials. Those paths do not call fetch.
 */
export async function postReviewReply(input: PostReplyInput): Promise<PostReplyResult> {
  if (input.status === "escalate") {
    return { posted: false, reason: "An escalate is not posted." };
  }
  if (input.approved !== true) {
    return { posted: false, reason: "A draft is not posted without approved: true." };
  }
  if (!canPostReply(input)) {
    return { posted: false, reason: "The reply is empty or still has a [CONFIRM] gap. Not posted." };
  }
  const reply = input.reply?.trim() ?? "";
  if (Buffer.byteLength(reply) > 4096) {
    return { posted: false, reason: "The reply is over 4096 bytes. Not posted." };
  }
  if (!input.reviewId.trim()) {
    return { posted: false, reason: "The review has no id. Not posted." };
  }
  if (!input.config?.accessToken || !input.config.accountId || !input.config.locationId) {
    return {
      posted: false,
      reason: `Missing ${GOOGLE_BUSINESS_ACCESS_TOKEN}, ${GOOGLE_BUSINESS_ACCOUNT_ID}, or ${GOOGLE_BUSINESS_LOCATION_ID}. Not posted.`,
    };
  }

  const fetchImpl = input.fetchImpl ?? fetch;
  const response = await fetchImpl(reviewReplyUrl(input.config.accountId, input.config.locationId, input.reviewId), {
    method: "PUT",
    headers: authHeaders(input.config.accessToken, true),
    body: JSON.stringify({ comment: reply }),
  });
  if (!response.ok) {
    return { posted: false, reason: `Google Business Profile replied HTTP ${response.status}. Not posted.` };
  }
  return { posted: true, reason: "Posted to Google Business Profile after approval." };
}

function authHeaders(token: string, json: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

function pathSegment(value: string, prefix: string): string {
  const trimmed = value.trim().replace(/^\/+|\/+$/g, "");
  const head = `${prefix}/`;
  return trimmed.startsWith(head) ? trimmed.slice(head.length) : trimmed;
}

function toReview(value: unknown): PublicReview {
  const row = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const reviewer = row.reviewer && typeof row.reviewer === "object" ? (row.reviewer as Record<string, unknown>) : {};
  const anonymous = reviewer.isAnonymous === true;
  const displayName = typeof reviewer.displayName === "string" ? reviewer.displayName.trim() : "";
  const star = typeof row.starRating === "string" ? STAR_RATING[row.starRating] : undefined;
  return {
    id: typeof row.reviewId === "string" ? row.reviewId : undefined,
    author: anonymous || !displayName ? "Anonymous" : displayName,
    rating: star ?? 0,
    text: typeof row.comment === "string" ? row.comment : "",
  };
}
