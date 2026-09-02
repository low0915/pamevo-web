"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BACKGROUND, BACKGROUND_ZH, BACKGROUND_BM } from "@/lib/content";
import { useCopy } from "@/lib/locale";

gsap.registerPlugin(ScrollTrigger);

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
    // Nothing below exists on /our-story: no pin, no scrub, no crossfade, and
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
   * /our-story: the same words, told as a page instead of as a mechanism.
   *
   * The home page's version is one pinned frame that holds still while 370svh
   * of runway scrolls past it, crossfading photograph and paragraph at the
   * halfway mark. That is a good band in a stack of bands and a bad page: a
   * reader who came to /our-story from the nav wants to READ two paragraphs,
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
        {background.images.map((image, i) => (
          <section
            key={image.src}
            className="relative w-full overflow-hidden"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="100vw"
              quality={78}
              className="graded-soft object-cover object-[50%_35%]"
            />

            {/* Only the first section carries one, and only because it carries
                the heading. White type over this photography is 1.8:1 on the
                bright corner it sits in — the note on the pinned frame below
                has the measurements. The second section's only light text is
                inside the dark glass panel, which brings its own ground. */}
            {i === 0 && (
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-[62%]"
                style={{
                  background:
                    "linear-gradient(to bottom, rgb(12 14 17 / 0.62) 0%, rgb(12 14 17 / 0.34) 45%, rgb(12 14 17 / 0) 100%)",
                }}
              />
            )}

            {/* `pt-24` on the first section is the fixed header island, which
                owns the first 80px of the viewport. The rest is a floor, not a
                height: `min-h` lets a long paragraph or a narrow phone make the
                section taller instead of clipping it. */}
            <div
              className={`relative mx-auto flex w-full max-w-[1440px] flex-col px-6 pb-16 md:min-h-[80svh] md:px-8 md:pb-24 lg:px-10 ${
                i === 0 ? "pt-24 md:pt-32" : "pt-16 md:justify-center md:pt-24"
              }`}
            >
              {i === 0 && (
                <h1 className="max-w-[16ch] text-[clamp(2rem,9.5vw,3.25rem)] leading-[1.02] font-medium tracking-tighter text-white md:text-6xl lg:text-[4.25rem] xl:text-[4.75rem]">
                  {background.heading}
                </h1>
              )}

              {/* Right on the first, left on the second. `mt-auto` on the first
                  drops it to the foot of the section, under the heading; the
                  second has no heading to sit under, so it centres instead. */}
              <div
                className={`mt-8 w-full md:w-[min(52%,644px)] ${
                  i === 0 ? "md:mt-auto md:self-end" : "md:mt-0 md:self-start"
                }`}
              >
                <div className="glass-dark glass-rim relative overflow-hidden rounded-[4px] p-6 md:p-9">
                  <p className="text-base leading-relaxed text-bg">
                    {background.paragraphs[i]}
                  </p>
                </div>
              </div>
            </div>
          </section>
        ))}
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
      // /our-story — see `standalone`.
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
                {background.paragraphs.map((paragraph, i) => (
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
