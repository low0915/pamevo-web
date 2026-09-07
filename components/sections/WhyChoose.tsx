"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WHY_CHOOSE, WHY_CHOOSE_ZH, WHY_CHOOSE_BM } from "@/lib/content";
import { USP_PART } from "@/components/sections/CoreUspsPanel";
import { useCopy } from "@/lib/locale";

gsap.registerPlugin(ScrollTrigger);

/**
 * The first two parts of WHY_CHOOSE are not shown here.
 *
 * `parts[0]` is "Why Choose MEVO Malaysia" and its four claims, and the home
 * page gives that its own band — see WhyMevo — so printing it here as well
 * would be the same four sentences twice on one site.
 *
 * `parts[1]` is the ten USPs, and they are now a section of their own: see
 * CoreUspsPanel, which is the band directly above this one on /services. They
 * were swapped through this panel by the timeline below, which meant nine of
 * the ten were behind a scroll at any moment. `FIRST` is imported from there
 * rather than written as a second `1` here, so the two cannot drift apart and
 * start printing the same list twice.
 *
 * What is left is the six engineering figures. That is one part, so the swap
 * has nothing to swap and the timeline below is down to the drift, the marker
 * and a single progress bar — all of which it handles without special-casing,
 * because every length here is derived from PARTS rather than assumed.
 *
 * Everything counts off this rather than off `parts.length`, so the runway, the
 * timeline shares and the progress bars all follow automatically if the content
 * changes again.
 */
const FIRST = USP_PART + 1;
const PARTS = WHY_CHOOSE.parts.length - FIRST;

/** Each part owns an equal share of the runway; the handover sits at its end. */
const SWAP_LEN = 0.12;

/**
 * The runway, in viewport heights, and the three lengths it is made of.
 *
 * It was written down as 460svh and 2.4 while there were three parts to show.
 * Both are derived now, because they were never independent numbers: 0.8 of a
 * screen of scrub per part is the reading pace, the frame is one screen, and
 * the tail is the pinned hold the closing sheet is drawn over. Dropping a part
 * without shortening the runway would have left each remaining one holding half
 * as long again as it was paced for.
 *
 * At two parts: 100 + 160 + 120 = 380svh, against 460 at three.
 */
const PER_PART = 0.8;
const TAIL = 120;
const SEQUENCE = PER_PART * PARTS;
const RUNWAY = 100 + SEQUENCE * 100 + TAIL;

/** How much of that the autoplay plays per second, once the frame has snapped
 *  to the top. The same pace as the sections above, so the page keeps one
 *  reading speed throughout its opening. */
const SPEED = 0.20;

/**
 * Background drift. The scale must always out-run the travel or the frame
 * exposes an edge: scale(S) bleeds (S-1)/2 of the frame at each edge, so 1.5
 * gives 25% against a 22% travel, leaving 3% of margin at any viewport height.
 */
const DRIFT_SCALE = 1.5;
const DRIFT_TRAVEL = 22;

/**
 * The feature bands: one photograph, two panel parts, internal scroll.
 *
 * A runway with a sticky frame, so the section advances through its own
 * parts before the page moves on. The background never changes, it only drifts.
 * That drift is in percent rather than pixels so it can never exceed the scale
 * bleed and expose an edge at any viewport height. See DRIFT_SCALE.
 *
 * The marker sits inside the drifting wrapper, so it holds the same point of
 * the photograph as the image moves. The leader line is redrawn from live
 * geometry whenever the timeline renders, which keeps it welded to the marker
 * through the scrub settle and through resizes.
 *
 * All three parts occupy one grid cell, so the panel is sized by the longest
 * of them and never resizes as they swap. Its height is content-driven rather
 * than a fixed inset, which keeps it tight to the copy instead of leaving an
 * empty band under the shorter parts.
 */
