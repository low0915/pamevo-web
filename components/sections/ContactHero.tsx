"use client";

import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "@phosphor-icons/react";
import { HeroCarousel } from "@/components/sections/Hero";
import {
  CONTACT_HERO,
  CONTACT_HERO_ZH,
  CONTACT_HERO_BM,
  SHOWROOM_SLIDE,
  SHOWROOM_SLIDE_ZH,
  SHOWROOM_SLIDE_BM,
} from "@/lib/content";
import { useCopy } from "@/lib/locale";

/**
 * The opening of /contact: the inner pages' hero (PageHero's look, at its
 * 85svh) as a two-slide slider on the home hero's mechanics. The first slide
 * is the page's own, its button gliding down to the enquiry form; the second
 * invites the reader to the Shah Alam showroom, its button opening the
 * address in Google Maps.
 *
 * It carries the page's `h1`, outside the slides as the home hero's does: a
 * slide that is not showing is `inert`, and the page's heading must not
 * disappear with it. The visible headline on the first slide is the same
 * words, hidden from screen readers so they are not read twice.
 *
 * `heading` and `lede` come from the page (CONTACT.banner, per locale, which
 * the server route merges); the rest is read from context.
 */
export function ContactHero({
  heading,
  lede,
  enquiry,
}: {
  heading: string;
  lede: string;
  /** The first slide's button: the label, and the form's fragment. */
  enquiry: { label: string; href: string };
}) {
  const page = useCopy(CONTACT_HERO, { ZH: CONTACT_HERO_ZH, BM: CONTACT_HERO_BM });
  const showroom = useCopy(SHOWROOM_SLIDE, { ZH: SHOWROOM_SLIDE_ZH, BM: SHOWROOM_SLIDE_BM });

  return (
    <HeroCarousel
      label={heading}
      className="h-[85svh] min-h-[600px]"
      heading={<h1 className="sr-only">{heading}</h1>}
      slides={[
        {
          key: "contact",
          media: (
            <Image
              src={page.image}
              alt={page.alt}
              fill
              sizes="100vw"
              preload
              draggable={false}
              className="graded-hero object-cover"
            />
          ),
          content: (
            <Block
              eyebrow={page.eyebrow}
              headline={heading}
              body={lede}
              cta={{ ...enquiry, external: false }}
              headlineHidden
            />
          ),
        },
        {
          key: "showroom",
          media: (
            <Image
              src={showroom.image}
              alt={showroom.alt}
              fill
              sizes="100vw"
              draggable={false}
              className="graded-hero object-cover"
            />
          ),
          content: (
            <Block
              eyebrow={showroom.eyebrow}
              headline={showroom.headline}
              body={showroom.body}
              cta={{ label: showroom.cta, href: showroom.href, external: true }}
            />
          ),
        },
      ]}
    />
  );
}

/**
 * One slide's text, laid out the same on both so they line up as they swap:
 * the headline holds one line from `md` up, and the body reserves three lines
 * there, so each block centres to the same place.
 */
function Block({
  eyebrow,
  headline,
  body,
  cta,
  headlineHidden = false,
}: {
  eyebrow: string;
  headline: string;
  body: string;
  /** In-page (glides down, arrow down) or another site (new tab, arrow out). */
  cta: { label: string; href: string; external: boolean };
  /** The first slide's headline duplicates the sr-only h1, so it is hidden. */
  headlineHidden?: boolean;
}) {
  const Icon = cta.external ? ArrowUpRight : ArrowDown;
  return (
    <>
      <p className="mb-6 text-sm font-medium tracking-[0.2em] text-ink-2 uppercase md:mb-8 md:text-base">
        {eyebrow}
      </p>
      <p
        aria-hidden={headlineHidden || undefined}
        className="text-[clamp(1.875rem,3.5vw,5rem)] leading-[1] font-medium tracking-tighter text-balance text-ink md:whitespace-nowrap"
      >
        {headline}
      </p>
      <p className="mx-auto mt-6 max-w-[60ch] text-base leading-relaxed text-ink md:mx-0 md:min-h-[4.875em] md:text-lg">
        {body}
      </p>
      <div className="mt-8 flex h-12 justify-center md:justify-start">
        <a
          href={cta.href}
          draggable={false}
          {...(cta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 text-base font-medium tracking-tight text-bg transition-transform duration-[160ms] ease-out hover:-translate-y-0.5 active:translate-y-0"
        >
          {cta.label}
          <Icon
            size={18}
            className={`transition-transform duration-200 ease-out ${
              cta.external
                ? "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                : "group-hover:translate-y-0.5"
            }`}
          />
        </a>
      </div>
    </>
  );
}
