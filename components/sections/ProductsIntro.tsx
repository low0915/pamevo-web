import { PRODUCTS_PAGE, PRODUCTS_PAGE_ZH } from "@/lib/content";
import type { Locale } from "@/lib/paths";
import { PageBanner } from "@/components/sections/PageBanner";

/**
 * The banner of /our-products: the shared `PageBanner`, with the extrusions as
 * its figure and the city facade as its overlay.
 *
 * The geometry, the trace and the entry all live in PageBanner, which /contact
 * uses too. What is left here is the two things that belong to this page: which
 * words, and which pictures.
 */
export function ProductsIntro({ locale = "EN" }: { locale?: Locale }) {
  /* A server component, so the locale arrives as a prop rather than through
     the client-side context — the same rule ContactBody follows. */
  const copy = locale === "ZH" ? { ...PRODUCTS_PAGE, ...PRODUCTS_PAGE_ZH } : PRODUCTS_PAGE;

  return (
    <PageBanner
      heading={copy.heading}
      subheading={copy.subheading}
      /* `position` frames the overlay inside the band - see BannerOverlay in
         PageBanner for the values. Omitted here: this crop is centred. */
      overlay={{ src: "/office-building-city-closeup.jpg" }}
      /* Mirrored and pushed right: the extrusions run the wrong way and are
         meant to bleed off the band's edge. See BannerFigure. */
      figure={{
        src: "/products-hero-profiles.png",
        position: "right center",
        mirrored: true,
      }}
    />
  );
}
