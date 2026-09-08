"use client";

import Image from "next/image";
import { SERVICES, SERVICES_ZH, SERVICES_BM } from "@/lib/content";
import { useCopy } from "@/lib/locale";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Our Services, as one static index of five cards.
 *
 * THIS SECTION USED TO BE A PINNED STACK: a 620svh runway holding a sticky
 * frame, with five full-bleed panels scrubbed up over one another by a GSAP
 * timeline. It was replaced deliberately. The stack showed exactly one service
 * at a time and cost five screens of scrolling to read five short paragraphs,
 * so a reader could not compare the services, or even count them, without
 * committing to the whole runway. The brief for this rewrite was the opposite:
 * every service legible at a glance, and no scroll choreography at all.
 *
 * So there is no timeline here, no ScrollTrigger, no pin, and nothing that
 * animates on scroll. That last point is why this does not use `Reveal` either
 * - that component is a `whileInView` fade, and dressing the cards in it would
 * reintroduce exactly the behaviour this rewrite exists to remove.
 *
 * THE LAYOUT IS SIZED TO A CLAIM, WHICH IS WHAT MAKES IT TESTABLE. "Everything
 * at a glance" means the section fits one screen, so the cards are equal and
 * small rather than large and ranked: five across on a laptop comes to roughly
 * 700px tall at 1440x900, where the two-up arrangement this replaced measured
 * 1609. Anything that grows a card - a taller crop, a bigger body size, another
 * line of padding - is spending that margin, so measure before adding.
 *
 * Below `lg` five columns would be thumbnails, so the grid drops to six columns
 * and splits 2+2+2 / 3+3. That is the only other arrangement that divides five
 * cards with no empty cell, and both rows come to exactly six.
 * `grid-flow-dense` is a guard rather than load-bearing - the spans already
 * interlock - so that a sixth service added to SERVICES.items backfills instead
 * of leaving a hole while someone re-does the arithmetic.
 *
 * THE GROUND IS LIGHT, AND IT NO LONGER CARRIES THE SEPARATION. This band was
 * `bg-ink`, and the dark was doing a job: it split the page between the section
 * above and the one below. That job is already done here, because /services
 * opens on PageBanner and PageBanner is a full field of brand blue - the page
 * reads blue, then this, then the USP panel. So the separation this needs is
 * not from the banner but from the band under it, and one step of tone does
 * it: `bg-surface` is white where the panel below opens on near-black.
 *
 * A white band that wide reads as a hole rather than as a surface, which is
 * what the facade wash at the top is for. See the note on it below.
 *
 * The only motion is hover on the photographs, which is feedback rather than
 * sequencing - it reveals nothing, and it is gated behind `motion-safe`, so a
 * reduced-motion reader gets the same section without it.
 */
