import type { Metadata } from "next";
import Image from "next/image";

import { CONTACT, FOOTER, SEO, WHATSAPP } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/sections/ContactForm";

export const metadata: Metadata = {
  /** The layout template appends " | MEVO Malaysia". */
  title: SEO.contact.title,
  description: SEO.contact.description,
};

/**
 * Contact.
 *
 * A banner band, then the two ways to reach the company side by side: the
 * details on the left for anyone who would rather call, the form on the right
 * for anyone who would rather write. Below `lg` the details come first, because
 * a phone number is the faster answer and should not sit under a form.
 *
 * The banner is a band rather than a full screen. The header island floats over
 * the first 80px of the viewport, so the heading is bottom-aligned inside it,
 * clear of the island with the texture reading above it.
 *
 * Every number, address and link here is read from FOOTER — the same rule
 * /privacy follows, so a changed phone number changes in one place.
 *
 * No gsap on this page, matching /our-products and /privacy. The home page owns
 * the scrubbed sections; this one is Reveal and CSS transitions.
 *
 * The root layout renders children bare, so each page owns its own <main>.
 */
export default function ContactPage() {
  const detail = [
    {
      label: CONTACT.details.labels.phone,
      value: FOOTER.phone,
      href: FOOTER.phoneHref,
    },
    {
      label: CONTACT.details.labels.email,
      value: FOOTER.email,
      href: FOOTER.emailHref,
    },
    { label: CONTACT.details.labels.address, value: FOOTER.address },
    { label: CONTACT.details.labels.company, value: FOOTER.company },
  ];

  return (
    <main className="flex-1">
      {/* Full-bleed banner. The texture is decorative and the heading carries
          the meaning, so the image is alt="" rather than described. */}
      <section className="relative flex h-[46dvh] min-h-[380px] w-full items-end overflow-hidden md:h-[56dvh]">
        <Image
          src="/scratched-metal-background.jpg"
          alt=""
          fill
          priority
          quality={70}
          sizes="100vw"
          className="graded object-cover"
        />

        {/* The metal runs light in places and dark in the scratch bands, which
            is fine as a ground and unusable under type. This lifts the lower
            band back to the page's own colour so ink type sits on it at full
            contrast, and leaves the texture legible above. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-[rgb(244_245_246/0.96)] via-[rgb(244_245_246/0.72)] to-transparent"
        />

        <div className="relative w-full px-4 pt-28 pb-10 md:px-8 md:pb-14 lg:px-12">
          <div className="mx-auto w-full max-w-[1440px]">
            <Reveal>
              <h1 className="max-w-[18ch] text-5xl leading-[1.04] font-medium tracking-tighter text-ink md:text-6xl lg:text-7xl">
                {CONTACT.banner.heading}
              </h1>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-ink-2">
                {CONTACT.banner.lede}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-4 pt-20 pb-24 md:px-8 md:pt-24 md:pb-32 lg:px-12">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
            <Reveal>
              <div>
                <h2 className="text-xl font-medium tracking-tight text-ink md:text-2xl">
                  {CONTACT.details.heading}
                </h2>
                <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-ink-2">
                  {CONTACT.details.blurb}
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
                  className="mt-8 inline-flex items-center rounded-full border border-line bg-surface px-6 py-3 text-base font-medium tracking-tight text-ink transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97]"
                >
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
