import { SERVICES, SERVICES_ZH, SERVICES_BM } from "@/lib/content";
import type { Locale } from "@/lib/paths";
import { PageBanner } from "@/components/sections/PageBanner";
import { Services } from "@/components/sections/Services";
import { WhyChoose } from "@/components/sections/WhyChoose";

/**
 * /services, /bm/services and /zh/services.
 *
 * The page was the services stack on its own, opening cold on a dark panel.
 * It now opens on the shared `PageBanner` — the same band /contact,
 * /our-products and /vision-mission use — and closes on WhyChoose, which until
 * now only existed on the home page.
 *
 * A server component, so the copy arrives as a prop rather than through the
 * locale context: context is a client mechanism and this renders on the server,
 * which is the whole point of routing the languages separately. The two
 * sections below are client components and read the locale themselves, so
 * nothing has to be passed down to them.
 *
 * WHY BOTH SECTIONS TAKE `standalone`. Each was written as a band in the home
 * page's stack, where it is pulled up over the pinned section above it. Here
 * there is nothing above either of them to ride over, and a curtain drawn over
 * a section that is not pinned covers content instead of crossing it. What
 * `standalone` drops is the pull-up and its shadow; the runways and the sticky
 * frames stay, because the scrubbed sequence IS the section rather than the
 * transition into it.
 *
 * The banner supplies the page's `h1`, which is why Services no longer promotes
 * its own heading to one — see the note on `Heading` in that file.
 */
export function ServicesBody({ locale = "EN" }: { locale?: Locale }) {
  /* Keyed off a table rather than a chain of ternaries, so a language added to
     `Locale` and missed here is a type error rather than an English banner over
     a translated page. That was a real bug on /our-products once. */
  const TRANSLATIONS: Record<Locale, Partial<typeof SERVICES>> = {
    EN: {},
    BM: SERVICES_BM,
    ZH: SERVICES_ZH,
  };
  const copy = { ...SERVICES, ...TRANSLATIONS[locale] };

  return (
    <main className="flex-1">
      <PageBanner
        heading={copy.banner.heading}
        subheading={copy.banner.lede}
        /* /contact's banner exactly. The pages open the same way as each other
           on purpose, so what distinguishes them is the words rather than the
           picture. The second number in `position` moves the showroom up or
           down inside the band — see BannerOverlay in PageBanner. */
        overlay={{ src: "/pa mevo_up.png", position: "50% 15%" }}
        figure={{
          src: "/Camada 1.png",
          position: "55% 50%",
          scale: 1.1,
          offsetY: "5%",
        }}
      />

      <Services standalone />
      <WhyChoose standalone />
    </main>
  );
}
