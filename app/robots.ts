import type { MetadataRoute } from "next";

import { SITE } from "@/lib/content";

/**
 * Paths no crawler gets, AI or otherwise.
 *
 * Shared, because a named user-agent group REPLACES the `*` group rather than
 * merging with it: any bot listed under its own name stops reading `*`
 * entirely. Without repeating these into the allowed group below, the crawlers
 * we most want here would be the only ones free to walk /api.
 */
const PRIVATE = [
  "/api/",
  /* A headless-capture harness, not a page: no <h1>, and its content is a
     duplicate of the home page's Projects section. */
  "/preview-projects",
];

/**
 * AI crawlers that are allowed, deliberately.
 *
 * Listed by name rather than left to fall through to `*`, so that adding a
 * crawler to AI_BLOCKED below can never quietly capture one of these: the
 * decision is written down where the reversal would happen.
 *
 * Googlebot and Bingbot are absent because they were never in question — they
 * are search crawlers and `*` already allows them. `Google-Extended` is the one
 * that matters here: it is Gemini's training fetcher, entirely separate from
 * Googlebot, and it is allowed on purpose.
 *
 * The OpenAI and Anthropic entries cover both halves of each, which is the
 * point of allowing them — the search and user-initiated agents (OAI-SearchBot,
 * ChatGPT-User, Claude-SearchBot, Claude-User) are what put MEVO into an answer
 * about aluminium windows in Malaysia and cite it back. Blocking the training
 * agent while allowing the search one is a coherent position, but it is not the
 * one asked for here, so both are open.
 */
const AI_ALLOWED = [
  // Google
  "Google-Extended",
  // OpenAI / ChatGPT
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic / Claude
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "Claude-Web",
  "anthropic-ai",
];

/**
 * Everything else that crawls to feed a model. Refused the whole site.
 *
 * These take the copy and send nothing back — no citation, no referral. Note
 * `Applebot-Extended` is Apple Intelligence's training fetcher and is separate
 * from `Applebot`, so refusing it does not affect Siri or Spotlight; and
 * `FacebookBot` is not `facebookexternalhit`, so link previews on Facebook and
 * WhatsApp are unaffected by anything in this list.
 */
const AI_BLOCKED = [
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "Meta-ExternalAgent",
  "meta-externalagent",
  "FacebookBot",
  "PerplexityBot",
  "Perplexity-User",
  "DuckAssistBot",
  "MistralAI-User",
  "YouBot",
  "cohere-ai",
  "cohere-training-data-crawler",
  "Diffbot",
  "omgili",
  "omgilibot",
  "ImagesiftBot",
  "AI2Bot",
  "Timpibot",
  "PanguBot",
  "Kangaroo Bot",
  "Webzio-Extended",
  "PetalBot",
  "Scrapy",
];

/**
 * Note what is NOT disallowed: the dead WooCommerce URLs the WordPress site
 * left indexed — /cart, /checkout, /my-account, /sample-page.
 *
 * Blocking an already-indexed URL is the instinctive move and it is exactly
 * backwards. A blocked URL is never fetched, so the crawler never sees the 404
 * that would remove it, and the entry sits in the index as "indexed, though
 * blocked by robots.txt" indefinitely. They are left crawlable so they can be
 * crawled once, found gone, and dropped. See lib/legacy-urls.ts.
 *
 * None of this is enforcement. robots.txt is a request, honoured by the
 * operators who choose to honour it; a crawler that ignores it is stopped at
 * the CDN or not at all.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE,
      },
      {
        userAgent: AI_ALLOWED,
        allow: "/",
        disallow: PRIVATE,
      },
      {
        userAgent: AI_BLOCKED,
        disallow: "/",
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
