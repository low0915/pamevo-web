import type { MetadataRoute } from "next";

import { SEO, SEO_ZH, SITE } from "@/lib/content";
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
 * The hreflang pair for a page that has one, in the form the sitemap wants.
 *
 * Repeated on BOTH URLs of a pair, and each set includes the URL it sits on.
 * That is not redundancy — hreflang has to be reciprocal or Google discards the
 * annotation, and a page that does not name itself is treated as an incomplete
 * set.
 */
const pair = (enPath: string, zhPath: string) => ({
  languages: {
    en: `${SITE.url}${enPath === "/" ? "" : enPath}`,
    "zh-Hans": `${SITE.url}${zhPath}`,
    "x-default": `${SITE.url}${enPath === "/" ? "" : enPath}`,
  },
});

/**
 * No `changeFrequency` and no `priority` anywhere below. Google has said it
 * ignores both, and Bing effectively does too — they are two more fields to
 * keep honest for no return, so they are omitted rather than guessed at.
 *
 * /preview-projects is absent on purpose; it is a capture harness, noindexed at
 * the page and disallowed in robots.ts.
 *
 * /privacy appears once, in English, with NO alternates. It has no Chinese
 * version and claiming one would be a lie in the one file crawlers read most
 * literally.
 *
 * There is no per-product URL to list: all twenty live in the catalogue. The
 * product photography is attached to that entry instead, in both languages,
 * since the images are the same images either way.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const productImages = PRODUCTS.flatMap((product) =>
    product.images.map((image) => asset(image.src)),
  );

  return [
    {
      url: SITE.url,
      lastModified: UPDATED.home,
      alternates: pair(SEO.home.path, SEO_ZH.home.path),
    },
    {
      url: `${SITE.url}${SEO.products.path}`,
      lastModified: UPDATED.products,
      alternates: pair(SEO.products.path, SEO_ZH.products.path),
      images: productImages,
    },
    {
      url: `${SITE.url}${SEO.contact.path}`,
      lastModified: UPDATED.contact,
      alternates: pair(SEO.contact.path, SEO_ZH.contact.path),
    },

    {
      url: `${SITE.url}${SEO_ZH.home.path}`,
      lastModified: UPDATED.home,
      alternates: pair(SEO.home.path, SEO_ZH.home.path),
    },
    {
      url: `${SITE.url}${SEO_ZH.products.path}`,
      lastModified: UPDATED.products,
      alternates: pair(SEO.products.path, SEO_ZH.products.path),
      images: productImages,
    },
    {
      url: `${SITE.url}${SEO_ZH.contact.path}`,
      lastModified: UPDATED.contact,
      alternates: pair(SEO.contact.path, SEO_ZH.contact.path),
    },

    /* English only, and no `alternates`. See the note above. */
    {
      url: `${SITE.url}${SEO.privacy.path}`,
      lastModified: UPDATED.privacy,
    },
  ];
}
