import type { Metadata, Viewport } from "next";

import "../globals.css";
import { Shell } from "@/components/site/Shell";
import { SEO_BM, SITE } from "@/lib/content";

/**
 * Malay root layout, serving `/bm`, `/bm/contact` and `/bm/our-products`.
 *
 * The third of three root layouts. It exists for the reason the Chinese one
 * does: `<html lang>` has to be correct in the HTML the server sends, and only
 * a root layout renders the <html> element.
 *
 * `lang` resolves to `ms`, not `bm`. The site calls the language BM and the URL
 * segment is /bm, because Bahasa Melayu is what it is called here — but `bm` is
 * Bambara's subtag, and the attribute a crawler reads has to be the standard's.
 * See HTML_LANG in lib/paths.ts.
 *
 * There is no /bm/privacy. The privacy notice is PDPA legal text with no
 * translation, and a Malay URL serving English legal copy is worse than not
 * offering one — so it stays English-only, unpaired, and carries no hreflang.
 * See PAIRED_PATHS in lib/paths.ts.
 *
 * The same flat-keys-only rule applies here as in the other two layouts: no
 * `openGraph` and no `alternates`, because Next replaces nested metadata keys
 * wholesale and a page that set only a title would inherit this one's canonical
 * and its hreflang set.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    /* Spelled out rather than reused: SEO_BM.home.title deliberately carries no
       brand, because the template appends one to it. A fallback title has no
       template applied to it, so it needs the brand written in. */
    default: `${SEO_BM.home.title} | PA Projects`,
    template: SEO_BM.titleTemplate,
  },
  description: SEO_BM.home.description,
  applicationName: SITE.name,
  publisher: SITE.legalName,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: { telephone: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#f4f5f6",
};

export default function BmLayout({ children }: { children: React.ReactNode }) {
  return <Shell locale="BM">{children}</Shell>;
}
