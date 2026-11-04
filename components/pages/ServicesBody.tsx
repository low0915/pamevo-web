import { WORKMANSHIP } from "@/lib/content";
import type { Locale } from "@/lib/paths";
import { PageHero } from "@/components/sections/PageHero";
import { Workmanship } from "@/components/sections/Workmanship";
import { Services } from "@/components/sections/Services";
import { CoreUspsPanel } from "@/components/sections/CoreUspsPanel";
import { EngineeringCarousel } from "@/components/sections/EngineeringCarousel";

/**
 * /services, /bm/services and /zh/services.
 *
 * The page was the services stack on its own, opening cold on a dark panel.
 * It now opens on the shared `PageBanner` — the same band /contact,
 * /our-products and /contact use — and closes on the feature bands,
 * which until now only existed on the home page.
 *
 * Those bands no longer print "Why Choose MEVO Malaysia" and its four claims:
 * the home page gives that its own section now, and the same four sentences on
 * two pages is once too many. What closes this page is the ten USPs and the six
 * engineering figures — each stated once, in a band of its own.
 *
 * A server component, so the copy arrives as a prop rather than through the
 * locale context: context is a client mechanism and this renders on the server,
 * which is the whole point of routing the languages separately. The two
 * sections below are client components and read the locale themselves, so
 * nothing has to be passed down to them.
 *
 * SERVICES LOST ITS `standalone` PROP, because it lost the thing the prop was
 * guarding. It is no longer a pinned stack — it is a static grid that scrolls
 * like any other block of content — so it has no pull-up to drop and this page,
 * its only caller, was the only place that ever passed the flag. The curtain
 * classes it used to carry are still in globals.css: Projects uses them.
 *
 * The banner supplies the page's `h1`, which is why Services no longer promotes
 * its own heading to one — see the note on `Heading` in that file.
 */
export function ServicesBody({ locale = "EN" }: { locale?: Locale }) {
  /* The banner's translated heading and lede were read here, from SERVICES
     and its overlays. The page opens on the workmanship hero now, which is
     English only until the client's copy is translated, so nothing on this
     level varies by language; the sections below read the locale themselves.
     `locale` is still taken so the three routes keep calling this the same
     way, and so the hero can pick up translations when they exist. */
  void locale;

  return (
    <main className="flex-1">
      {/* The home hero's opening, with the client's workmanship copy, in
          place of the PageBanner this page used to open on. It carries the
          page's h1 now. Its button glides down to the cross-section. */}
      <PageHero
        eyebrow={WORKMANSHIP.hero.eyebrow}
        headline={WORKMANSHIP.hero.headline}
        body={WORKMANSHIP.hero.body}
        cta={{ label: WORKMANSHIP.hero.cta, href: `#${WORKMANSHIP.section.id}` }}
        image={{ src: WORKMANSHIP.hero.image, alt: WORKMANSHIP.hero.alt }}
      />

      <Services />
      {/* Butted straight onto Services, which carries no bottom margin of its
          own: what separates the two is the change of ground rather than a gap
          between them, and here that change does the work on its own — Services
          ends on the site's near-white and this opens on near-black. */}
      <CoreUspsPanel />
      {/* How it is built, between why to buy it and how it tests: four of
          its five components are proven by figures in the carousel below. The
          hero's button scrolls here. */}
      <Workmanship />
      {/* The six engineering figures, and what closes the page. WhyChoose stood
          under this and printed the same six a second time as a scrubbed panel;
          the carousel carries them alone now, with the hardware note on its own
          card and the closing commitment under the track. */}
      <EngineeringCarousel />
    </main>
  );
}
