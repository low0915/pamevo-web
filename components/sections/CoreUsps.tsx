"use client";

import Image from "next/image";
import { WHY_CHOOSE, WHY_CHOOSE_ZH, WHY_CHOOSE_BM } from "@/lib/content";
import { useCopy } from "@/lib/locale";

/**
 * The index of the USP part inside WHY_CHOOSE.parts.
 *
 * This section and WhyChoose read the same array from opposite ends: WhyChoose
 * skips everything up to and including this index, and this takes exactly this
 * one. Both count off the same constant so neither can silently take the
 * other's content when `parts` is reordered.
 */
export const USP_PART = 1;

/**
 * WHERE EACH CARD SITS IN THE RING, at `lg` and above.
 *
 * Three columns by five rows: five cards down the left, five down the right,
 * and the profile holding the whole of the middle column. Ten cards, ten cells,
 * none left over and none needed twice.
 *
 * THE FIRST AND LAST ROW ARE MOVED TOWARDS THE MIDDLE, which is the only thing
 * here that is not plain grid placement. A column of five flush cards is a list
 * standing beside a picture; sliding the top and bottom of each column inward
 * turns the two columns into one shape that closes around the profile, because
 * the eye reads the four corners stepping in as a curve.
 *
 *       ---          the corner cards sit further in than the three
 *     ---            between them, on both sides, so the ring narrows
 *     ---            at top and bottom and the profile is held in the
 *     ---            waist of it
 *       ---
 *
 * IT IS A TRANSLATE, AND IT HAS TO BE. The obvious spelling is a margin, and
 * that was the first attempt: `ml-[16%]` on the left column's corners. It does
 * not do this. A margin is laid out, so it takes its space out of the grid
 * cell and the card simply reflows narrower inside the same track - the inner
 * edge never moves. Measured, all five left cards still ended on the same
 * pixel; only the corner ones got shorter, which reads as two ragged columns
 * rather than as a ring. `translate` happens after layout, so the whole card
 * moves, keeping its width and its row height, and the edge that faces the
 * profile is the one that travels.
 *
 * The direction has to mirror - the left column moves right and the right
 * column left - or the ring leans instead of closing. That is the sign on the
 * two constants, and it is the only difference between them.
 *
 * Written out rather than derived, because the arithmetic that would derive it
 * is longer than the table and only ever has to produce this one answer. What
 * it must stay true to is the count - a card added to WHY_CHOOSE.parts[1]
 * without a row added here has nowhere to go - so the length is checked below
 * rather than left to be noticed on the page.
 *
 * The order is the reading order: the left column top to bottom, then the
 * right. The DOM order is the content order, so a screen reader walks the list
 * as written while the eye reads it as a ring.
 */
const INSET_L = "lg:translate-x-[14%]";
const INSET_R = "lg:-translate-x-[14%]";

const RING = [
  "lg:col-start-1 lg:row-start-1 " + INSET_L,
  "lg:col-start-1 lg:row-start-2",
  "lg:col-start-1 lg:row-start-3",
  "lg:col-start-1 lg:row-start-4",
  "lg:col-start-1 lg:row-start-5 " + INSET_L,
  "lg:col-start-3 lg:row-start-1 " + INSET_R,
  "lg:col-start-3 lg:row-start-2",
  "lg:col-start-3 lg:row-start-3",
  "lg:col-start-3 lg:row-start-4",
  "lg:col-start-3 lg:row-start-5 " + INSET_R,
];

/**
 * Our 10 Core USPs: ten glass cards ringing a cut-out of the extrusions.
 *
 * THIS WAS THE FIRST HALF OF WHYCHOOSE. It was one of two parts swapped through
 * a single panel by a scrubbed timeline, which meant nine of the ten USPs were
 * behind a scroll at any moment and the section had to be scrolled twice to
 * read both parts. Pulled out here it is ten cards read at once, and WhyChoose
 * keeps the engineering figures.
 *
 * THE GROUND IS A PHOTOGRAPH, AND THAT IS WHAT MAKES THE MATERIAL WORK. These
 * cards carry the header's glass, and glass is `backdrop-filter: blur()` over
 * whatever is behind it - over a flat fill there is nothing to blur and the
 * class renders as a pane of translucent paint. Brushed aluminium under it
 * gives the blur something to do, and the banding on that plate is coarse
 * enough to still read as movement through 24px of blur.
 *
 * It is washed nearly white rather than left dark, and that is contrast rather
 * than taste. `.glass` is WHITE-tinted, so it lightens whatever it covers; over
 * the plate at full strength the cards land near mid-grey, and `text-ink` on
 * mid-grey is the bottom of AA. Header.tsx works the same sum out at length for
 * the island - see its table of tint against ratio - and lands in the same
 * place: keep the ground light and near-black type on white glass has room to
 * spare.
 *
 * The profile is a cut-out PNG with a genuinely transparent background, so it
 * sits on the wash with no plate of its own and no blend mode.
 *
 * THE RING IS CAPPED WHERE THE HEADING IS NOT, which is the one place this
 * section departs from the band padding around it. A band runs its type to
 * 40px of the screen edge and this heading does too, but the ring is a closed
 * shape rather than a column of text: run its sides out to the same gutters on
 * a wide display and the two columns separate, leaving a hole in the middle
 * instead of something the cards are gathered around. Capped at 1360 with the
 * middle column weighted heavier than the two beside it, the sides stay within
 * reach of the profile at any width. The heading still starts on the band line,
 * so the section is anchored to its neighbours where it is read and closed up
 * only where it is looked at.
 */
