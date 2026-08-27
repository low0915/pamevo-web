import type { Metadata } from "next";

import { SEO, SEO_ZH, SITE } from "./content";
import { enPath, isPaired, zhPath, type Locale } from "./paths";

/**
 * The metadata layer.
 *
 * Copy lives in content.ts; the machinery that turns copy into <head> lives
 * here, so a page's metadata is one line at the call site.
 *
 * THIS FILE EXISTS BECAUSE NEXT MERGES METADATA SHALLOWLY. A nested key — and
 * `openGraph`, `twitter` and `alternates` are all nested — is either replaced
 * whole by a descendant segment, or inherited whole if the descendant says
 * nothing. There is no per-field merge.
 *
 * The consequence is the trap this file is built to avoid: putting
 * `alternates: { canonical: "/" }` in a root layout does not give every page a
 * sensible default, it gives every page that does not restate `alternates` the
 * HOME PAGE's canonical — quietly canonicalising the site onto "/" and asking
 * Google to drop every other URL. Now that `alternates` also carries hreflang,
 * the same mistake would additionally tell Google that every page is the
 * translation of the home page.
 *
 * So both root layouts carry only flat keys, every page restates its own nested
 * ones in full, and this function is what makes restating them cheap enough
 * that nobody is tempted to skip it.
 */

type PageMeta = {
  /** Absolute path, leading slash, no trailing slash. Becomes the canonical. */
  path: string;
  /** The page's half of the title; the layout template appends the brand. */
  title: string;
  description: string;
  /** Site-relative. Falls through to app/opengraph-image.tsx when absent. */
  image?: { url: string; alt: string };
};

/**
 * The hreflang pair for a path, or nothing.
 *
 * Emitted only for the three paths that genuinely exist in both languages. It
 * is worth being strict about: an `hreflang="zh-Hans"` pointing at a URL that
 * serves English is not a small inaccuracy, it is an instruction to Google to
 * serve that page to Chinese-language searchers, who then bounce. /privacy has
 * no Chinese version and so gets no `languages` key at all.
 *
 * `x-default` goes to the English URL — it is the version to show a reader
 * whose language matches neither, and it is the one the whole site canonicalises
 * around.
 */
function languages(path: string) {
  const en = enPath(path);
  if (!isPaired(en)) return undefined;

  return {
    en: en,
    "zh-Hans": zhPath(en),
    "x-default": en,
  };
}

export function pageMetadata(
  { path, title, description, image }: PageMeta,
  locale: Locale = "EN",
): Metadata {
  const url = path === "/" ? SITE.url : `${SITE.url}${path}`;
  const alternates = languages(path);

  return {
    title,
    description,
    alternates: {
      /* Relative, and resolved against metadataBase in the root layout. Each
         language self-canonicalises: /zh/contact points at itself, not at the
         English page, or the Chinese version would never be indexed. */
      canonical: path,
      ...(alternates ? { languages: alternates } : {}),
    },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: locale === "ZH" ? "zh_MY" : SITE.locale,
      url,
      title,
      description,
      ...(image ? { images: [{ url: image.url, alt: image.alt }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image.url] } : {}),
    },
  };
}

/** The Chinese half, so a /zh page reads as one line the way an English one does. */
export function pageMetadataZh(entry: PageMeta): Metadata {
  return pageMetadata(entry, "ZH");
}

/**
 * Pages that exist and must never be indexed.
 *
 * Spread alongside a title rather than used alone, so the page still has a name
 * in the tab: `{ title: "Preview", ...NOINDEX }`.
 */
export const NOINDEX = {
  robots: { index: false, follow: false },
} satisfies Metadata;

export { SEO, SEO_ZH };
