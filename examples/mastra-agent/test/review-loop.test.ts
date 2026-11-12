import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canPostReply,
  listGoogleReviews,
  postReviewReply,
  readGoogleBusinessConfig,
  reviewReplyUrl,
  reviewsListUrl,
  type GoogleBusinessConfig,
} from "../src/google/business-profile.ts";
import { FIXTURE_BRIEF, sampleReviews } from "../src/reviews/fixtures.ts";
import { evalReportsInventedPrice, replyToReview } from "../src/reviews/reply-loop.ts";
import { runReview } from "../src/reviews/run-review.ts";

const google: GoogleBusinessConfig = {
  accessToken: "test-token",
  accountId: "acct-1",
  locationId: "loc-1",
};

const calmReply =
  "Thanks, Ana. Taskflow Lite. Web app: Next.js 15, Postgres, deployed on Vercel. Users: internal dogfood only; no public launch yet.";

function throwingFetch(label: string): typeof fetch {
  return async () => {
    throw new Error(`${label}: Google was called`);
  };
}

test("three sample reviews draft or escalate and do not post", async () => {
  const [calm, angry, price] = sampleReviews;
  const calmResult = await replyToReview(calm, { brief: FIXTURE_BRIEF });
  const angryResult = await replyToReview(angry, { brief: FIXTURE_BRIEF });
  const priceResult = await replyToReview(price, { brief: FIXTURE_BRIEF });

  assert.equal(calmResult.status, "draft");
  assert.equal(calmResult.posted, false);
  assert.equal(calmResult.reply, calmReply);
  assert.equal(calmResult.note, "Not posted.");
  assert.doesNotMatch(calmResult.reply ?? "", /€|\$|\bprice\b/i);

  assert.equal(angryResult.status, "escalate");
  assert.equal(angryResult.posted, false);
  assert.equal(angryResult.reply, undefined);
  assert.match(angryResult.reason ?? "", /Rating is 1/);
  assert.match(angryResult.reason ?? "", /hostile/);
  assert.match(angryResult.reason ?? "", /\[CONFIRM\] Target price for pro tier/);
  assert.equal(angryResult.note, "Not posted.");

  assert.equal(priceResult.status, "escalate");
  assert.equal(priceResult.posted, false);
  assert.equal(priceResult.reply, undefined);
  assert.match(priceResult.reason ?? "", /\[CONFIRM\] price/);
  assert.match(priceResult.reason ?? "", /Not posted/);
  assert.ok(priceResult.gaps.some((gap) => gap.includes("[CONFIRM]")));

  console.log(
    JSON.stringify(
      {
        calm: { status: calmResult.status, posted: calmResult.posted, reply: calmResult.reply },
        angry: { status: angryResult.status, posted: angryResult.posted, reason: angryResult.reason },
        price: { status: priceResult.status, posted: priceResult.posted, reason: priceResult.reason },
      },
      null,
      2,
    ),
  );
});

test("escalate never calls the Google reply endpoint, even when approved", async () => {
  const fetchImpl = throwingFetch("escalate");
  for (const review of [sampleReviews[1], sampleReviews[2]]) {
    const result = await runReview(review, {
      approved: true,
      brief: FIXTURE_BRIEF,
      google,
      env: {},
      fetchImpl,
    });
    assert.equal(result.status, "escalate");
    assert.equal(result.posted, false);
    assert.equal(result.reply, undefined);
  }

  const refused = await postReviewReply({
    config: google,
    reviewId: "angry-1",
    status: "escalate",
    reply: "Sorry about that.",
    approved: true,
    fetchImpl,
  });
  assert.equal(refused.posted, false);
  assert.match(refused.reason, /not posted/i);
});

test("a draft without approved true is not posted", async () => {
  const fetchImpl = throwingFetch("unapproved");
  const result = await runReview(sampleReviews[0], {
    approved: false,
    brief: FIXTURE_BRIEF,
    google,
    env: {},
    fetchImpl,
  });
  assert.equal(result.status, "draft");
  assert.equal(result.posted, false);
  assert.equal(result.reply, calmReply);
  assert.match(result.reason ?? "", /not approved/i);

  const direct = await postReviewReply({
    config: google,
    reviewId: "calm-5",
    status: "draft",
    reply: calmReply,
    approved: "true",
    fetchImpl,
  });
  assert.equal(direct.posted, false);
  assert.equal(canPostReply({ status: "draft", approved: "true", reply: calmReply }), false);
  assert.equal(canPostReply({ status: "escalate", approved: true, reply: calmReply }), false);
});

test("missing Google env returns posted false and does not call Google", async () => {
  const fetchImpl = throwingFetch("missing-env");
  const env = readGoogleBusinessConfig({});
  assert.equal(env.ok, false);
  if (!env.ok) {
    assert.match(env.reason, /GOOGLE_BUSINESS_ACCESS_TOKEN/);
    assert.match(env.reason, /GOOGLE_BUSINESS_ACCOUNT_ID/);
    assert.match(env.reason, /GOOGLE_BUSINESS_LOCATION_ID/);
  }

  const result = await runReview(sampleReviews[0], {
    approved: true,
    brief: FIXTURE_BRIEF,
    env: {},
    fetchImpl,
  });
  assert.equal(result.status, "draft");
  assert.equal(result.posted, false);
  assert.match(result.reason ?? "", /GOOGLE_BUSINESS_ACCESS_TOKEN/);

  const listed = await listGoogleReviews(null, { fetchImpl });
  assert.deepEqual(listed.reviews, []);
  assert.match(listed.error ?? "", /GOOGLE_BUSINESS_ACCESS_TOKEN/);
});

