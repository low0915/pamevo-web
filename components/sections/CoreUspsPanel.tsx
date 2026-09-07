"use client";

import Image from "next/image";
import { WHY_CHOOSE, WHY_CHOOSE_ZH, WHY_CHOOSE_BM } from "@/lib/content";
import { useCopy } from "@/lib/locale";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The index of the USP part inside WHY_CHOOSE.parts.
 *
 * IT LIVES HERE BECAUSE THIS IS NOW THE SECTION THAT PRINTS THAT PART. It was
 * declared in CoreUsps — the ring band that used to sit above this one — and
 * moved when that section was deleted rather than being left to die with it,
 * because WhyChoose counts off the same constant: it skips everything up to and
 * including this index and prints what is left. Two sections read the one array
 * from opposite ends, so neither can silently take the other's content when
 * `parts` is reordered.
 */
export const USP_PART = 1;

/**
 * Our 10 Core USPs, a second time: the ten in a glass panel on a dark photograph.
 *
 * THIS IS THE ONLY PLACE THE TEN ARE PRINTED. There was a second band above it
 * — CoreUsps, which set the same ten as a ring of labels around a cut-out of
 * the profile — and the page carried both for a while. Two statements of one
 * list is once too many, so the ring is gone and this is what remains. The list
 * itself is still read from `WHY_CHOOSE.parts[USP_PART]`, so an eleventh USP
 * added to the content file appears here without this file being touched.
 *
 * THE GROUND IS THE FIGMA FRAME'S OWN PHOTOGRAPH, and the gradient over it is
 * from the same frame. The design puts a black-to-transparent wash running from
 * the left edge, reaching full black by ~80% of its width — so the left of the
 * band is a near-solid dark field and the right stays picture. That is not
 * decoration: it is what makes a panel legible on the left while leaving the
 * profile corner visible on the right, and it is why the panel goes where it
 * goes. Reproduced here as a `bg-linear-to-r` in the same direction, in the
 * project's own token rather than the raw hex the export carried.
 *
 * WHY `.glass-dark` AND NOT `.glass`. The six-engineering panel this is modelled
 * on uses `.glass`, which is WHITE-tinted — it lightens what it covers, which is
 * right over that section's light ground and wrong here, where it would sit as a
 * pale slab on a near-black photograph. `.glass-dark` is the same material
 * calibrated the other way: see its note in globals.css, where the 0.50 tint is
 * set by the brightest patch of photography behind it holding white type at
 * 5.1:1. The panel's type is therefore white, not `text-ink`.
 */
export function CoreUspsPanel() {
  const whyChoose = useCopy(WHY_CHOOSE, { ZH: WHY_CHOOSE_ZH, BM: WHY_CHOOSE_BM });
  const usps = whyChoose.parts[USP_PART];

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden bg-[#050607] py-20 md:py-24 lg:py-28">
      {/* The photograph, full bleed.

          `object-cover` with the focal point pushed right: the subject of this
          frame is the profile corner on its right-hand side, and the panel
          covers the left. Centred, a narrow viewport crops the corner out and
          leaves the band a field of black with a panel on it. `object-right`
          keeps the thing worth showing in frame at every width.

          Not `graded`. That class is the site's near-monochrome wash for its
          LIGHT photography, and this picture is already black-and-silver —
          running it through a saturation cut would only flatten the metal it
          is here to show. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 select-none">
        <Image
          src="/mevo-profile-corner-dark.jpg"
          alt=""
          fill
          sizes="100vw"
          quality={78}
          className="object-cover object-right"
        />

        {/* The Figma frame's own gradient: opaque at the left edge, clear by
            the right. It is what the panel is read against — without it the
            glass sits on whatever the photograph happens to put behind it,
            which at the top left is a bright brushed highlight.

            Two stops rather than one, because the design's single ramp leaves
            the band's own bottom edge lighter than the section it butts onto.
            The second, vertical wash closes the foot back to the ground colour
            so the join is not a visible seam. */}
        <div className="absolute inset-0 bg-linear-to-r from-[#050607] via-[#050607]/100 to-transparent md:via-[#050607]/20" />
        <div className="absolute inset-0 bg-linear-to-t from-[#050607] via-transparent to-transparent" />
      </div>

      <div className="relative w-full px-6 md:px-8 lg:px-10">
        {/*
          THE PANEL IS ON THE LEFT AND IT IS CAPPED, NOT HALVED. `max-w` rather
          than a percentage width: a percentage panel keeps growing with the
          display, and at 2560 the same ten lines stretch to a measure nothing
          can be read across. Capped, the panel stops and the extra width goes
          to the photograph, which is the half of the band that benefits from
          it.

          The heading sits ABOVE the panel rather than inside it, per the brief.
          Both are inside this one column, so they share a left edge — the
          heading starts where the panel starts, and the two read as one block
          against the picture rather than as two things that happen to be on the
          same side.
        */}
        <div className="max-w-[640px]">
          {/* Heading, then panel. Purpose: sequence. The two are one block
              against the photograph, so they arrive in reading order rather
              than together. */}
          <Reveal>
            <h2 className="text-3xl leading-[1.1] font-medium tracking-tighter text-white capitalize md:text-4xl lg:text-5xl">
              {usps.title}
            </h2>
          </Reveal>

          {/* `glass-rim` alongside `glass-dark`, the pairing the header island
              uses: the rim draws the refracted hairline that stops the panel
              reading as a flat translucent box. It is an inset `::before`, so
              the panel has to be `relative` or the pseudo-element escapes to
              the nearest positioned ancestor and rims the wrong box. */}
          <Reveal delay={0.1}>
            <div className="glass-dark glass-rim relative mt-8 rounded-[14px] p-6 md:mt-10 md:p-8">
            <ul
              role="list"
              /* Two columns from `md`, and the order runs DOWN the first
                 column before the second — `columns` rather than a grid,
                 because a two-column grid would run the list across the
                 rows and print 1,2 / 3,4, which is not how a list of ten
                 is read. Ten items over two columns is five and five.

                 `break-inside-avoid` on the item: a multi-line USP split
                 across the column break otherwise, leaving an orphaned
                 line at the top of the second column. */
              className="space-y-3 md:columns-2 md:gap-x-8 md:space-y-0"
            >
              {usps.items.map((item) => (
                <li
                  key={item}
                  className="flex break-inside-avoid items-start gap-3 py-1.5 md:py-2"
                >
                  {/* The same dot the ring band uses, so the two sections
                      state the same list in the same voice. `mt-[0.45rem]`
                      aligns it to the first line rather than centring it on
                      the item, so a two-line USP still points at its own
                      first line. */}
                  <span
                    aria-hidden
                    className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-white/70"
                  />
                  <p className="text-sm leading-relaxed font-medium text-white/90 lg:text-[0.9375rem]">
                    {item}
                  </p>
                </li>
              ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
