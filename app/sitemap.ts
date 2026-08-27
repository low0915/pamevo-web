import type { MetadataRoute } from "next";

import { SEO, SITE } from "@/lib/content";
import { PRODUCTS } from "@/lib/products";

/**
 * Hand-maintained dates, deliberately not `new Date()`.
 *
 * Google does read <lastmod>, but only from sitemaps whose lastmod it has
 * learned to trust. A build-time `new Date()` claims every page changed on
 * every deploy — including the deploy that touched one CSS variable — and a
 * few rounds of that and the signal is discarded for the whole domain. Bump
 * the entry by hand when that page's copy actually changes.
 *
 * A build-time date would also make the output non-deterministic, so two builds
 * of the same commit would differ.
 */
const UPDATED = {
  home: "2026-08-27",
  products: "2026-08-27",
  contact: "2026-08-27",
  privacy: "2026-08-27",
} as const;

/**
 * Absolute, and encoded. At least one asset filename carries a space
 * (`aluminium profile-propduct.png`), which is not legal in a <loc> unescaped.
 */
const asset = (src: string) => `${SITE.url}${encodeURI(src)}`;

/**
 * No `changeFrequency` and no `priority` anywhere below. Google has said it
 * ignores both, and Bing effectively does too — they are two more fields to
 * keep honest for no return, so they are omitted rather than guessed at.
 *
 * /preview-projects is absent on purpose; it is a capture harness and is
 * noindexed at the page and disallowed in robots.ts.
 *
 * There is no per-product URL to list: all twenty live in the catalogue on
 * /our-products. The product photography is attached to that one entry instead,
 * as an image sitemap — it is the strongest asset the catalogue has, and the
 * one thing a spec table cannot substitute for.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      lastModified: UPDATED.home,
    },
    {
      url: `${SITE.url}${SEO.products.path}`,
      lastModified: UPDATED.products,
      images: PRODUCTS.flatMap((product) =>
        product.images.map((image) => asset(image.src)),
      ),
    },
    {
      url: `${SITE.url}${SEO.contact.path}`,
      lastModified: UPDATED.contact,
    },
    {
      url: `${SITE.url}${SEO.privacy.path}`,
      lastModified: UPDATED.privacy,
    },
  ];
}
