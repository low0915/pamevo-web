import { siWhatsapp } from "simple-icons";

import { CONTACT, FOOTER, WHATSAPP } from "@/lib/content";
import { JsonLd } from "@/components/site/JsonLd";
import { contactGraph } from "@/lib/schema";
import type { Locale } from "@/lib/locale";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/sections/ContactForm";
import { ContactHero } from "@/components/sections/ContactHero";

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
 * A hero (ContactHero), then the two ways to reach the company side by side: the
 * details on the left for anyone who would rather call, the form on the right
 * for anyone who would rather write. Below `lg` the details come first, because
 * a phone number is the faster answer and should not sit under a form.
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

      {/* The inner pages' hero, as a two-slide slider: this page's own
          slide, its button gliding down to the form, then the showroom, its
          button opening the address in Google Maps. It replaced the blue
          PageBanner this page shared with /our-products. See ContactHero. */}
      <ContactHero
        heading={copy.banner.heading}
        lede={copy.banner.lede}
        enquiry={{ label: copy.form.heading, href: "#enquiry" }}
      />

      {/* `#enquiry`: where the hero's first button glides to, clear of the
          header island. */}
      <section
        id="enquiry"
        className="scroll-mt-24 px-4 pt-20 pb-24 md:px-8 md:pt-24 md:pb-32 lg:px-12"
      >
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
