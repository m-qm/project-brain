const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BLOCKED_EMAILS = new Set([
  "you@company.com",
  "email@example.com",
  "name@company.com",
  "test@test.com",
  "user@example.com",
]);

const SEGMENT_NAME = "Mailing list";

export type GuideSignupInput = {
  email: string;
  mailingList: boolean;
  locale: string;
  source: string;
};

export type GuideSignupResult =
  | { ok: true; mailingList: boolean }
  | { ok: false; status: number; error: string };

type ResendResult = { ok: boolean; status: number; text: string };

let segmentIdPromise: Promise<string | null> | null = null;

export function parseGuideSignup(body: {
  email?: string;
  mailingList?: boolean;
  locale?: string;
  source?: string;
}): { ok: true; value: GuideSignupInput } | { ok: false; error: string } {
  const email = body.email?.trim().toLowerCase() ?? "";
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Valid email required." };
  if (BLOCKED_EMAILS.has(email) || email.endsWith("@example.com")) {
    return { ok: false, error: "Use your real work email, not the placeholder in the form." };
  }
  const locale = body.locale === "es" ? "es" : "en";
  const source = body.source?.trim().slice(0, 64) || "guide";
  return {
    ok: true,
    value: {
      email,
      mailingList: body.mailingList === true,
      locale,
      source,
    },
  };
}

async function resend(
  apiKey: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<ResendResult> {
  const res = await fetch(`https://api.resend.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { ok: res.ok, status: res.status, text: await res.text() };
}

async function mailingSegmentId(apiKey: string): Promise<string | null> {
  const fromEnv = process.env.RESEND_SEGMENT_ID?.trim();
  if (fromEnv) return fromEnv;
  segmentIdPromise ??= findOrCreateSegment(apiKey).catch((err) => {
    segmentIdPromise = null;
    throw err;
  });
  return segmentIdPromise;
}

async function findOrCreateSegment(apiKey: string): Promise<string | null> {
  const listed = await resend(apiKey, "GET", "/segments");
  if (listed.ok) {
    const json = JSON.parse(listed.text) as { data?: { id: string; name: string }[] };
    const found = json.data?.find((segment) => segment.name === SEGMENT_NAME);
    if (found?.id) return found.id;
  }
  const created = await resend(apiKey, "POST", "/segments", { name: SEGMENT_NAME });
  if (!created.ok) {
    console.error("[guide] could not create mailing segment", created.status, created.text.slice(0, 300));
    return null;
  }
  const json = JSON.parse(created.text) as { id?: string };
  return json.id ?? null;
}

function alreadyExists(result: ResendResult): boolean {
  return result.status === 409 || /already exists/i.test(result.text);
}

/** Store the address in Resend Contacts. The tick subscribes them to the mailing list. */
export async function saveGuideSignup(input: GuideSignupInput): Promise<GuideSignupResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, status: 503, error: "The list is not set up on this server yet." };
  }

  const segmentId = input.mailingList ? await mailingSegmentId(apiKey) : null;
  const emailPath = encodeURIComponent(input.email);
  const createBody: {
    email: string;
    unsubscribed: boolean;
    segments?: { id: string }[];
  } = {
    email: input.email,
    unsubscribed: !input.mailingList,
  };
  if (segmentId) createBody.segments = [{ id: segmentId }];

  try {
    const created = await resend(apiKey, "POST", "/contacts", createBody);
    if (!created.ok && !alreadyExists(created)) {
      console.error("[guide] create contact failed", created.status, created.text.slice(0, 300));
      return {
        ok: false,
        status: 502,
        error: "Could not save your email. Try again or email hello@agentkbase.com.",
      };
    }

    if (alreadyExists(created)) {
      const updated = await resend(apiKey, "PATCH", `/contacts/${emailPath}`, {
        unsubscribed: !input.mailingList,
      });
      if (!updated.ok) {
        console.error("[guide] update contact failed", updated.status, updated.text.slice(0, 300));
        return {
          ok: false,
          status: 502,
          error: "Could not save your email. Try again or email hello@agentkbase.com.",
        };
      }
      if (segmentId) {
        const segment = await resend(
          apiKey,
          input.mailingList ? "POST" : "DELETE",
          `/contacts/${emailPath}/segments/${segmentId}`,
        );
        if (!segment.ok && segment.status !== 404 && segment.status !== 409) {
          console.error("[guide] segment update failed", segment.status, segment.text.slice(0, 300));
        }
      }
    }

    console.info("[guide] stored", input.source, input.locale, input.mailingList ? "list" : "guide-only");
    return { ok: true, mailingList: input.mailingList };
  } catch (err) {
    const message = err instanceof Error ? err.message : "resend fetch failed";
    console.error("[guide] resend error", message);
    return {
      ok: false,
      status: 502,
      error: "Could not save your email. Try again or email hello@agentkbase.com.",
    };
  }
}
