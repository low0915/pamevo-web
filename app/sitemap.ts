import type { MetadataRoute } from "next";

import { SEO, SEO_ZH, SEO_BM, SITE } from "@/lib/content";
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
  story: "2026-09-01",
  vision: "2026-09-02",
  directors: "2026-09-03",
  services: "2026-09-01",
  projects: "2026-09-01",
} as const;

/**
 * Absolute, and encoded. At least one asset filename carries a space
 * (`aluminium profile-propduct.png`), which is not legal in a <loc> unescaped.
 */
const asset = (src: string) => `${SITE.url}${encodeURI(src)}`;

/**
 * The hreflang set for a page that has one, in the form the sitemap wants.
 *
 * Repeated on ALL THREE URLs of a set, and each one includes the URL it sits
 * on. That is not redundancy — hreflang has to be reciprocal or Google discards
 * the annotation, and a page that does not name itself is treated as an
 * incomplete set. Three languages means each URL names three.
 *
 * `ms`, not `bm`: the URL segment is /bm because that is what the language is
 * called here, and the tag is `ms` because that is what the standard calls it.
 * See HTML_LANG in lib/paths.ts.
 */
const set = (enPath: string, bmPath: string, zhPath: string) => {
  const en = `${SITE.url}${enPath === "/" ? "" : enPath}`;
  return {
    languages: {
      en,
      ms: `${SITE.url}${bmPath}`,
      "zh-Hans": `${SITE.url}${zhPath}`,
      "x-default": en,
    },
  };
};

/**
 * No `changeFrequency` and no `priority` anywhere below. Google has said it
 * ignores both, and Bing effectively does too — they are two more fields to
 * keep honest for no return, so they are omitted rather than guessed at.
 *
 * /preview-projects is absent on purpose; it is a capture harness, noindexed at
 * the page and disallowed in robots.ts.
 *
 * /privacy appears once, in English, with NO alternates. It has no translation
 * and claiming one would be a lie in the one file crawlers read most literally.
 *
 * There is no per-product URL to list: all twenty live in the catalogue. The
 * product photography is attached to that entry instead, in every language,
 * since the images are the same images whichever one is being read.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const productImages = PRODUCTS.flatMap((product) =>
    product.images.map((image) => asset(image.src)),
  );

  /* The three paired paths, each written once and emitted three times. Built
     rather than listed, because nine hand-written entries carrying reciprocal
     hreflang is nine chances for one of them to name the wrong counterpart. */
  const paired = [
    { key: "home", en: SEO.home, bm: SEO_BM.home, zh: SEO_ZH.home },
    { key: "products", en: SEO.products, bm: SEO_BM.products, zh: SEO_ZH.products },
    { key: "contact", en: SEO.contact, bm: SEO_BM.contact, zh: SEO_ZH.contact },
    { key: "story", en: SEO.story, bm: SEO_BM.story, zh: SEO_ZH.story },
    {
      key: "directors",
      en: SEO.directors,
      bm: SEO_BM.directors,
      zh: SEO_ZH.directors,
    },
    { key: "services", en: SEO.services, bm: SEO_BM.services, zh: SEO_ZH.services },
    { key: "projects", en: SEO.projects, bm: SEO_BM.projects, zh: SEO_ZH.projects },
  ] as const;

  return [
    ...paired.flatMap(({ key, en, bm, zh }) => {
      const alternates = set(en.path, bm.path, zh.path);
      const lastModified = UPDATED[key];
      const images = key === "products" ? productImages : undefined;
      return [en.path, bm.path, zh.path].map((path) => ({
        url: path === "/" ? SITE.url : `${SITE.url}${path}`,
        lastModified,
        alternates,
        ...(images ? { images } : {}),
      }));
    }),

    /* English only, and no `alternates`. See the note above. */
    {
      url: `${SITE.url}${SEO.privacy.path}`,
      lastModified: UPDATED.privacy,
    },
  ];
}
