import type { Metadata, Viewport } from "next";

import "../globals.css";
import { Shell } from "@/components/site/Shell";
import { SEO, SITE } from "@/lib/content";

/**
 * English root layout, serving `/`, `/contact`, `/our-products`, `/privacy`
 * and `/preview-projects`.
 *
 * One of two root layouts — see components/site/Shell.tsx for why there are
 * two, and app/(zh)/layout.tsx for the other. There is deliberately no
 * app/layout.tsx above these: a top-level root layout would own <html> and take
 * the `lang` decision away from the route.
 *
 * Root metadata: FLAT KEYS ONLY.
 *
 * Note what is absent — `openGraph`, `twitter` and `alternates`. Next merges
 * metadata shallowly, replacing nested keys wholesale rather than field by
 * field, so defaulting any of them here would hand every page that does not
 * restate them the home page's values. For `alternates` that means
 * canonicalising the whole site onto "/", and now also handing every page the
 * home page's hreflang pair. Each page builds its own through `pageMetadata()`
 * in lib/seo.ts.
 *
 * `icons` is absent too, and for a different reason: it used to point at
 * /logo.png, which is the 2220x174 co-branded wordmark and renders as a smear
 * at 16px. Dropping the key lets Next's file conventions take over —
 * app/favicon.ico, app/icon.png and app/apple-icon.png, all three cut from
 * the red emblem at the left of /logo.png — which cannot go stale the way a
 * hand-written path can.
 */
export const metadata: Metadata = {
  /** Every relative canonical, og:image and hreflang below resolves against
      this. Without it they resolve against localhost in production, silently. */
  metadataBase: new URL(SITE.url),
  title: {
    default: SEO.home.title,
    /** Sub-pages set only their own half of the title; this appends the brand
        so no page can ship without it. */
    template: SEO.titleTemplate,
  },
  description: SEO.home.description,
  applicationName: SITE.name,
  publisher: SITE.legalName,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      /* Let Google use a full-size image and an untruncated snippet. Without
         these it may choose a thumbnail, which for a product catalogue that
         lives on its photography is the wrong default. */
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  /* The showroom's phone number is already a real <a href="tel:">; leaving
     detection on lets iOS Safari re-style arbitrary digit runs — the SSM
     company number, the spec figures — as if they were phone numbers too. */
  formatDetection: { telephone: false, address: false },
};

/** themeColor is deprecated inside `metadata` as of Next 14; this is where it
    goes now. The value is the brand ground, so the mobile browser chrome
    matches the page rather than flashing white against it. */
export const viewport: Viewport = {
  themeColor: "#f4f5f6",
};

export default function EnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Shell locale="EN">{children}</Shell>;
}
