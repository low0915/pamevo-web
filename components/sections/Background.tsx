"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BACKGROUND, BACKGROUND_ZH, BACKGROUND_BM } from "@/lib/content";
import { useCopy } from "@/lib/locale";

gsap.registerPlugin(ScrollTrigger);

/**
 * WHICH PARAGRAPH IS WHICH, named rather than counted.
 *
 * BACKGROUND.paragraphs is four entries covering two chapters, two apiece: the
 * Group's history, split so /our-profile's lead can stack it in two brand bars,
 * then the MEVO partnership, split so that chapter can stack two glass panels.
 *
 * NOTHING MAY WORK THIS OUT BY COUNTING. The home page's pinned band is two
 * paragraphs against two photographs, and what it wants is the OPENING of each
 * chapter - [0] and [2]. Taking the first two would put both halves of the
 * history in the band and drop the partnership; taking the last two would lose
 * the opening. Mapping the array straight through, which is what it did before
 * the first split, gives four panels to two swap slots. All three failures are
 * silent - the page renders, it just says the wrong thing - which is why every
 * call site reads these names and no index is ever written as a literal.
 *
 * `[0]` of each is the opening, so `CHAPTER_ONE[0]` and `CHAPTER_TWO[0]` are
 * what the band takes and the full arrays are what /our-profile stacks.
 */
const CHAPTER_ONE = [0, 1] as const;
const CHAPTER_TWO = [2, 3] as const;

/** Where in the scrubbed runway the two steps hand over. */
const SWAP_AT = 0.42;
const SWAP_LEN = 0.16;

/** The scrubbed sequence, in viewport heights. The runway is 370dvh; this is
 *  the part of it the timeline is mapped across, and the part the autoplay
 *  carries. */
const SEQUENCE = 1.5;

/** How much of that the autoplay plays per second, once the frame has snapped
 *  to the top. Its sequence is the shorter of the two, so the same pace as the
 *  hero still spends less time here. */
const SPEED = 0.25;

/**
 * Industry Leadership & Background, as a two-step pinned section.
 *
 * The section is a 370vh runway with a `sticky` frame inside, so it holds
 * still while the runway scrolls past: the section scrolls internally before
 * the page moves on. One photograph and one paragraph per step; scrolling
 * crossfades the background and swaps the paragraph in the glass panel.
 *
 * The heading is white over the photograph, and both images are bright exactly
 * where it sits: the top-left measures luminance 194 and 171, which gives white
 * text only 1.8:1 and 2.3:1. The top scrim is therefore load-bearing, not
 * decoration. It darkens that band to roughly 87, taking white to about 7:1.
 *
 * The panel is the dark variant of the glass: a light frosted panel over this
 * photography washed out to near-white, so it is tinted dark and carries light
 * text instead, with a heavier blur since it has more image to dissolve. *
 * `standalone` is this section as a PAGE rather than as a band in the home
 * page's stack. Two things change and both have to: the curtain margin comes
 * off — it is a pull-up over whatever sits above it on the home page, and on
 * its own page there is nothing above it to ride over, so it would drag the
 * section up off the top of the document — and the heading becomes the `h1`,
 * because on its own page it is the page's own title rather than one band's
 * label under the hero's.
 */
