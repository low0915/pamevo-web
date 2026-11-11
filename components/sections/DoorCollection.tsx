"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { DOOR_COLLECTION, DOOR_COLLECTION_ZH, DOOR_COLLECTION_BM } from "@/lib/content";
import { localePath, useCopy, useLocale } from "@/lib/locale";

/** How much wider the open panel is than a closed one. */
const OPEN_GROW = 4;

/**
 * Explore Our Door & Window Collection: a header, five category panels (three
 * door, two window), and a closing line with the way into the catalogue.
 *
 * The panels share one row and one of them is always open. Pointing at a panel,
 * or focusing it, opens it: it widens and the other two narrow to a strip that
 * carries only their number and name. Only the open panel shows its tagline and
 * description, so the section never puts three slogans on screen at once.
 *
 * Below `md` the row turns into a column — the same panels, opening in height
 * instead of width. There is no hover on a phone, so a tap on a closed panel
 * opens it and a tap on the open one follows its link.
 *
 * The open panel's text is set at a fixed width rather than the panel's, so it
 * does not reflow while the panel is still widening; it fades in once there is
 * room for it.
 *
 * THE CURTAIN CHAIN. This band sits between WhyMevo and ProductGrid, both
 * links in the chain HomeBody describes: WhyMevo holds a pinned frame for the
 * next section to ride over, and ProductGrid rides over whatever is above it,
 * pulled up 110svh. So this band does both. It is pulled up 110svh over
 * WhyMevo, and it holds the same 250svh runway around a 100lvh sticky frame
 * that WhyMevo does, so ProductGrid lands on a frame that is still pinned. Under reduced motion none of it sticks and the
 * band is in flow.
 */
