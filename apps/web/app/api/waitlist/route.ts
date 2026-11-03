import { sendWaitlistEmail, type WaitlistPayload } from "../../../lib/waitlist-notify";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Placeholder / example addresses that should not be stored. */
const BLOCKED_EMAILS = new Set([
  "you@company.com",
  "email@example.com",
  "name@company.com",
  "test@test.com",
  "user@example.com",
]);

export async function POST(req: Request) {
  let body: { email?: string; source?: string };
  try {
    body = (await req.json()) as { email?: string; source?: string };
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Valid email required." }, { status: 400 });
  }
  if (BLOCKED_EMAILS.has(email) || email.endsWith("@example.com")) {
    return Response.json(
      { error: "Use your real work email, not the placeholder in the form." },
      { status: 400 },
    );
  }

  const source = body.source?.trim().slice(0, 64) || "company-brain";

  const payload: WaitlistPayload = {
    email,
    source,
    product: "company-brain-pack",
    at: new Date().toISOString(),
  };

  if (!process.env.RESEND_API_KEY?.trim()) {
    return Response.json({ error: "Waitlist is not configured on this server." }, { status: 503 });
  }

  const result = await sendWaitlistEmail(payload);
  if (!result.ok) {
    const domainPending =
      result.detail?.includes("not verified") || result.detail?.includes("validation_error");
    return Response.json(
      {
        error: domainPending
          ? "Waitlist mail is not live yet (domain verification). Email hello@agentkbase.com and we will add you."
          : "Could not save your signup. Try again or email hello@agentkbase.com.",
      },
      { status: domainPending ? 503 : 502 },
    );
  }

  console.info("[waitlist] ok", payload.email, result.channel ?? "domain");

  return Response.json({
    ok: true,
    stored: true,
    subscriberNotified: result.subscriberNotified === true,
  });
}
