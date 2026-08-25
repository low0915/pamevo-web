import { NextResponse } from "next/server";

import { missingMailEnv, sendEnquiry } from "@/lib/mail";

/** nodemailer opens a TCP socket, which the Edge runtime cannot do. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Field bounds. The client enforces the same ones; this is the copy that
 *  counts, since nothing arriving over the wire can be trusted. */
const LIMITS = {
  name: { min: 2, max: 80 },
  message: { min: 10, max: 2000 },
  /** Digits, after separators are stripped. Malaysian mobiles are 9-11. */
  phoneDigits: { min: 8, max: 15 },
  /** A whole request. Anything larger is not a person filling in a form. */
  bodyBytes: 8_000,
};

/** How long a human takes to fill this in, at the absolute fastest. */
const MIN_ELAPSED_MS = 3_000;
/** ...and the ceiling past which the timestamp is not credible. Two days. */
const MAX_ELAPSED_MS = 172_800_000;

/**
 * Two ceilings per IP, per hour, because they answer different questions.
 *
 * `requests` is the abuse ceiling: it counts everything, including the ones
 * turned away, so a script hammering the endpoint is cut off. `sends` is the
 * mail budget, and only successful sends count against it.
 *
 * Counting rejections against the mail budget was the obvious first version and
 * it is wrong: somebody who mistypes their email five times would be locked out
 * of the form for an hour, having never sent anything. The person making
 * mistakes and the script making requests need different limits.
 */
const LIMIT = { requests: 30, sends: 5, windowMs: 3_600_000 };

/**
 * Recent activity per IP.
 *
 * In memory, which means it resets on redeploy and is per-instance: on a
 * serverless host with several warm workers the real ceiling is a multiple of
 * these numbers. It stops casual scraping and a stuck submit button, not a
 * determined attacker. A shared store is the upgrade, and a new dependency
 * with it.
 */
type Activity = { requests: number[]; sends: number[] };
const seen = new Map<string, Activity>();

function activityFor(ip: string, now: number): Activity {
  const cutoff = now - LIMIT.windowMs;
  const previous = seen.get(ip) ?? { requests: [], sends: [] };
  const current: Activity = {
    requests: previous.requests.filter((at) => at > cutoff),
    sends: previous.sends.filter((at) => at > cutoff),
  };
  seen.set(ip, current);

  // Sweep on the way past, so the map cannot grow without bound.
  if (seen.size > 5_000) {
    for (const [key, value] of seen) {
      if (value.requests.every((at) => at <= cutoff)) seen.delete(key);
    }
  }

  return current;
}

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

const asText = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const looksLikeEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;

const phoneDigits = (value: string) => value.replace(/\D/g, "");

/**
 * The enquiry endpoint.
 *
 * Checks run cheapest first, so a flood costs as little as possible: the rate
 * limit before parsing, the traps before validation, validation before the
 * network call to the mail server.
 *
 * The two spam traps answer with the same 400 as a validation failure and no
 * explanation. Telling a bot which check caught it is telling its author how
 * to pass next time.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const now = Date.now();
  const activity = activityFor(ip, now);

  activity.requests.push(now);
  if (activity.requests.length > LIMIT.requests) {
    return NextResponse.json(
      { ok: false, reason: "rate-limited" },
      { status: 429 },
    );
  }

  const raw = await request.text();
  if (raw.length > LIMITS.bodyBytes) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Trap one: a field no person can see, let alone fill in.
  if (asText(body.company)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Trap two: filled in faster than the form can be read.
  const elapsed = Number(body.elapsed);
  if (
    !Number.isFinite(elapsed) ||
    elapsed < MIN_ELAPSED_MS ||
    elapsed > MAX_ELAPSED_MS
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const name = asText(body.name);
  const email = asText(body.email);
  const phone = asText(body.phone);
  const message = asText(body.message);

  const invalid =
    name.length < LIMITS.name.min ||
    name.length > LIMITS.name.max ||
    message.length < LIMITS.message.min ||
    message.length > LIMITS.message.max ||
    // One way to reply is the whole requirement; which one is the sender's call.
    (!email && !phone) ||
    (!!email && !looksLikeEmail(email)) ||
    (!!phone &&
      (phoneDigits(phone).length < LIMITS.phoneDigits.min ||
        phoneDigits(phone).length > LIMITS.phoneDigits.max));

  if (invalid) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // The mail budget, checked only now that the payload is known to be a real
  // enquiry: the ones turned away above cost nothing to refuse and should not
  // spend anybody's allowance.
  if (activity.sends.length >= LIMIT.sends) {
    return NextResponse.json(
      { ok: false, reason: "rate-limited" },
      { status: 429 },
    );
  }

  // Checked here rather than at import: route modules are evaluated during
  // `next build`, and a missing credential must fail one request, not a deploy.
  const missing = missingMailEnv();
  if (missing.length > 0) {
    console.error(
      `[contact] not configured; missing ${missing.join(", ")}`,
    );
    return NextResponse.json(
      { ok: false, reason: "unconfigured" },
      { status: 503 },
    );
  }

  try {
    await sendEnquiry({
      name,
      email,
      phone,
      message,
      receivedAt: new Date().toISOString(),
      ip,
    });
  } catch (error) {
    // The enquiry is lost if this throws, so it is logged in full: the server
    // log is the only remaining copy of what someone tried to send.
    console.error("[contact] send failed", { name, email, phone, error });
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  activity.sends.push(now);
  return NextResponse.json({ ok: true });
}