export function DoorCollection() {
  const copy = useCopy(DOOR_COLLECTION, { ZH: DOOR_COLLECTION_ZH, BM: DOOR_COLLECTION_BM });
  const { locale } = useLocale();
  const [open, setOpen] = useState(0);

  return (
    <section
      aria-labelledby="door-collection-heading"
      className="relative h-[250svh] bg-bg motion-reduce:h-auto"
    >
      {/* The home page's band padding, matched to WhyMevo above: full bleed on
          the `px-6 md:px-8 lg:px-10` gutter rather than capped at 1440, and the
          title held at the top on the same `max(7.5rem, 10svh)` that clears
          the header island. The panels take whatever height is left. */}
      <div className="sticky top-0 flex h-[100lvh] w-full flex-col overflow-hidden bg-bg px-6 pt-[max(7.5rem,10svh)] pb-[max(1rem,4svh)] md:px-8 lg:px-10 motion-reduce:static motion-reduce:h-auto">
        <h2 id="door-collection-heading">
          <span className="block text-xs font-medium tracking-[0.2em] text-ink-2 uppercase md:text-sm">
            {copy.title}
          </span>
          <span className="mt-3 block text-[clamp(1.75rem,3.2vw,3.25rem)] leading-[1.05] font-medium tracking-tight text-ink">
            {copy.subheading}
          </span>
        </h2>
        <p className="mt-4 max-w-[58ch] text-sm leading-relaxed text-ink-2 md:text-base">
          {copy.description}
        </p>

        <ul className="mt-6 flex min-h-[22rem] flex-1 flex-col gap-2 md:mt-10 md:flex-row md:gap-3 motion-reduce:h-[70svh]">
          {copy.categories.map((category, i) => {
            const isOpen = i === open;
            return (
              <li
                key={category.name}
                className="relative min-h-0 min-w-0 overflow-hidden bg-ink transition-[flex-grow] duration-700 ease-in-out motion-reduce:transition-none"
                style={{ flexGrow: isOpen ? OPEN_GROW : 1, flexBasis: 0 }}
                /* A real mouse only. A phone fires a compatibility mouseenter
                   just before the tap's click, which would open the panel a
                   moment early and turn the tap into a navigation. */
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") setOpen(i);
                }}
              >
                <Link
                  href={category.href ? localePath(category.href, locale) : copy.href}
                  aria-label={`${category.name}: ${copy.explore}`}
                  /* Keyboard focus only. A tap focuses the link too, just
                     before its click, and opening on that would turn the tap
                     into a navigation the same way the mouseenter above would. */
                  onFocus={(e) => {
                    if (e.currentTarget.matches(":focus-visible")) setOpen(i);
                  }}
                  onClick={(e) => {
                    // A tap on a closed panel opens it; only the open panel is
                    // a way through. On a pointer device the panel is already
                    // open by the time it is clicked, so this never fires there.
                    if (!isOpen) {
                      e.preventDefault();
                      setOpen(i);
                    }
                  }}
                  className="group absolute inset-0 block text-white focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
                >
                  <Image
                    src={category.image}
                    alt={category.alt}
                    fill
                    sizes="(min-width: 768px) 66vw, 100vw"
                    quality={75}
                    className={`object-cover transition-[scale,filter] duration-700 ease-out ${
                      isOpen ? "scale-100" : "scale-105 brightness-[0.85]"
                    }`}
                  />
                  {/* Dark at the foot, where the text is: these are catalogue
                      photographs with bright floors and walls, and white type
                      needs the ground it sits on to be dark whatever the picture. */}
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-[linear-gradient(to_top,rgb(16_18_21/0.82)_0%,rgb(16_18_21/0.45)_40%,rgb(16_18_21/0.1)_70%)]"
                  />

                  {/* Closed: the number and the name, and nothing else. Set
                      down the strip on desktop, across it on a phone. */}
                  <span
                    aria-hidden
                    className={`absolute inset-0 flex items-center gap-3 p-5 transition-opacity duration-300 md:flex-col md:items-start md:justify-between md:p-6 ${
                      isOpen ? "opacity-0" : "opacity-100 delay-200"
                    }`}
                  >
                    <span className="text-xs font-medium tabular-nums opacity-80">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-base font-medium tracking-tight md:rotate-180 md:text-lg md:[writing-mode:vertical-rl]">
                      {category.name}
                    </span>
                  </span>

                  {/* Open: the whole caption, at a fixed width so it does not
                      reflow while the panel widens. */}
                  <span
                    className={`absolute inset-x-0 bottom-0 p-5 transition-opacity md:p-8 lg:p-10 ${
                      isOpen ? "opacity-100 delay-300 duration-500" : "pointer-events-none opacity-0 duration-200"
                    }`}
                  >
                    {/* Fixed, but to the OPEN PANEL's width rather than the screen's. On
                        a phone the panels stack full width and the two are the
                        same; from `md` the row is split by flex-grow, so the
                        open panel is only OPEN_GROW / (OPEN_GROW + n - 1) of
                        the row less its gaps (12px each), and a screen-sized
                        caption was cropped at the panel edge on a tablet.
                        The trailing rem is the caption's own padding. */}
                    <span
                      className="block w-[min(34rem,calc(100vw-6rem))] md:w-[min(34rem,calc((100vw-4rem-var(--gaps))*var(--share)-4rem))] lg:w-[min(34rem,calc((100vw-5rem-var(--gaps))*var(--share)-5rem))]"
                      style={
                        {
                          "--share": OPEN_GROW / (OPEN_GROW + copy.categories.length - 1),
                          "--gaps": `${(copy.categories.length - 1) * 12}px`,
                        } as CSSProperties
                      }
                    >
                      <span className="block text-xs font-medium tabular-nums opacity-80">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="mt-2 block text-[clamp(1.5rem,2.4vw,2.5rem)] leading-[1.1] font-medium tracking-tight">
                        {category.name}
                      </span>
                      <span className="mt-2 block text-sm font-medium tracking-wide opacity-90 md:text-base">
                        {category.tagline}
                      </span>
                      <span className="mt-3 hidden max-w-[48ch] text-sm leading-relaxed opacity-80 sm:block md:text-base">
                        {category.description}
                      </span>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium md:mt-5">
                        {copy.explore}
                        <ArrowUpRight
                          size={18}
                          className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* The closing line. Its words are only shown from `md` up — on a
            phone the panels need the height, and the button says the same. */}
        <div className="mt-4 flex items-center justify-between gap-6 md:mt-6">
          <div className="hidden md:block">
            <p className="text-lg font-medium tracking-tight text-ink">{copy.ctaHeading}</p>
            <p className="mt-1 text-sm text-ink-2">{copy.ctaBody}</p>
          </div>
          <Link
            href={copy.allHref}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-base font-medium tracking-tight text-bg transition-transform duration-[160ms] ease-out hover:-translate-y-0.5 active:translate-y-0 md:w-auto"
          >
            {copy.ctaButton}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
