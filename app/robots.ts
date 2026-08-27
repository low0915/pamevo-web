import type { MetadataRoute } from "next";

import { SITE } from "@/lib/content";

/**
 * Note what is NOT disallowed: the dead WooCommerce URLs the WordPress site
 * left indexed — /cart, /checkout, /my-account, /sample-page.
 *
 * Blocking an already-indexed URL is the instinctive move and it is exactly
 * backwards. A blocked URL is never fetched, so the crawler never sees the 404
 * that would remove it, and the entry sits in the index as "indexed, though
 * blocked by robots.txt" indefinitely. They are left crawlable so they can be
 * crawled once, found gone, and dropped. See lib/legacy-urls.ts.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        /* A headless-capture harness, not a page: no <h1>, and its content is
           a duplicate of the home page's Projects section. */
        "/preview-projects",
      ],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
