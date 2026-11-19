import { PRODUCTS_PAGE, PRODUCTS_PAGE_ZH, PRODUCTS_PAGE_BM } from "@/lib/content";
import type { Locale } from "@/lib/paths";
import { PageHero } from "@/components/sections/PageHero";

/**
 * The opening of /our-products: the inner pages' hero (PageHero), as on
 * /our-profile and /services, in place of the blue PageBanner it used to
 * share with /contact.
 *
 * "Our Products" is the eyebrow and the headline is the home hero's Our
 * Products slide; the range in a sentence is the body. The button opens the
 * full e-catalogue PDF in a new tab.
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
    <PageHero
      eyebrow={copy.heading}
      headline={copy.headline}
      body={copy.subheading}
      cta={{ label: copy.catalogue.label, href: copy.catalogue.href, external: true }}
      image={{ src: copy.heroImage, alt: copy.heroAlt }}
    />
  );
}
