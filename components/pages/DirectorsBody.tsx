import { DIRECTORS, DIRECTORS_ZH, DIRECTORS_BM } from "@/lib/content";
import type { Locale } from "@/lib/paths";
import { PageBanner } from "@/components/sections/PageBanner";

/**
 * /directors-profile, /bm/directors-profile and /zh/directors-profile.
 *
 * THE BANNER AND NOTHING ELSE, DELIBERATELY. No profiles were supplied, and a
 * director's name, title or biography is not a thing to invent: it is a
 * statement about a real person published under the company's name, and a
 * plausible-sounding placeholder is worse than an empty page because nobody
 * notices it is wrong.
 *
 * So the route is real — heading, lede, metadata, hreflang, sitemap entry, its
 * place in the nav — and the part that needs the client is simply absent rather
 * than faked. Adding the profiles is a `people` array in DIRECTORS and a block
 * below this banner; nothing structural has to move for it.
 *
 * A server component, so the copy arrives as a prop rather than through the
 * locale context, the same shape ContactBody, VisionBody and ServicesBody take.
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
      <PageBanner
        heading={copy.banner.heading}
        subheading={copy.banner.lede}
        /* /contact's banner exactly, as on /services and /vision-mission. */
        overlay={{ src: "/pa mevo_up.png", position: "50% 15%" }}
        figure={{
          src: "/Camada 1.png",
          position: "55% 50%",
          scale: 1.1,
          offsetY: "5%",
        }}
      />
    </main>
  );
}
