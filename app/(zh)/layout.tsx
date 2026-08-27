import type { Metadata, Viewport } from "next";

import "../globals.css";
import { Shell } from "@/components/site/Shell";
import { SEO_ZH, SITE } from "@/lib/content";

/**
 * Chinese root layout, serving `/zh`, `/zh/contact` and `/zh/our-products`.
 *
 * The second of two root layouts. It exists so the server can send
 * `lang="zh-Hans"` in the HTML itself: only a root layout renders <html>, and
 * the previous build corrected the attribute with an effect after hydration,
 * which every crawler missed.
 *
 * There is no /zh/privacy. The privacy notice is PDPA legal text with no
 * Chinese translation, and a Chinese URL serving English legal copy is worse
 * than not offering one — so it stays English-only, unpaired, and carries no
 * hreflang. See PAIRED_PATHS in lib/locale.tsx.
 *
 * The same flat-keys-only rule applies here as in the English layout: no
 * `openGraph` and no `alternates`, because Next replaces nested metadata keys
 * wholesale and a page that set only a title would inherit this one's canonical
 * and its hreflang pair.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    /* Spelled out rather than reused: SEO_ZH.home.title deliberately carries no
       brand, because the template appends one to it. A fallback title has no
       template applied to it, so it needs the brand written in. */
    default: `${SEO_ZH.home.title} | MEVO 马来西亚`,
    template: SEO_ZH.titleTemplate,
  },
  description: SEO_ZH.home.description,
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

export default function ZhLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Shell locale="ZH">{children}</Shell>;
}
