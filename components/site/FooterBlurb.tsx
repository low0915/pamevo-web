"use client";

import { FOOTER, FOOTER_ZH, FOOTER_BM } from "@/lib/content";
import { useCopy } from "@/lib/locale";

/**
 * The footer's standfirst, and only that.
 *
 * It is the one string in the footer that is translated, and reading the locale
 * needs a client component. Pulled out into its own file rather than marking
 * the whole footer `"use client"`: the footer carries five Simple Icons path
 * strings, and those are large enough that server-rendering them into the HTML
 * and shipping none of their JS is worth one extra component.
 */
export function FooterBlurb({ className }: { className?: string }) {
  const footer = useCopy(FOOTER, { ZH: FOOTER_ZH, BM: FOOTER_BM });
  return <p className={className}>{footer.blurb}</p>;
}