export function Services() {
  const services = useCopy(SERVICES, { ZH: SERVICES_ZH, BM: SERVICES_BM });

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-surface py-16 md:py-20 lg:py-24">
      {/*
        THE FACADE WASH, and it is the only thing in this section that is not
        content. A light band needs something behind the type or it reads as a
        gap in the page rather than a surface, and this is a section that
        deliberately has no motion left to supply that depth.

        It is a photograph of an aluminium-framed curtain wall - which is to say
        it is the product, not an abstract texture - held at 18% over white and
        desaturated, so it registers as tone rather than as a sixth picture
        competing with the five below it.

        Mirrored, because the facade falls on the left of the frame and the sky
        on the right, and the heading sits top-left. Flipped, the heading gets
        the clean half.

        Cropped low - `object-[50%_78%]` - and that is the difference between a
        texture and a smudge. The top of this photograph is a roofline against
        sky, so a band taken from there puts a hard diagonal silhouette in the
        corner that reads as something gone wrong. Lower down the frame is
        nothing but the repeating grid of glazing bars, which is what a wash
        wants: pattern at the edge of visibility, with no shape in it for the
        eye to catch on.

        The gradient is what guarantees the grid lands on plain ground: whatever
        the wash is doing at the top, it is fully `bg-surface` by the foot of
        this box, so no card sits on a half-tone. Layered as an overlay rather
        than a `mask-image` for the same reason PageBanner does it that way.

        Source: Pexels photo 323705, https://www.pexels.com/photo/323705/ -
        Pexels licence, commercial use, no attribution required. Downloaded into
        public/ rather than hotlinked: the CSP in next.config.ts is `img-src
        'self'` on purpose and the site fetches nothing third-party at runtime.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(60%,30rem)] select-none"
      >
        <Image
          src="/services/pexels-323705-glass-facade.jpg"
          alt=""
          fill
          sizes="100vw"
          quality={70}
          className="scale-x-[-1] object-cover object-[50%_78%] opacity-[0.16] grayscale"
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-surface/70 to-surface" />
      </div>

      {/*
        `relative`, so the column sits over the wash rather than under it.

        FULL-BLEED AT THE SITE'S BAND PADDING, where this was capped at 1440
        with `lg:px-12`. That cap was the wrong convention borrowed: this page
        has two, and they are not interchangeable. Hero, ProductGrid, Background
        and Stats are bands - uncapped, `px-6 md:px-8 lg:px-10`, content
        starting 40px from the screen edge at any width. Projects, the enquiry
        band and the footer are the home page's closing sheet, held to 1440 at
        `px-4 md:px-8 lg:px-12`. This section had the sheet's, and it is a band.

        On /services that is visible rather than theoretical, because both of
        its neighbours are bands: PageBanner sets its copy at `left-[1.823%]`
        of the viewport and the USP panel floats its own on percentages. Capped at
        1440 this column started 8px inside them at 1440 and 288px inside them
        at 1920 - see the same argument written out at length in WhyMevo, where
        the identical mistake was made and undone.
      */}
      <div className="relative w-full px-6 md:px-8 lg:px-10">
        {/*
          A VISIBLE `h2`, where this was `sr-only` before.

          It had to be hidden while the stack existed, because every panel
          printed "Our Services [01]" as its own label and a heading above them
          would have said the words a sixth time. Those labels are gone, and so
          is the "01 - 05" counter that sat under each panel: a counter telling
          the reader which of five they are on is only meaningful when they
          arrive one at a time, and they no longer do. The grid below is
          self-evidently five things and does not need numbering.

          `h2` and not `h1`: the page opens on PageBanner, and that banner's
          heading is the `h1`. See the note in ServicesBody.
        */}
        {/* The heading arrives first, the cards follow it. Purpose: sequence —
            the section reads top to bottom rather than landing in one piece. */}
        <Reveal>
          <h2 className="text-3xl leading-[1.1] font-medium tracking-tighter text-ink capitalize md:text-4xl lg:text-5xl">
            {services.heading}
          </h2>
        </Reveal>

        <ul
          role="list"
          /* `mt-16`/`mt-20` where this was `mt-10`/`mt-12`. A hairline rule
             used to sit between the heading and this grid, carrying 24px of
             margin above it and leaving the grid's own 40 below - so the two
             were 64px apart at base and 80 at `md`. Deleting the rule without
             folding its margin back in would have closed that to 40, which is
             tighter than the heading and the index have ever been and reads as
             the two running together. The separation was never the line; it was
             the space the line sat in. */
          className="mt-16 grid grid-flow-dense grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-6 md:mt-20 lg:grid-cols-5 lg:gap-x-8"
        >
          {services.items.map((service, i) => (
            /* `as="li"` RATHER THAN A WRAPPER, and that is not a style choice.
               The card is `sm:row-span-3 sm:grid sm:grid-rows-subgrid`, and a
               subgrid only works against its own parent's tracks — put a plain
               `<div>` between the `<ul>` and this `<li>` and the shared rows
               that keep every title and body aligned across a row collapse.
               `Reveal` renders the tag it is given, so the animation lands on
               the grid item itself and the layout is untouched. */
            <Reveal
              as="li"
              /* Stagger by position, capped. 60ms reads as a sequence; left
                 uncapped, the fifth card would wait 300ms after the first and
                 the row would finish visibly late. */
              delay={Math.min(i, 4) * 0.06}
              key={i}
              /*
                Six columns below `lg`, five at `lg` and up.

                On six, the first three cards take two columns each and the last
                two take three each: 2+2+2 then 3+3, both rows exactly full. At
                `lg` every card is one of five and the spans have to be reset,
                which is what the `lg:col-span-1` is doing - without it the
                sm-width spans would carry up and overflow the five-column row.

                `i < 3` rather than a span stored on the content: which row a
                service falls in is a property of how many services there are,
                not of the service itself, so putting it in SERVICES.items would
                mean three translated files had to agree about layout.

                Single column below `sm`, where any split is a thumbnail.

                THE SUBGRID IS WHAT KEEPS THE BODIES ON ONE LINE. A card is
                three stacked things and the middle one is a title that wraps to
                a different number of lines in every language - one in Chinese,
                two in English, three in Malay for "Reka Bentuk Tersuai &
                Pemilihan Sistem". Left as three cards' worth of ordinary flow,
                each paragraph starts wherever its own title happened to end and
                the row reads ragged.

                `grid-rows-subgrid` over the three tracks the card spans hands
                the photograph, the title and the body a shared row each, so
                every title in a row is as tall as the tallest and every body
                begins on the same line - in all three languages, with no
                per-language measurement to keep true. A fixed `min-height`
                would have been a guess that is right in English and wrong in
                Malay.

                `gap-y-0` because a subgrid inherits its parent's gutters, and
                the parent's `gap-y-10` is the space BETWEEN cards. Inherited
                inward it would open the same 40px between a card's photograph
                and its own title. The spacing inside the card is the `mt-*` on
                the two blocks below instead, which is not subject to that.
              */
              className={`group sm:row-span-3 sm:grid sm:grid-rows-subgrid sm:gap-y-0 ${
                i < 3 ? "sm:col-span-2" : "sm:col-span-3"
              } lg:col-span-1`}
            >
              {/*
                overflow-hidden is what crops the hover scale; without it the
                photograph grows past its own corners.

                THE CROP IS THE ONE THING THAT CHANGES PER BREAKPOINT, and each
                of the three values is paying for something.

                4:3 at `lg`, where all five cards are the same width and a
                square-ish crop is what makes the row read as one index.

                2:1 for the last two cards between `sm` and `lg` only. In that
                range they are three columns where the first three are two, so
                at one shared ratio their photographs come out half as tall
                again as the row above - 274px against 177 at an 820px viewport
                - and the section reads bottom-heavy. 2:1 over their own wider
                box lands them at 183px, within six pixels of the top row.

                16:9 on a phone, where the cards are one column and the crop is
                the whole cost of the section. 4:3 at 358px wide is a 268px
                photograph and only one service fits a screen; 16:9 is 201px and
                the next title clears the fold. A phone cannot show five
                photographed services at once whatever the ratio, but it can
                stop showing barely one.
              */}
              <div
                className={`relative aspect-[16/9] w-full overflow-hidden bg-surface-2 ${
                  i < 3 ? "sm:aspect-[4/3]" : "sm:aspect-[2/1] lg:aspect-[4/3]"
                }`}
              >
                <Image
                  src={service.image.src}
                  alt={service.image.alt}
                  fill
                  /* A card is a third of the viewport at tablet widths and a
                     fifth of it on a laptop, so the browser never needs the
                     full-width source these files are stored at. */
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
                  quality={80}
                  className="graded-soft object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-105"
                />
              </div>

              {/* h3 under the section's h2. The type scale is set by the
                  classes, not by the tag - the same note as in CoreUspsPanel. */}
              <h3 className="mt-5 text-lg leading-snug font-medium tracking-tight text-ink capitalize xl:text-xl">
                {service.title}
              </h3>

              {/* `ink-2` and not `ink-3`: on white, #5b6167 is 6.3:1 where
                  #8b9298 is 3.0:1, and this is body copy at 14px. */}
              <p className="mt-2.5 text-sm leading-relaxed text-ink-2">
                {service.body}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