export function WhyChoose({ standalone = false }: { standalone?: boolean }) {
  const rootRef = useRef<HTMLElement>(null);
  /* Only the closing commitment has Chinese copy; the three panel parts fall
     through to the English originals. See WHY_CHOOSE_ZH. */
  const whyChoose = useCopy(WHY_CHOOSE, { ZH: WHY_CHOOSE_ZH, BM: WHY_CHOOSE_BM });

  useEffect(() => {
    const section = rootRef.current;
    if (!section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const parts = gsap.utils.toArray<HTMLElement>("[data-part]", section);
      const frame = section.querySelector<HTMLElement>("[data-frame]");
      const marker = section.querySelector<HTMLElement>("[data-marker]");
      const panel = section.querySelector<HTMLElement>("[data-panel]");
      const leader = section.querySelector<SVGLineElement>("[data-leader]");

      // The marker travels with the photograph while the panel stays put, so
      // the line between them is measured rather than assumed. It stops on the
      // marker's top-right corner rather than running to its centre: the panel
      // is up and to the right, so that is the corner facing it, and stopping
      // there leaves the square reading as an unbroken outline.
      const drawLeader = () => {
        if (!frame || !marker || !panel || !leader) return;
        const f = frame.getBoundingClientRect();
        const m = marker.getBoundingClientRect();
        // Below `md` the annotation is display:none, so it measures zero and
        // there is nothing to point at. Bail rather than redraw the line into
        // the corner on every frame of the scrub.
        if (!m.width) return;
        const p = panel.getBoundingClientRect();
        leader.setAttribute("x1", String(m.right - f.left));
        leader.setAttribute("y1", String(m.top - f.top));
        leader.setAttribute("x2", String(p.left - f.left));
        leader.setAttribute("y2", String(p.top - f.top + 18));
      };

      /* STANDALONE TAKES THE SAME EXIT AS REDUCED MOTION, and it has to.
         The scrub below is written against a pinned frame - it measures its
         range in screen heights from `top top` and moves the photograph
         against a frame that is holding still. Off the pin there is nothing
         holding, so that range maps onto a section already scrolling past at
         the same speed: the drift would slide the photograph inside its own
         box for no visible reason and the leader line would chase it.

         Everything the sequence would have revealed is simply shown instead -
         one part, visible, which is all this section has had since the USPs
         moved out into a band of their own. The annotation goes for the same
         reason it goes under
         reduced motion: it points from a marker on a drifting photograph to a
         panel, and neither is moving now. */
      if (reduced || standalone) {
        gsap.set(parts, { autoAlpha: 1, y: 0 });
        gsap.set("[data-annotation]", { autoAlpha: 0 });
        return;
      }

      parts.slice(1).forEach((part) => gsap.set(part, { autoAlpha: 0, y: 24 }));

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + window.innerHeight * SEQUENCE,
          scrub: 1,
          invalidateOnRefresh: true,
          onRefresh: drawLeader,
        },
        // Redraw on the timeline, not on the ScrollTrigger. ScrollTrigger's
        // onUpdate fires when the scroll position changes, but with scrub the
        // drift carries on settling for about a second after the wheel stops:
        // hooking there would freeze the line while the marker kept moving.
        onUpdate: drawLeader,
      });

      timeline.fromTo(
        "[data-drift]",
        { yPercent: 0 },
        { yPercent: -DRIFT_TRAVEL, duration: 1 },
        0,
      );

      const share = 1 / PARTS;

      parts.forEach((part, i) => {
        // Every part except the last hands over at the end of its share.
        if (i < PARTS - 1) {
          const swapAt = share * (i + 1) - SWAP_LEN * 0.5;
          timeline.to(
            part,
            { autoAlpha: 0, y: -24, duration: SWAP_LEN * 0.5, ease: "power2.in" },
            swapAt,
          );
          timeline.to(
            parts[i + 1],
            { autoAlpha: 1, y: 0, duration: SWAP_LEN * 0.6, ease: "power3.out" },
            swapAt + SWAP_LEN * 0.5,
          );
        }

      });

      drawLeader();
    }, section);

    return () => ctx.revert();
  }, [standalone]);

  return (
    <section
      ref={rootRef}
      data-autoplay={SEQUENCE}
      data-autoplay-speed={SPEED}
      // Rises over Background's pinned frame. -110svh puts the first sight of
      // it well into that section's travel and lands it flush as the frame
      // releases. bg-bg because the runway outside the frame is transparent and
      // would otherwise show the section beneath.
      //
      // All of which is the home page's arrangement. On /services this follows
      // the services stack in ordinary flow, with nothing above it to ride
      // over, so the pull-up and the shadow come off — a curtain drawn over a
      // section that is not pinned covers content instead of crossing it. The
      // runway and the frame inside it stay: the scrubbed sequence is the
      // section, not the transition into it.
      className={`relative bg-bg motion-reduce:h-auto ${
        standalone
          ? ""
          : "sheet h-[var(--runway)] -mt-[110svh] motion-reduce:mt-0"
      }`}
      /* The runway is derived from the number of parts shown — see RUNWAY — so
         Tailwind cannot know it, and it arrives as a variable rather than as an
         inline `height`. That is not a style preference: an inline height beats
         every class, so it would have overridden `motion-reduce:h-auto` and
         left a 380svh gap under the section for readers who ask for reduced
         motion, where the frame is static and the parts are simply stacked.
         Handed over as a custom property, both heights are classes again and
         the variant wins on source order the way it is meant to. */
      style={{ "--runway": `${RUNWAY}svh` } as CSSProperties}
    >
      {/* THE FRAME IS ONLY PINNED ON THE HOME PAGE NOW.

          It was `sticky top-0 h-[100lvh]` everywhere, and on /services that had
          stopped earning it. A pinned frame is how a section holds still while
          its own sequence scrubs past, and this section has one part left to
          show - so the pin held a static panel on the screen for 300svh of
          scrolling in which nothing changed. That is the "snap" a reader feels
          on a phone: the page stops answering the thumb, and the only way out
          is to keep scrolling through three screens of nothing.

          Standalone it is an ordinary block that scrolls like the two sections
          above it. `min-h` rather than `h`, so the panel can grow past a screen
          on a phone instead of being clipped by it - which is the same choice
          Background's lead makes and for the same reason. */}
      <div
        data-frame
        className={`w-full overflow-hidden ${
          standalone
            ? "relative flex min-h-[100svh] items-center"
            : "sticky top-0 h-[100lvh] motion-reduce:static motion-reduce:h-auto motion-reduce:min-h-[86vh]"
        }`}
      >
        <div
          data-drift
          className="absolute inset-0"
          style={{ transform: `scale(${DRIFT_SCALE})` }}
        >
          <Image
            src={WHY_CHOOSE.image.src}
            alt={WHY_CHOOSE.image.alt}
            fill
            sizes="100vw"
            quality={78}
            className="graded-soft object-cover"
          />

          {/* Anchored to the photograph so it keeps the same point as the image
              drifts, and counter-scaled so it does not render at DRIFT_SCALE
              times its nominal size, border included. */}
          <span
            data-marker
            data-annotation
            aria-hidden
            className="absolute top-[46.4%] left-[44.8%] block size-[42px] border-5 border-[#033392] max-md:hidden"
            style={{ transform: `scale(${1 / DRIFT_SCALE})` }}
          />
        </div>

        <svg
          data-annotation
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full max-md:hidden"
        >
          <line
            data-leader
            stroke="#033392"
            strokeWidth="2"
            x1="0"
            y1="0"
            x2="0"
            y2="0"
          />
        </svg>

        <div
          data-panel
          className="glass absolute top-1/2 right-[6%] left-6 flex max-h-[86svh] -translate-y-1/2 flex-col rounded-[4px] p-6 max-md:top-auto max-md:bottom-6 max-md:translate-y-0 md:left-auto md:w-[min(36%,470px)] md:p-8 motion-reduce:static motion-reduce:mx-6 motion-reduce:my-10 motion-reduce:max-h-none motion-reduce:translate-y-0"
        >
          <div className="grid">
            {/* Keyed by position, not by title: the locale toggle rewrites
                every title, and remounting these would throw away the inline
                opacity the scrubbed timeline is holding them at. */}
            {whyChoose.parts.slice(FIRST).map((part, i) => (
              <div
                key={i}
                data-part={i}
                className="col-start-1 row-start-1 motion-reduce:row-start-auto motion-reduce:mb-8"
                style={i > 0 ? { opacity: 0 } : undefined}
              >
                {/* h2, not h3. This section has no heading of its own — each
                    part's title is the heading — so an h3 here sat under no h2
                    and broke the page outline between Background's h2 and
                    Stats'. The type scale is set by the classes, not the tag. */}
                <h2 className="text-2xl font-medium tracking-tight text-ink md:text-3xl">
                  {part.title}
                </h2>

                <ul className="mt-4 list-disc space-y-2 pl-4 text-base leading-relaxed text-ink marker:text-ink-3">
                  {part.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                {"note" in part && part.note ? (
                  <p className="mt-4 pl-4 text-base leading-relaxed text-ink-2 italic">
                    {part.note}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          {/* Constant across all parts, sitting directly under them.
              ink-2 rather than ink-3: on the panel's ~237 ground ink-3 is
              2.9:1, ink-2 is 5.3:1. */}
          <p className="mt-8 text-base leading-relaxed text-ink-2">
            {whyChoose.tagline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
