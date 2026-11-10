import {
  DIRECTORS,
  DIRECTORS_ZH,
  DIRECTORS_BM,
  PROFILE_HERO,
} from "@/lib/content";
import type { Locale } from "@/lib/paths";
import { PageHero } from "@/components/sections/PageHero";
import { SalesTeam } from "@/components/sections/SalesTeam";

/**
 * Our Sales Team: /directors-profile, /bm/directors-profile and
 * /zh/directors-profile. The URL keeps the WordPress slug; the page is now the
 * sales team's.
 *
 * Opens on the same hero as Our Profile (PageHero, with PROFILE_HERO's
 * photograph) carrying this page's own words, then the team grid that used to
 * close the profile page. The hero's button glides down to the grid.
 *
 * A server component, so the copy arrives as a prop rather than through the
 * locale context, the same shape ContactBody and ServicesBody take.
 */
export function DirectorsBody({ locale = "EN" }: { locale?: Locale }) {
  /* Keyed off a table rather than a chain of ternaries, so a language added to
     `Locale` and missed here is a type error rather than an English banner over
     a translated page. */
  const TRANSLATIONS: Record<Locale, Partial<typeof DIRECTORS>> = {
    EN: {},
    BM: DIRECTORS_BM,
    ZH: DIRECTORS_ZH,
  };
  const copy = { ...DIRECTORS, ...TRANSLATIONS[locale] };

  return (
    <main className="flex-1">
      <PageHero
        eyebrow={copy.banner.heading}
        headline={copy.banner.headline}
        body={copy.banner.lede}
        cta={{ label: copy.banner.cta, href: "#sales-team" }}
        image={{
          src: PROFILE_HERO.image,
          alt: PROFILE_HERO.alt,
          position: "50% 42%",
        }}
      />
      <SalesTeam locale={locale} />
    </main>
  );
}
