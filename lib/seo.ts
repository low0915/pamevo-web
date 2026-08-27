import type { Metadata } from "next";

import { SEO, SITE } from "./content";

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
 * `alternates: { canonical: "/" }` in the root layout does not give every page
 * a sensible default, it gives every page that does not restate `alternates`
 * the HOME PAGE's canonical — quietly canonicalising the entire site onto "/"
 * and asking Google to drop every other URL. `openGraph` fails the same way,
 * more visibly: a page setting only `title` would share on WhatsApp under the
 * home page's og:title.
 *
 * So the root layout carries only flat keys, every page restates its own
 * nested ones in full, and this function is what makes restating them cheap
 * enough that nobody is tempted to skip it.
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

export function pageMetadata({
  path,
  title,
  description,
  image,
}: PageMeta): Metadata {
  const url = path === "/" ? SITE.url : `${SITE.url}${path}`;

  return {
    title,
    description,
    /* Relative, and resolved against metadataBase in app/layout.tsx. */
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: SITE.locale,
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
    /*
     * No `alternates.languages`, deliberately.
     *
     * The Chinese copy is a client-side toggle over one URL (see lib/locale.tsx)
     * and only part of the site has it, so there is no Chinese URL to point an
     * hreflang at. Emitting hreflang="zh-Hans" against a URL that serves
     * English HTML is worse than emitting nothing: Search Console flags it, and
     * Google is invited to serve the English page to Chinese-language searchers
     * who then bounce. This gains a `languages` key the day /zh routes ship
     * with the copy to fill them, and not before.
     */
  };
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

/** Every page's metadata, so the sitemap and the pages cannot disagree. */
export const PAGES = SEO;