export function Background({ standalone = false }: { standalone?: boolean }) {
  const rootRef = useRef<HTMLElement>(null);
  /* Capitalised because JSX reads a lowercase tag name as a literal element and
     an uppercase one as a component; this has to be the former, held in a
     variable, so the case is doing work rather than following a convention. */
  const Heading = standalone ? "h1" : "h2";
  const background = useCopy(BACKGROUND, { ZH: BACKGROUND_ZH, BM: BACKGROUND_BM });

  useEffect(() => {
    const section = rootRef.current;
    if (!section) return;
    // Nothing below exists on /our-profile: no pin, no scrub, no crossfade, and
    // none of the elements the timeline reaches for. Guarded here rather than
    // by not calling the hook, because the number of hooks a component runs
    // cannot change between renders.
    if (standalone) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const paragraphs = gsap.utils.toArray<HTMLElement>("[data-para]");

      if (reduced) {
        // No pinning, no swap: first image, both paragraphs stacked in flow.
        gsap.set("[data-bg='1']", { autoAlpha: 0 });
        gsap.set(paragraphs, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.set("[data-bg='1']", { autoAlpha: 0 });
      gsap.set(paragraphs[1], { autoAlpha: 0, y: 24 });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + window.innerHeight * SEQUENCE,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // The rule under the panel measures the section: it is the timeline's
      // own progress, so it fills at whatever pace the scroll — or the
      // autoplay — is moving at.
      timeline.fromTo(
        "[data-progress]",
        { scaleX: 0 },
        { scaleX: 1, duration: 1 },
        0,
      );

      // A slow push in across the whole section, always above 1 so the frame
      // can never expose an edge.
      timeline.fromTo(
        "[data-bg-scale]",
        { scale: 1.06 },
        { scale: 1.14, duration: 1 },
        0,
      );

      timeline.to(
        "[data-bg='1']",
        { autoAlpha: 1, duration: SWAP_LEN, ease: "power1.inOut" },
        SWAP_AT,
      );

      timeline.to(
        paragraphs[0],
        { autoAlpha: 0, y: -24, duration: SWAP_LEN * 0.5, ease: "power2.in" },
        SWAP_AT,
      );
      timeline.to(
        paragraphs[1],
        { autoAlpha: 1, y: 0, duration: SWAP_LEN * 0.6, ease: "power3.out" },
        SWAP_AT + SWAP_LEN * 0.5,
      );
    }, section);

    return () => ctx.revert();
  }, [standalone]);

  /**
   * The lead's entry on /our-profile, and the bar coming out from behind the
   * building.
   *
   * The wipe is a `clip-path: inset()` whose LEFT inset runs 100% to 0. That
   * pins the visible edge to the bar's right side and grows it leftward, which
   * is the direction asked for — and because the photograph is laid over the
   * right 56% of the stage and painted after the bar, the first half of the
   * travel happens underneath it. The bar appears to slide out from behind the
   * building rather than to draw itself on the page.
   *
   * `clip-path` rather than `scaleX` from a right origin, which is the usual
   * way to do this and is wrong here: a scale would squash the paragraph inside
   * the bar as it grew. A clip moves an edge and leaves the contents alone.
   *
   * The paragraph fades in at 1.25s, while the wipe is still travelling. That
   * is deliberate rather than sloppy timing: the text sits at the LEFT end of
   * the bar, which is the last part the clip uncovers, so it is still hidden by
   * the clip while it fades and arrives with the edge that reveals it.
   *
   * ScrollTrigger, not a mount timer, for consistency with every other section
   * — though at the top of a page the start condition is already met and it
   * fires on the first refresh, which is what a page-opening band wants.
   */
  useEffect(() => {
    if (!standalone) return;
    const section = rootRef.current;
    if (!section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      /* PLURAL, and that is the change the second bar forced. These were
         `querySelector`, which returns the first match and silently ignores the
         rest - so the lead would have wiped its clip open on bar one and left
         bar two clipped to nothing for the life of the page. A selector that
         returns one node reads identically whether there is one of something or
         five, which is exactly why it survives a change like this unnoticed. */
      const bars = gsap.utils.toArray<HTMLElement>("[data-lead='bar']", section);
      const paras = gsap.utils.toArray<HTMLElement>("[data-lead='para']", section);
      const photo = section.querySelector<HTMLElement>("[data-lead='photo']");
      const heading = section.querySelector<HTMLElement>("[data-lead='heading']");

      if (reduced) {
        gsap.set(bars, { clipPath: "inset(0% 0% 0% 0%)" });
        gsap.set([...paras, photo, heading], { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.set(bars, { clipPath: "inset(0% 0% 0% 100%)" });
      gsap.set(paras, { autoAlpha: 0 });
      gsap.set(heading, { autoAlpha: 0, y: 18 });
      gsap.set(photo, { autoAlpha: 0, y: 24 });

      const timeline = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 70%", once: true },
      });

      timeline.to(heading, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" });
      timeline.to(
        photo,
        { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" },
        0.1,
      );
      /* The bars wipe in sequence rather than together, and the paragraph
         inside each follows its own bar. `stagger` is short next to the 1.1s
         wipe, so the second is well under way before the first has finished -
         they read as one gesture opening across the page rather than as two
         panels taking turns, which at this size would be a slideshow. */
      timeline.to(
        bars,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.1,
          ease: "power2.inOut",
          stagger: 0.18,
        },
        0.45,
      );
      timeline.to(
        paras,
        { autoAlpha: 1, duration: 0.5, ease: "power2.out", stagger: 0.18 },
        1.25,
      );
    }, section);

    return () => ctx.revert();
  }, [standalone]);

  /**
   * /our-profile: the same words, told as a page instead of as a mechanism.
   *
   * The home page's version is one pinned frame that holds still while 370svh
   * of runway scrolls past it, crossfading photograph and paragraph at the
   * halfway mark. That is a good band in a stack of bands and a bad page: a
   * reader who came to /our-profile from the nav wants to READ two paragraphs,
   * and the scrubbed version hides the second one behind a scroll gesture, puts
   * both inside a frame that clips, and reports progress through a rule that
   * has nothing to be progress through when the section is the whole document.
   *
   * So the two steps become two sections and every part of the mechanism goes:
   * no `sticky`, no ScrollTrigger, no crossfade, no progress rule, and no
   * `data-autoplay` — which also takes this page off the autoplay's books,
   * since that works by finding the attribute in the DOM.
   *
   * Each section is sized by its own content with a floor, rather than to the
   * viewport. That is the fix for the clipping the pinned version had to fight:
   * the long comments in the frame below are all about a heading gaining a
   * fourth line on a 360px phone and pushing the panel's foot past an
   * `overflow-hidden` edge. Nothing here clips, so nothing here can.
   *
   * The panels alternate — right under the heading, then left — so the second
   * section is not the first one again with different words.
   */
  if (standalone) {
    return (
      <>
        {/* ------------------------------------------------------------------
            The lead, from Figma node 123:4, as a full-screen held frame.

            A 230svh runway with a `sticky` frame inside it, which is the same
            arrangement the home page's sections use and is what gives the page
            its curtain: the frame holds still while the runway scrolls past,
            and the second chapter is pulled up over it.

            The composition is the design's: a light ground, a scrim at the top,
            white heading, the brand bar carrying the paragraph, and the cut-out
            building over it from the right. The blue is the project's
            `--brand`; Figma says #033492 against the token's #033392, one step
            of green and invisible on screen.
            ------------------------------------------------------------------ */}
        <section
          ref={rootRef}
          id="story"
          /* `scroll-mt-24` clears the 80px header island for the "Our Story"
             dropdown link that targets #story. It is the top section, so the
             margin mostly clamps away at the top of the page; it earns its keep
             when a reader clicks it from further down /our-profile. */
          /* NO RUNWAY, WHERE THIS WAS 230svh.

             That number was never chosen; it was forced by the curtain, and
             the comment here used to derive it: the frame is one screen, the
             chapter below was pulled up 110svh over it, so the runway had to
             clear 210 or the curtain was already on screen at scroll zero.
             The curtain is gone from every page but the home page now, and
             the arithmetic went with it — leaving 230svh of scrolling that
             held a composition which does not change while it is held.

             That hold is the "snap": two and a bit screens of thumb travel in
             which the page does not answer, which reads as broken on a phone
             rather than as deliberate. The section is its own height now, so
             it scrolls like the two below it. */
          className="relative scroll-mt-24"
        >
          {/* `min-h`, NOT `h`, and that distinction is the whole fix.

              A fixed `h-[100lvh]` with `overflow-hidden` is a ceiling: anything
              the composition needs beyond one screen is cut off, which is why
              the picture was briefly being shrunk to fit inside it. As a floor
              the section still covers the screen — which is all that was asked
              — and simply grows on the laptops where the heading, the bar and a
              full-size building need more than 100lvh between them. Nothing
              inside has to move or resize for it.

              It was `lvh` while the frame was pinned and had to COVER — a box
              sized to the viewport-with-chrome leaves a strip showing the
              moment the URL bar slides away. Unpinned it covers nothing, so it
              takes `svh` like every other standing box on the site. */}
          {/* NOT STICKY ANY MORE, and so no foot-pin and no measured height.

              The `top: min(0px, 100lvh - height)` this carried is the foot-pin
              from Stats.tsx, and it only ever existed to hold a frame TALLER
              than the screen without stranding its base below the fold. With
              nothing pinning there is nothing to strand: the section is as tall
              as its content and the reader simply scrolls to the bottom of it.

              That expression needed the element's own height, which CSS cannot
              ask for, so a ResizeObserver measured it into `--frame-h` on every
              reflow. Nothing reads that variable now, so the observer, the ref
              and the effect that ran it are all gone rather than left running
              to write a property no rule consumes.

              `min-h-[100svh]` stays. The composition is a full-bleed ground
              with a heading, two bars and a cut-out building on it, and it
              wants a screen to sit in; it may grow past that on a laptop where
              the three need more room, which is what `min-h` allows and a fixed
              height would have clipped. `svh` not `lvh` now that it is not
              covering anything — see the note in globals.css. */}
          <div
            className="relative flex min-h-[100svh] w-full items-center overflow-hidden bg-bg motion-reduce:min-h-0 motion-reduce:py-20"
          >
            {/* The ground: the showroom again, blurred, behind the sharp
                cut-out of the same building.

                This replaces a grey gradient scrim over a flat light field.
                The photograph is `images[0]` rather than a path typed out here,
                so it stays the same file the home page's pinned frame uses and
                there is one place to change it.

                `scale-110` is not styling. A CSS blur samples past the
                element's own edges and finds nothing there, so a blurred image
                fades out into transparency around its whole perimeter and the
                frame shows a soft translucent border. Ten per cent of overscan
                pushes those edges outside the frame — at 1440 that is 72px a
                side against a 40px blur, which clears it.

                Decorative, so `alt=""` and `aria-hidden`: the same building is
                already described by the cut-out in front of it, and a screen
                reader does not need to be told it is there twice. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              <Image
                src={background.images[0].src}
                alt=""
                fill
                sizes="100vw"
                /* Lower than the sections that show this photograph sharp: it
                   is 40px of blur away from carrying any detail, and the bytes
                   would be spent on information the blur then destroys. */
                quality={55}
                className="scale-110 object-cover object-center blur-[40px]"
              />
            </div>

            {/* Centred in the frame, with `py-20` as the floor rather than the
                home page's `pt-32`: centring is what places this now, and the
                padding is only there to keep the block off the fixed header
                island, which owns the first 80px of the screen. Gutters are the
                home page's own, and there is no max-width, so the heading sits
                the same distance from the edge here as it does there. */}
            <div className="relative w-full px-6 py-20 md:px-8 lg:px-10">
              {/* Down 10% of its own height.

                  A TRANSLATE and not a margin, which is what makes the number
                  mean what it says: a percentage margin resolves against the
                  container's WIDTH, a percentage translate against the
                  element's own HEIGHT. It also leaves the layout alone, so
                  nudging the title does not push the stage below it back down —
                  the two are meant to converge.

                  On a WRAPPER and not on the h1, and that is not tidiness. The
                  entry animation does `gsap.set(heading, { y: 0 })`, which
                  writes an inline `transform` on the h1 and beats any transform
                  utility on the same element outright — the class was there and
                  computed to the identity matrix. GSAP keeps the h1's transform
                  to itself; the offset lives one level up where nothing
                  competes for it. */}
              <div className="translate-y-[10%]">
                <h1
                  data-lead="heading"
                  className="max-w-[16ch] text-[clamp(2rem,9.5vw,3.25rem)] leading-[1.02] font-medium tracking-tighter text-white md:text-6xl lg:text-[4.25rem] xl:text-[4.75rem]"
                >
                  {background.heading}
                </h1>
              </div>

              {/* The stage: bar behind, cut-out in front. The bar is FIRST in
                  the source and the picture second, which is what puts the
                  picture on top — both are positioned, so document order
                  decides and no z-index is needed.

                  The lift is 30% of the picture's height, and 13.6% is that
                  written as the percentage of WIDTH a margin actually resolves
                  against: the picture is 56% of the container and its aspect is
                  2115/1712, so its height is always 0.4533 of the container's
                  width, and 30% of that is 0.1360. Because both terms scale with
                  the same width the lift stays exactly 30% of the picture at
                  every size rather than drifting on a larger screen. Change the
                  picture's 56% and recompute this with it.

                  Still gated at 1360px. The lift grows with the screen while the
                  heading does not, so below about that width it pulls the bar
                  clean over the title — measured, the bar's top sat 77px above
                  the heading's foot at 1024 when this was only 30%.

                  There is NO `lg:mt-16` beside it any more, and its absence is
                  load-bearing. Tailwind emitted the `min-[1360px]` block ahead
                  of the `lg` one in the stylesheet — 34748 against 39665 — so
                  at 1440 the later `lg:mt-16` won on source order and the lift
                  computed to a flat 64px. It was dead from the moment it was
                  gated, and it looked like the number was wrong rather than the
                  cascade. Two margin utilities on one element only agree while
                  Tailwind happens to sort them in the order you assumed; below
                  1360 the base `mt-10` carries this instead, which is one rule
                  with nothing to lose to. */}
              <div className="relative mt-10 flex flex-col lg:block min-[1360px]:mt-[calc(4rem_-_13.6%)]">
                {/* TWO BARS, one per half of the history.

                    They are two boxes rather than two paragraphs inside one,
                    because the bar IS the brand field: a second paragraph added
                    to the single bar would have grown that field taller and
                    pushed the building, where two fields stacked with a gap
                    between them read as the design does - a band, a breath,
                    another band.

                    THE PAIR IS TOP-ANCHORED WHERE THE SINGLE BAR WAS
                    CENTRED, and that is the one number this change forced.
                    `top-[54%] -translate-y-1/2` put a box's MIDDLE just below
                    the middle of the frame, which is right while the box is one
                    bar tall and wrong the moment it is two: the stack grew in
                    both directions from its centre and its top edge climbed
                    over the heading - measured, it crossed "Our Story" and cut
                    the descenders off it.

                    Anchoring the top instead means the stack grows downward
                    only, into the empty half of the frame it was always sitting
                    in, so the heading above it is untouched however many bars
                    there are. 30% is where the first bar's top edge already
                    was, so the composition against the cut-out is the one that
                    was designed rather than a new one.

                    Both carry `data-lead="bar"` and both paragraphs carry
                    `data-lead="para"`, which is what the entry timeline
                    collects - see the note on `querySelectorAll` there. */}
                <div className="order-2 flex flex-col gap-3 lg:absolute lg:inset-x-0 lg:top-[30%] lg:gap-4">
                  {CHAPTER_ONE.map((index) => (
                    <div
                      key={index}
                      data-lead="bar"
                      className="bg-brand px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-10 lg:pr-[58%]"
                    >
                      {/* #f4f5f6 on the brand field is 10.2:1 — the same pale
                          ink the footer and the enquiry band use on this blue.

                          The bar's right padding is 58% where the design has
                          55%. The cut-out's far left is NOT transparent — the
                          pavement and the tree reach the edge of the canvas —
                          so text set to the design's measure ran under the
                          building and lost a word off six lines. */}
                      <p
                        data-lead="para"
                        className="max-w-[66ch] text-base leading-relaxed text-bg"
                      >
                        {background.paragraphs[index]}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Pulled out through the frame's gutter so the building meets
                    the edge of the screen. The negative margin is that gutter
                    at each breakpoint and has to stay in step with it.

                    56% of the container and nothing else. This briefly carried
                    a second cap that shrank the picture to whatever height was
                    left in the frame, which made the building visibly smaller
                    on every laptop — solving the frame's problem by damaging
                    the composition. The frame gives way instead: see `min-h`
                    on it rather than a fixed height.

                    DROPPED 6% OF ITS OWN HEIGHT, and the offset is on a WRAPPER
                    rather than on the picture's own box. That is the same trap
                    the heading's nudge is written around a few lines up: the
                    entry timeline does `gsap.set(photo, { y: 24 })` and tweens
                    it to 0, which writes an inline `transform` on this element
                    and beats any `translate-y` utility sitting on it outright —
                    the class would be there, computing to the identity matrix,
                    doing nothing. GSAP keeps this element's transform to
                    itself; the offset lives one level out where nothing
                    competes for it.

                    A translate and not a margin, so the drop is a share of the
                    PICTURE rather than of the container's width, and so it
                    moves the building without pushing the frame taller or
                    disturbing the bars it overlaps. Gated at `lg`, where the
                    picture is beside the bars; below that it is stacked above
                    them in flow and there is nothing to drop it against. */}
                <div className="contents lg:block lg:translate-y-[6%]">
                <div
                  data-lead="photo"
                  className="relative order-1 -mr-6 w-auto md:-mr-8 lg:-mr-10 lg:ml-auto lg:w-[56%]"
                >
                  <Image
                    src={background.isolated.src}
                    alt={background.isolated.alt}
                    width={background.isolated.width}
                    height={background.isolated.height}
                    sizes="(min-width: 1024px) 56vw, 100vw"
                    className="h-auto w-full"
                  />
                </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            The second chapter.

            IT USED TO RIDE UP OVER THE FIRST. `-mt-[110svh]` pulled it over the
            held frame above with `sheet` as the shadow on its rising edge, both
            borrowed from the home page's sections so the transition was tuned
            rather than invented.

            That was the LAST curtain left outside the home page, and it is now
            gated with the rest of them. The distinction the gate draws is worth
            keeping straight: this section still PINS — the frame above still
            holds and its sequence still scrubs, on every page — because a pin
            is how the section reads itself. What has gone is only the overlap,
            one chapter crossing over another, which is the part that made this
            page behave like the home page rather than like the rest of the
            site.

            `standalone` is /our-profile, which is the only route that renders
            this section that way, so this is the one flag both curtains in this
            file now hang off. It is not a second condition for the same thing:
            the section-level curtain below is this section riding over what
            precedes it on the home page, and this one is the chapter break
            inside it.

            THE TWO FLOORS ARE NOT THE SAME NUMBER AND NOT THE SAME JOB.
            `110svh` belongs to the pull-up: a curtain has to be at least as
            tall as the distance it is pulled over or it stops covering
            partway, so that floor only exists where the curtain does.

            `100svh` is this chapter standing on its own, which is what it does
            on /our-profile now that the curtain is gone. It is a full-bleed
            photograph with a panel on it, and a band like that either fills the
            screen or looks like a mistake - so the floor is one screen exactly,
            and the section grows past it when the copy needs more. `svh` and
            not `vh` for the reason the rest of the file gives: `vh` on a phone
            is the height WITHOUT browser chrome, so a section sized to it is
            always a strip taller than what the reader can see.
            ------------------------------------------------------------------ */}
        <section
          className={`relative w-full overflow-hidden ${
            standalone ? "" : "sheet -mt-[110svh] motion-reduce:mt-0"
          }`}
        >
          <Image
            src={background.images[1].src}
            alt={background.images[1].alt}
            fill
            sizes="100vw"
            quality={78}
            className="graded-soft object-cover object-[50%_35%]"
          />
          {/* NO MAX-WIDTH, which is what makes this chapter's gutter the same
              gutter as the one above it. This box was capped at 1440 and
              centred while the lead section has no cap at all: at 1920 that put
              the panel 280px from the edge against the heading's 40, and at
              2560 it was 600 against 40. Two chapters of one page, one of them
              held to the middle — and the curtain runs straight between them,
              which is the one place a difference in margin is impossible to
              miss. Gutters are the home page's own at every width now: 24, 32,
              40. */}
          <div
            className={`relative flex w-full flex-col justify-center px-6 py-20 md:px-8 md:py-24 lg:px-10 motion-reduce:min-h-0 ${
              standalone ? "min-h-[100svh]" : "min-h-[110svh]"
            }`}
          >
            {/* Right, where it was left. The building in the lead section comes
                in from the right and the eye leaves the chapter above on that
                side, so the panel is where the reader already is. `self-end`
                rather than a margin, so the column's own padding stays the
                thing that sets its distance from the edge — the same 40px the
                heading above it sits at. */}
            {/* TWO PANELS, one per half of the partnership, stacked in the
                same column the single panel occupied.

                Two boxes rather than two paragraphs in one, for the reason the
                lead's two bars are two boxes: the glass IS the panel, so a
                second paragraph inside would have grown one pane taller where
                two panes with a gap read as the material repeating. `gap-4` is
                the lead's own spacing between its bars at this breakpoint, so
                the two chapters stack on the same rhythm. */}
            <div className="flex w-full flex-col gap-4 md:w-[min(52%,644px)] md:self-end">
              {CHAPTER_TWO.map((index) => (
                <div
                  key={index}
                  className="glass-dark glass-rim relative overflow-hidden rounded-[4px] p-6 md:p-9"
                >
                  <p className="text-base leading-relaxed text-bg">
                    {background.paragraphs[index]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <section
      ref={rootRef}
      data-autoplay={SEQUENCE}
      data-autoplay-speed={SPEED}
      // Rises over the product band's held frame, the same way WhyChoose rises
      // over this one. -110svh puts the first sight of it 40svh into that
      // band's 150svh of hold and lands it flush 10svh before the band
      // releases, so the release always happens behind a covered screen.
      //
      // The frame below is 100lvh and opaque, and it is the section's own top
      // edge, so the rising edge needs no ground of its own — unlike WhyChoose,
      // whose runway shows past its frame. `sheet` is the shadow that edge
      // carries as it lifts: without it a full-bleed photograph sliding over a
      // full-bleed photograph reads as a cut rather than as a curtain.
      //
      // All of which is the home page's arrangement, and none of it applies on
      // /our-profile — see `standalone`.
      className={`relative h-[370svh] motion-reduce:h-auto ${
        standalone ? "" : "sheet -mt-[110svh] motion-reduce:mt-0"
      }`}
    >
      {/* `lvh`, where the runway around it is `svh`. The two are doing
          different jobs: the runway is a length in the scroll chain and has to
          hold still, but this frame has to COVER, and a box sized to the
          viewport-with-chrome leaves a strip of page showing along the bottom
          the moment the URL bar slides away. `lvh` is the viewport at its
          tallest, so the frame always reaches the foot of the screen; the
          overflow when the bar is showing costs nothing, because what is
          inside is `object-cover` and clipped anyway. */}
      <div className="sticky top-0 h-[100lvh] w-full overflow-hidden motion-reduce:static motion-reduce:h-auto motion-reduce:min-h-[86vh]">
        <div data-bg-scale className="absolute inset-0">
          {background.images.map((image, i) => (
            <div key={image.src} data-bg={i} className="absolute inset-0">
              <Image
                src={image.src}
                alt={i === 0 ? image.alt : ""}
                aria-hidden={i !== 0}
                fill
                sizes="100vw"
                quality={78}
                className="graded-soft object-cover object-[50%_35%]"
              />
            </div>
          ))}
        </div>

        {/* Load-bearing: white heading over a bright sky fails without it. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[55%]"
          style={{
            background:
              "linear-gradient(to bottom, rgb(12 14 17 / 0.62) 0%, rgb(12 14 17 / 0.34) 45%, rgb(12 14 17 / 0) 100%)",
          }}
        />

        {/* Title sits at the top of the frame. The top padding is set by the
            fixed header island, which occupies the first 80px of the viewport:
            anything less and the heading runs underneath it. */}
        <div className="relative flex h-full w-full flex-col px-6 pt-24 pb-6 md:px-8 md:pt-28 md:pb-14 lg:px-10 lg:pt-32 motion-reduce:h-auto">
          {/* Below `md` the heading and the panel sit together at the foot of
              the frame, so the panel's bottom edge lands on the screen's own
              bottom gutter rather than leaving a band of bare photograph under
              it. `mt-auto` on the first child rather than `justify-end` on the
              flex: an auto margin never resolves negative, so on a short phone
              where the two of them already fill the frame it collapses to 0
              and the block stays put, where `justify-end` would push the
              heading off the top of an `overflow-hidden` frame. `pt-24` still
              guards that case - it is the fixed header island's own height. */}
          {/* Fluid below `md`, fixed above it.

              The mobile size was a flat 60px, and that is where this section
              broke: the heading and the panel share the frame's height, the
              frame is `overflow-hidden`, and 60px put `Industry Leadership &
              Background` on four lines on a 360px phone. Measured there, the
              panel's foot landed 108px BELOW the frame - the last lines of the
              paragraph and the progress rule were simply cut off. A flat size
              cannot help: the widths that break it are the ones where the
              heading gains a line, and it gains it silently.

              `clamp` ties it to the viewport instead, so the heading takes the
              same three lines from 320px up rather than growing a fourth on the
              narrow end. The desktop sizes come down a step with it - this is a
              section heading over photography, not the page's own title, and it
              was competing with the hero. */}
          <Heading className="max-w-[16ch] text-[clamp(2rem,9.5vw,3.25rem)] leading-[1.02] font-medium tracking-tighter text-white max-md:mt-auto md:text-6xl lg:text-[4.25rem] xl:text-[4.75rem]">
            {background.heading}
          </Heading>

          {/* The right padding is the 24px rail plus its 36px gap that the
              scroll indicator used to occupy. Held rather than reclaimed, so
              removing the indicator left the panel in exactly the box it
              already had. */}
          {/* The gap and the panel's own padding are tighter below `md` than
              they were. On a phone the heading and the panel share one
              viewport-tall frame that clips, so every millimetre of rhythm here
              is spent against the paragraph having somewhere to go; above `md`
              the panel floats beside the heading with the whole frame to itself
              and keeps its original spacing. */}
          <div className="mt-6 w-full md:absolute md:top-1/2 md:right-8 md:mt-0 md:flex md:w-[min(52%,644px)] md:-translate-y-1/2 md:items-center md:pr-[60px] lg:right-10">
            <div className="glass-dark glass-rim relative overflow-hidden rounded-[4px] p-6 md:min-w-0 md:flex-1 md:p-9">
              {/* Both paragraphs occupy one cell, so the panel keeps a fixed
                  height and does not resize as the text swaps. */}
              <div className="grid">
                {[background.paragraphs[CHAPTER_ONE[0]], background.paragraphs[CHAPTER_TWO[0]]].map((paragraph, i) => (
                  <p
                    key={i}
                    data-para={i}
                    className="col-start-1 row-start-1 text-base leading-relaxed text-bg motion-reduce:row-start-auto motion-reduce:mb-4"
                    style={i > 0 ? { opacity: 0 } : undefined}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* How far through the section the reader is, laid along the
                  panel's own bottom edge. It rides inside the panel, which
                  clips it, so it takes that corner radius without carrying a
                  shape of its own; absolute, so the panel's padding does not
                  inset it. A readout, not a control: nothing here is
                  draggable. Hidden with reduced motion, where the section is
                  in flow and has no progress to report. */}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-[rgb(244_245_246/0.18)] motion-reduce:hidden"
              >
                <span
                  data-progress
                  className="block h-full w-full origin-left scale-x-0 bg-[rgb(244_245_246/0.85)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
