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
 * Sends per hour across every IP together.
 *
 * The per-IP budget assumes one address is one sender. Anyone with a pool of
 * addresses — a botnet, or a forged header on a misconfigured proxy — gets five
 * sends from each, and the inbox takes all of them. This is the backstop: well
 * above what a small business receives by hand, far below a flood.
 */
const GLOBAL_SENDS = 40;
const sentGlobally: number[] = [];

/** Tracked IPs. Past this the oldest are evicted, so memory stays flat. */
const MAX_TRACKED = 5_000;

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
  // Deleted before setting, so the map's insertion order is least recently
  // seen first — which is what eviction below walks.
  seen.delete(ip);
  seen.set(ip, current);

  if (seen.size > MAX_TRACKED) {
    for (const [key, value] of seen) {
      if (value.requests.every((at) => at <= cutoff)) seen.delete(key);
    }
    // Sweeping expired entries is not enough on its own: a stream of fresh
    // addresses is all live, so nothing expires and the map, and the sweep
    // over it, keep growing. Drop the stalest down to 80%, which also means
    // this whole block runs once per thousand new addresses, not per request.
    for (const key of seen.keys()) {
      if (seen.size <= MAX_TRACKED * 0.8) break;
      seen.delete(key);
    }
  }

  return current;
}

/**
 * The address the rate limit keys on.
 *
 * X-Forwarded-For is a list every proxy appends to, so its left end is
 * whatever the visitor chose to send and only its right end was written by
 * infrastructure we trust. Reading the leftmost entry lets anyone mint a fresh
 * "IP" per request and walk straight past the limit.
 *
 * - On Vercel the edge overwrites the header with the real client address, so
 *   there the first entry is safe.
 * - Self-hosted, TRUSTED_PROXIES is how many proxies we run in front of the app
 *   (default 1: one nginx or Caddy using `$proxy_add_x_forwarded_for`). The
 *   client is that many entries in from the right. If there is a CDN in front
 *   of the proxy too, that is 2.
 *
 * The app must not be reachable directly, bypassing the proxy: then the whole
 * header is the visitor's, and no reading of it can be trusted.
 */
function clientIp(request: Request) {
  const chain = (request.headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (process.env.VERCEL) return chain[0] ?? "unknown";

  const hops = Number(process.env.TRUSTED_PROXIES ?? 1);
  const trusted = Number.isInteger(hops) && hops >= 1 ? hops : 1;
  return chain[chain.length - trusted] ?? "unknown";
}

/**
 * Whether this request came from our own page.
 *
 * Not authentication — a script can send any Origin it likes. What it stops is
 * a third-party page making its visitors' browsers post here: a `text/plain`
 * form or a no-cors fetch needs no preflight, so without this every visitor to
 * that page becomes a fresh IP with its own mail budget. A browser always sends
 * Origin on a POST and never lets a page forge it.
 */
function fromOwnPage(request: Request) {
  const origin = request.headers.get("origin");
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * The body as text, or null past `max` bytes.
 *
 * `request.text()` buffers the whole body before anything can look at its
 * size, and route handlers have no body limit of their own — so checking the
 * length afterwards still lets one request hold a gigabyte in memory. This
 * refuses on the declared length first and stops reading the moment the
 * stream runs over, whatever the header claimed.
 */
async function readCapped(request: Request, max: number) {
  if (Number(request.headers.get("content-length")) > max) return null;
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
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

  if (!fromOwnPage(request)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  // The form sends JSON. Insisting on it also forces a CORS preflight on any
  // cross-site attempt, which the Origin check above backs up.
  const type = request.headers.get("content-type")?.split(";")[0].trim();
  if (type?.toLowerCase() !== "application/json") {
    return NextResponse.json({ ok: false }, { status: 415 });
  }

  const raw = await readCapped(request, LIMITS.bodyBytes);
  if (raw === null) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Trap one: a field no person can see, let alone fill in.
  if (asText(body.website_url_2)) {
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
  while (sentGlobally.length && sentGlobally[0] <= now - LIMIT.windowMs) {
    sentGlobally.shift();
  }
  if (
    activity.sends.length >= LIMIT.sends ||
    sentGlobally.length >= GLOBAL_SENDS
  ) {
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
  sentGlobally.push(now);
  return NextResponse.json({ ok: true });
}
