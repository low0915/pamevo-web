"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BACKGROUND } from "@/lib/content";

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
 * text instead, with a heavier blur since it has more image to dissolve.
 */
export function Background() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = rootRef.current;
    if (!section) return;

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
  }, []);

  return (
    <section
      ref={rootRef}
      data-autoplay={SEQUENCE}
      data-autoplay-speed={SPEED}
      className="relative h-[370dvh] motion-reduce:h-auto"
    >
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden motion-reduce:static motion-reduce:h-auto motion-reduce:min-h-[86vh]">
        <div data-bg-scale className="absolute inset-0">
          {BACKGROUND.images.map((image, i) => (
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
          <h2 className="max-w-[16ch] text-6xl leading-[1.02] font-medium tracking-tighter text-white max-md:mt-auto md:text-7xl lg:text-[5rem] xl:text-[5.5rem]">
            {BACKGROUND.heading}
          </h2>

          {/* The right padding is the 24px rail plus its 36px gap that the
              scroll indicator used to occupy. Held rather than reclaimed, so
              removing the indicator left the panel in exactly the box it
              already had. */}
          <div className="mt-10 w-full md:absolute md:top-1/2 md:right-8 md:mt-0 md:flex md:w-[min(52%,644px)] md:-translate-y-1/2 md:items-center md:pr-[60px] lg:right-10">
            <div className="glass-dark glass-rim relative overflow-hidden rounded-[4px] p-7 md:min-w-0 md:flex-1 md:p-9">
              {/* Both paragraphs occupy one cell, so the panel keeps a fixed
                  height and does not resize as the text swaps. */}
              <div className="grid">
                {BACKGROUND.paragraphs.map((paragraph, i) => (
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
