import {
  PRODUCTS_PAGE,
  PRODUCTS_PAGE_ZH,
  PRODUCTS_PAGE_BM,
} from "@/lib/content";
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
     the client-side context — the same rule ContactBody follows.

     Keyed off a table rather than a chain of ternaries, so a language added to
     `Locale` that is missed here is a type error rather than an English banner
     over a translated page. That is the failure this had: it knew about ZH and
     rendered English for anything else, which is invisible in a build and
     obvious only to the reader it is wrong for. */
  const TRANSLATIONS: Record<Locale, Partial<typeof PRODUCTS_PAGE>> = {
    EN: {},
    BM: PRODUCTS_PAGE_BM,
    ZH: PRODUCTS_PAGE_ZH,
  };
  const copy = { ...PRODUCTS_PAGE, ...TRANSLATIONS[locale] };

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
        /* Where the figure sits vertically. `0%` is the box's own place, which
           is where this banner was drawn and where it reads best — the
           extrusions clear the band's foot without hanging into the catalogue
           below it.

           KEPT AT ZERO RATHER THAN DROPPED, deliberately: the knob is the only
           thing that moves a figure on this axis, since `position`'s vertical
           half is inert for a figure fitted by height (see BannerFigure). Left
           out entirely, the next person wanting to nudge this has to rediscover
           that. It was briefly 14% to hang the metal past the foot the way
           /services does; that number is here if it is wanted again, and note
           it is NOT /services' own 5% — the offset moves the box, and the two
           PNGs carry different amounts of empty alpha above their subject, so
           the same value lands the metal in a different place. */
        offsetY: "0%",
      }}
      /* The blue runs to both edges behind it — see `fullBleed` in PageBanner.
         The figure still bleeds off the right; what it bleeds over is now blue
         rather than the page's own ground. */
      fullBleed
    />
  );
}