test("an approved draft posts with PUT and a listed review uses GET", async () => {
  const calls: Array<{ url: string; method: string; body?: string; authorization: string }> = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    const headers = new Headers(init?.headers);
    calls.push({
      url,
      method: init?.method ?? "GET",
      body: typeof init?.body === "string" ? init.body : undefined,
      authorization: headers.get("authorization") ?? "",
    });
    if (url.endsWith("/reply")) {
      return Response.json({ comment: calmReply, updateTime: "2026-11-10T00:00:00Z" });
    }
    return Response.json({
      reviews: [
        {
          reviewId: "rev-1",
          reviewer: { displayName: "Ana", isAnonymous: false },
          starRating: "FIVE",
          comment: "Clear weekly goals and the task list is easy to follow. Thanks.",
        },
        {
          reviewId: "rev-2",
          reviewer: { isAnonymous: true },
          starRating: "ONE",
          comment: "Horrible.",
        },
      ],
    });
  };

  const listed = await listGoogleReviews(google, { fetchImpl });
  assert.equal(listed.error, undefined);
  assert.equal(listed.reviews.length, 2);
  assert.deepEqual(listed.reviews[0], {
    id: "rev-1",
    author: "Ana",
    rating: 5,
    text: "Clear weekly goals and the task list is easy to follow. Thanks.",
  });
  assert.equal(listed.reviews[1]?.author, "Anonymous");
  assert.equal(listed.reviews[1]?.rating, 1);
  assert.equal(calls[0]?.method, "GET");
  assert.equal(calls[0]?.url, reviewsListUrl("acct-1", "loc-1"));
  assert.equal(calls[0]?.authorization, "Bearer test-token");

  const posted = await runReview(sampleReviews[0], {
    approved: true,
    brief: FIXTURE_BRIEF,
    google,
    env: {},
    fetchImpl,
  });
  assert.equal(posted.status, "draft");
  assert.equal(posted.posted, true);
  assert.equal(posted.reply, calmReply);
  assert.match(posted.note, /Posted/);
  const replyCall = calls.find((call) => call.method === "PUT");
  assert.ok(replyCall);
  assert.equal(replyCall?.url, reviewReplyUrl("acct-1", "loc-1", "calm-5"));
  assert.deepEqual(JSON.parse(replyCall?.body ?? "{}"), { comment: calmReply });
  assert.equal(calls.filter((call) => call.url.endsWith("/reply")).length, 1);
});

test("a polite 2-star and a hostile 5-star escalate with no reply", async () => {
  const low = await replyToReview(
    { author: "Sam", rating: 2, text: "The app crashed once." },
    { brief: FIXTURE_BRIEF },
  );
  assert.equal(low.status, "escalate");
  assert.equal(low.reply, undefined);
  assert.match(low.reason ?? "", /Rating is 2/);

  const hostile = await replyToReview(
    { author: "Sam", rating: 5, text: "Horrible experience." },
    { brief: FIXTURE_BRIEF },
  );
  assert.equal(hostile.status, "escalate");
  assert.equal(hostile.reply, undefined);
  assert.match(hostile.reason ?? "", /horrible/i);
});

test("a client or a date that is not in the brief escalates", async () => {
  const client = await replyToReview(
    { author: "Nora", rating: 4, text: "Who is the client?" },
    { brief: FIXTURE_BRIEF },
  );
  assert.equal(client.status, "escalate");
  assert.match(client.reason ?? "", /\[CONFIRM\] client name/);
  assert.equal(client.reply, undefined);

  const date = await replyToReview(
    { author: "Nora", rating: 4, text: "When will you launch?" },
    { brief: FIXTURE_BRIEF },
  );
  assert.equal(date.status, "escalate");
  assert.match(date.reason ?? "", /\[CONFIRM\] date/);
});

test("brain_eval invented price escalates and is not posted", async () => {
  const fetchImpl = throwingFetch("eval");
  const result = await runReview(sampleReviews[0], {
    approved: true,
    brief: FIXTURE_BRIEF,
    google,
    env: {},
    fetchImpl,
    model: async () => "Happy to help. The team will follow up.",
    evalDraft: async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify({ ok: false, issues: [{ code: "invented_price", detail: "49 €" }] }),
        },
      ],
    }),
  });
  assert.equal(evalReportsInventedPrice({ ok: false, issues: [{ code: "invented_price" }] }), true);
  assert.equal(result.status, "escalate");
  assert.equal(result.posted, false);
  assert.equal(result.reply, undefined);
  assert.match(result.reason ?? "", /invented price/);
});