export function CoreUsps() {
  const whyChoose = useCopy(WHY_CHOOSE, { ZH: WHY_CHOOSE_ZH, BM: WHY_CHOOSE_BM });
  const usps = whyChoose.parts[USP_PART];

  /* The ring is a fixed table of ten placements and the copy is translated in
     three files. If a language ever disagrees about the count the extra card
     would land unplaced, in the middle of the grid, on top of the profile -
     which looks like a rendering fault rather than a content one. Fall back to
     the English list, which the table was written against. */
  const items =
    usps.items.length === RING.length
      ? usps.items
      : WHY_CHOOSE.parts[USP_PART].items;

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-surface py-20 md:py-24 lg:py-28">
      {/* The plate. `graded` is the site's near-monochrome wash; the opacity is
          what takes it from a dark photograph to a light ground, and the veil
          over it closes the rest of the way to `bg-surface` so type at the top
          and bottom edges never sits on bare metal. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        <Image
          src="/scratched-metal-background.jpg"
          alt=""
          fill
          sizes="100vw"
          quality={60}
          className="graded object-cover opacity-[0.22]"
        />
        <div className="absolute inset-0 bg-linear-to-b from-surface/85 via-surface/55 to-surface/85" />
      </div>

      <div className="relative w-full px-6 md:px-8 lg:px-10">
        <h2 className="text-3xl leading-[1.1] font-medium tracking-tighter text-ink capitalize md:text-4xl lg:text-5xl">
          {usps.title}
        </h2>

        {/*
          One column on a phone, two on a tablet, the ring at `lg`.

          UNIFORM HEIGHTS, AND WHERE THEY COME FROM. All five rows are `1fr`,
          so the grid divides the ring's height into five equal bands and every
          card gets exactly one - a two-word USP and an eight-word one are the
          same height because the row decides it, not the sentence. `1fr` is a
          share of the free space rather than a share of the content, which is
          why this holds across the three languages without measuring any of
          them; `auto` rows, which this had while the top and bottom were
          full-width, would each shrink to their own copy and step unevenly.

          `items-stretch` is the default and is written out because it is doing
          work: it is what makes a card fill the row it was given instead of
          sitting at its natural height inside it.

          THE FLOOR IS FOR THE PROFILE, NOT FOR THE CARDS. `1fr` rows have only
          as much to share as the grid is tall, and the grid is only as tall as
          its content - so on the shortest copy (Chinese, where every USP is one
          line) the ring closed up to about 350px and took the profile down with
          it, since the middle column is exactly as tall as the ring beside it.
          `lg:min-h-[32rem]` puts a floor under the whole grid, the five rows
          divide it, and the profile inherits the result. It is a floor rather
          than a height so longer copy can still push past it.
        */}
        <ul
          role="list"
          /* `mt-16`/`mt-20`, absorbing the margin the deleted rule used to
             carry above it - the same fold Services makes, and the same numbers,
             because the two sections sit one after the other on this page and a
             different gap under each heading would be visible between them. */
          className="mx-auto mt-16 grid max-w-[1560px] grid-cols-1 items-stretch gap-4 sm:grid-cols-2 md:mt-20 lg:min-h-[32rem] lg:grid-cols-[minmax(0,0.82fr)_2fr_minmax(0,0.82fr)] lg:grid-rows-5 lg:gap-x-6 lg:gap-y-4"
        >
          {/*
            The profile, in the middle of the ring.

            First in the DOM rather than in the middle, deliberately: the grid
            places it explicitly at `lg`, so source order costs it nothing
            there, while below `lg` - where the ring collapses and placement
            falls back to flow - it wants to be the thing at the top that the
            list hangs under, not something interrupting the list between cards
            five and six.
          */}
          <li className="sm:col-span-2 lg:col-start-2 lg:col-span-1 lg:row-start-1 lg:row-span-5 lg:flex lg:items-center lg:justify-center">
            <div className="relative mx-auto aspect-[16/10] w-full max-w-[560px] lg:aspect-auto lg:h-full lg:max-w-none">
              <Image
                src="/aluminium profile-propduct.png"
                alt="Cut lengths of MEVO aluminium window profile stood on end, showing the chambered cross-section of each system"
                fill
                sizes="(max-width: 1024px) 92vw, 52vw"
                quality={80}
                /* `object-contain`, so the whole cross-section is shown and
                   the cell's own aspect never crops it.

                   It has no height of its own to set: the middle column spans
                   all five rows, so it is exactly as tall as the ring beside it
                   and grows or shrinks with the cards rather than against them.
                   That is also why the earlier `min-h` is gone - it was sizing
                   the middle against a three-row span and, once the ring became
                   five rows, was propping the section taller than its own
                   content and leaving a band of empty ground under the profile.

                   Not scaled up past `contain` either. An earlier pass used
                   `scale-110` to absorb the empty alpha the PNG carries around
                   the metal; transform happens after layout, so the overflow
                   had nowhere to go and it cropped the foot of the profile
                   against its cell. The cell is given the room instead. */
                className="object-contain"
              />
            </div>
          </li>

          {items.map((item, i) => (
            <li
              key={item}
              /*
                `glass` and `glass-rim` are the header island's own two classes,
                so the material is shared rather than described twice: a change
                to the island is a change here. `relative` is not optional
                alongside them - `glass-rim` draws its hairline as an inset
                `::before`, and without a positioned parent that pseudo-element
                escapes to the nearest one and rims the wrong box.
              */
              className={
                "glass glass-rim relative flex items-center overflow-hidden rounded-[14px] px-5 py-4 " +
                RING[i]
              }
            >
              <p className="text-sm leading-snug font-medium text-ink lg:text-[0.9375rem]">
                {item}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
