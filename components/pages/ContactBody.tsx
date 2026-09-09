import { siWhatsapp } from "simple-icons";

import { CONTACT, FOOTER, WHATSAPP } from "@/lib/content";
import { JsonLd } from "@/components/site/JsonLd";
import { contactGraph } from "@/lib/schema";
import type { Locale } from "@/lib/locale";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/sections/ContactForm";
import { PageBanner } from "@/components/sections/PageBanner";

/**
 * The contact page body, shared by /contact and /zh/contact.
 *
 * A server component, so the copy arrives as a prop rather than through the
 * locale context — context is a client-side mechanism and this page renders on
 * the server, which is the whole point of routing the languages. Each route
 * passes the object it wants: CONTACT, or CONTACT merged with CONTACT_ZH.
 *
 * The form inside is a client component and does read that context, so it needs
 * nothing passed to it.
 *
 * A banner band, then the two ways to reach the company side by side: the
 * details on the left for anyone who would rather call, the form on the right
 * for anyone who would rather write. Below `lg` the details come first, because
 * a phone number is the faster answer and should not sit under a form.
 *
 * The banner is the shared `PageBanner`, the same one /our-products opens on.
 *
 * Every number, address and link here is read from FOOTER — the same rule
 * /privacy follows, so a changed phone number changes in one place.
 *
 * No gsap on this page, matching /our-products and /privacy. The home page owns
 * the scrubbed sections; this one is Reveal and CSS transitions.
 *
 * The root layout renders children bare, so each page owns its own <main>.
 */
export function ContactBody({
  copy,
  locale = "EN",
}: {
  copy: typeof CONTACT;
  locale?: Locale;
}) {
  const detail = [
    {
      label: copy.details.labels.phone,
      value: FOOTER.phone,
      href: FOOTER.phoneHref,
    },
    {
      label: copy.details.labels.email,
      value: FOOTER.email,
      href: FOOTER.emailHref,
    },
    { label: copy.details.labels.address, value: FOOTER.address },
    { label: copy.details.labels.company, value: FOOTER.company },
  ];

  return (
    <main className="flex-1">
      {/* HomeAndConstructionBusiness + BreadcrumbList. This page rather than
          the layout: Google wants marked-up NAP data to be visible on the page
          asserting it, and this is where the address and number are printed. */}
      <JsonLd data={contactGraph(locale)} />

      {/* The same banner /our-products opens on, and deliberately so: they are
          the two pages a reader arrives at from the nav, and until now they
          announced themselves in two unrelated ways. See PageBanner for the
          geometry, the trace and the entry.

          The overlay is the P.A. Projects / MEVO showroom rather than the city
          facade the products page uses. The banner blends whatever it is given
          at 22% soft-light, so it reads as light across the blue rather than as
          a photograph - which is what makes a building recognisable enough to
          belong here without competing with the heading.

          The figure is the window-corner cutaway. It is portrait where the
          extrusions on /our-products are landscape, so it takes neither of that
          one's framing settings: centred rather than pushed right, because the
          figure box deliberately runs past the band's edge and a narrow subject
          pushed into that corner is clipped instead of bleeding off it; and not
          mirrored, because unlike the extrusions it already faces the way the
          band wants. See BannerFigure. */}
      <PageBanner
        heading={copy.banner.heading}
        subheading={copy.banner.lede}
        /* The second number is the one to change to move the showroom up or
           down in the band - 0% is the top of the photograph, 100% the bottom.
           See BannerOverlay in PageBanner. */
        overlay={{ src: "/pa mevo_up.png", position: "50% 15%" }}
        /* NO FIGURE, AND THE BAND CLOSES UP BEHIND IT. The extrusion cut-out
           used to cross from the blue onto the page ground on the right; with
           it gone the strip of ground it was photographed against is a bare
           margin with nothing to explain it, so `fullBleed` runs the blue to
           both edges and carries the rules out with it. See the prop's note in
           PageBanner — /services and /directors-profile keep the framed
           composition, so this is opt-in rather than the default. */
        fullBleed
      />

      <section className="px-4 pt-20 pb-24 md:px-8 md:pt-24 md:pb-32 lg:px-12">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
            <Reveal>
              <div>
                <h2 className="text-xl font-medium tracking-tight text-ink md:text-2xl">
                  {copy.details.heading}
                </h2>
                <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-ink-2">
                  {copy.details.blurb}
                </p>

                <dl className="mt-8 grid gap-6">
                  {detail.map((item) => (
                    <div key={item.label}>
                      <dt className="font-mono text-xs tracking-[0.18em] text-ink-3 uppercase">
                        {item.label}
                      </dt>
                      <dd className="mt-2 max-w-[46ch] text-base leading-relaxed text-ink">
                        {item.href ? (
                          <a
                            href={item.href}
                            className="transition-colors duration-[160ms] ease-[var(--ease-out)] hover:text-ink-2"
                          >
                            {item.value}
                          </a>
                        ) : (
                          item.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>

                {/* The alternative to the form, for anyone who would rather not
                    fill one in. Secondary treatment: the enquiry is the page's
                    primary action and should stay the only filled pill. */}
                <a
                  href={WHATSAPP.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-6 py-3 text-base font-medium tracking-tight text-ink transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97]"
                >
                  {/* Simple Icons for the brand mark, as the header and the
                      footer do — the glyph is never drawn by hand here.
                      `currentColor` so it inherits the button's ink, including
                      in whatever state the button is in, and `aria-hidden`
                      because the label beside it already says WhatsApp: an
                      announced icon would say it twice. */}
                  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
                    <path d={siWhatsapp.path} />
                  </svg>
                  {WHATSAPP.label}
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
