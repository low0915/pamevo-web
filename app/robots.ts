import type { MetadataRoute } from "next";

import { SITE } from "@/lib/content";

/**
 * Crawlers that exist to feed a model rather than to send a reader.
 *
 * Split into two lists because they cost different things to block, and whoever
 * revisits this should be able to reverse one without the other.
 *
 * TRAINING crawlers take the copy to train on and send nothing back. Blocking
 * them costs no traffic — Google-Extended and Applebot-Extended in particular
 * are separate from Googlebot and Applebot, so refusing them does not affect
 * Google Search ranking or Siri and Spotlight results at all.
 */
const AI_TRAINING = [
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-Web",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "Meta-ExternalAgent",
  "meta-externalagent",
  "FacebookBot",
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
 * ASSISTANT and SEARCH crawlers are the ones with a real cost. These fetch a
 * page in order to answer a question and cite it, or because a person has
 * pasted the URL into an assistant and asked about it. Blocking them removes
 * MEVO from ChatGPT, Perplexity and Claude answers about aluminium windows in
 * Malaysia — which for a brand with almost no organic presence is a channel
 * given up, not just a leak closed.
 *
 * Blocked here because the instruction was to disallow AI crawlers, and doing
 * half of it silently would be worse than doing it. If the referral traffic
 * turns out to matter more than the training exposure, this is the list to
 * delete from — the one above can stay.
 */
const AI_ASSISTANTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "DuckAssistBot",
  "MistralAI-User",
  "YouBot",
  "Applebot-Extended-Search",
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
 * A named group wins over `*` outright rather than merging with it, so the
 * AI groups below do not need the /api and /preview-projects lines repeated:
 * they are refused the whole site regardless.
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
        disallow: [
          "/api/",
          /* A headless-capture harness, not a page: no <h1>, and its content
             is a duplicate of the home page's Projects section. */
          "/preview-projects",
        ],
      },
      {
        userAgent: AI_TRAINING,
        disallow: "/",
      },
      {
        userAgent: AI_ASSISTANTS,
        disallow: "/",
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
