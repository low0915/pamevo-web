import nodemailer, { type Transporter } from "nodemailer";

/**
 * SMTP transport for the enquiry form, built from the environment.
 *
 * Built lazily, on the first request that needs it, and never at module scope.
 * Next evaluates route modules during `next build`, so a transport constructed
 * at import time would make a missing credential a build failure rather than a
 * failed request — the deploy would break for want of a variable the deploy
 * itself is supposed to supply.
 *
 * The transport is cached on the module afterwards: nodemailer pools
 * connections, and rebuilding it per request would open a fresh SMTP handshake
 * every time.
 */
const KEYS = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "CONTACT_TO"] as const;

let cached: Transporter | null = null;

/** Which required variables are absent. Empty means the mailer can be built. */
export function missingMailEnv() {
  return KEYS.filter((key) => !process.env[key]);
}

export function getTransport(): Transporter {
  if (cached) return cached;

  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    // 465 is implicit TLS; 587 upgrades with STARTTLS. Default to the latter,
    // which is what most mailboxes expect.
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return cached;
}

export type Enquiry = {
  name: string;
  email: string;
  phone: string;
  message: string;
  receivedAt: string;
  ip: string;
};

/**
 * Sends one enquiry to the inbox.
 *
 * `from` is always our own mailbox, never the visitor's address: sending as
 * someone else's domain is what SPF and DMARC exist to reject, and the mail
 * would be filed as spam or refused outright. Their address goes in `replyTo`
 * instead, so hitting reply in the inbox still reaches them.
 */
export async function sendEnquiry(enquiry: Enquiry) {
  const lines = [
    `Name:    ${enquiry.name}`,
    `Email:   ${enquiry.email || "-"}`,
    `Phone:   ${enquiry.phone || "-"}`,
    "",
    enquiry.message,
    "",
    "---",
    `Received: ${enquiry.receivedAt}`,
    `Source:   ${enquiry.ip}`,
    "Sent by the enquiry form at paprojects.com.my/contact",
  ];

  await getTransport().sendMail({
    from:
      process.env.CONTACT_FROM ??
      `MEVO Malaysia site <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_TO,
    replyTo: enquiry.email || undefined,
    subject: `Enquiry from ${enquiry.name}`,
    text: lines.join("\n"),
  });
}
