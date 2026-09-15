import { PROJECTS, PROJECTS_ZH, PROJECTS_BM } from "@/lib/content";
import type { Locale } from "@/lib/locale";
import { PageBanner } from "@/components/sections/PageBanner";
import { ProjectGallery } from "@/components/sections/ProjectGallery";

/**
 * The body of /our-projects, shared by all three locales.
 *
 * A band, then every photograph in the catalogue as a masonry wall. The page
 * used to open straight onto the home page's dragged strip, which announced
 * itself in a way no other page on the site does — /contact, /services,
 * /our-products and /directors-profile all open on `PageBanner`, and this was
 * the one page a reader could arrive at from the nav that did not.
 *
 * THE BANNER CARRIES THE `h1`, AND THE WALL BELOW IT HAS NO HEADING. The strip
 * this replaces put its own centred heading at the top of the page and took the
 * `h1` with it; kept alongside a band that also names the page, that is the
 * same words twice in the first screen and two competing h1s. So the band names
 * the page and the gallery is the photographs. `Projects` keeps its own heading
 * for the home page, where there is no band above it; its `standalone` prop
 * existed only for this page and now has no callers — see the note on it.
 *
 * A server component, like ContactBody and ServicesBody: the copy arrives as
 * a prop rather than through the locale context, because that context is a
 * client-side mechanism and these pages render on the server. The gallery
 * inside is a client component and does read the context, so it needs nothing
 * passed to it.
 *
 * The root layout renders children bare, so each page owns its own <main>.
 */
export function ProjectsBody({ locale = "EN" }: { locale?: Locale }) {
  const TRANSLATIONS: Record<Locale, Partial<typeof PROJECTS>> = {
    EN: {},
    BM: PROJECTS_BM,
    ZH: PROJECTS_ZH,
  };
  const copy = { ...PROJECTS, ...TRANSLATIONS[locale] };

  return (
    <>
      {/* /contact's and /services' banner exactly: the same overlay, the same
          full bleed. The pages open the same way as each other on purpose —
          what distinguishes them is the words, not the picture. The second
          number in `position` moves the showroom up or down inside the band;
          see BannerOverlay in PageBanner.

          No figure, and so `fullBleed` — with no cut-out to be photographed
          against, the bare ground strip on the right is a margin with nothing
          to explain it. See the prop's note in PageBanner. */}
      <PageBanner
        heading={copy.banner.heading}
        subheading={copy.banner.lede}
        overlay={{ src: "/pa mevo_up.png", position: "50% 15%" }}
        fullBleed
      />

      <ProjectGallery />
    </>
  );
}
