"use client";

import { PRODUCTS_PAGE, PRODUCTS_PAGE_ZH, PRODUCTS_PAGE_BM } from "@/lib/content";
import { useCopy } from "@/lib/locale";

/**
 * The footer's link to the e-catalogue PDF, under the phone and email.
 *
 * Its own client component for the reason FooterBlurb gives: the label is
 * translated, reading the locale needs the client, and the rest of the footer
 * is better left server-rendered.
 */
export function FooterCatalogue({ className }: { className?: string }) {
  const { catalogue } = useCopy(PRODUCTS_PAGE, { ZH: PRODUCTS_PAGE_ZH, BM: PRODUCTS_PAGE_BM });
  return (
    <a
      href={catalogue.href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {catalogue.label} (PDF)
    </a>
  );
}
