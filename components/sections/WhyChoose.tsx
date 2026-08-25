"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WHY_CHOOSE } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

/** Each part owns an equal share of the runway; the handover sits at its end. */
const PARTS = WHY_CHOOSE.parts.length;
const SWAP_LEN = 0.12;

/** The scrubbed sequence, in viewport heights. The runway is 460dvh; this is
 *  the part of it the timeline is mapped across, and the part the autoplay
 *  carries. */
const SEQUENCE = 2.4;

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
 * Why Choose MEVO Malaysia: one photograph, three panel parts, internal scroll.
 *
 * A 460vh runway with a sticky frame, so the section advances through its own
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
export function WhyChoose() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = rootRef.current;
    if (!section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const parts = gsap.utils.toArray<HTMLElement>("[data-part]");
      const frame = section.querySelector<HTMLElement>("[data-frame]");
      const marker = section.querySelector<HTMLElement>("[data-marker]");
      const panel = section.querySelector<HTMLElement>("[data-panel]");
      const leader = section.querySelector<SVGLineElement>("[data-leader]");

      // The marker travels with the photograph while the panel stays put, so
      // the line between them is measured rather than assumed.
      const drawLeader = () => {
        if (!frame || !marker || !panel || !leader) return;
        const f = frame.getBoundingClientRect();
        const m = marker.getBoundingClientRect();
        const p = panel.getBoundingClientRect();
        leader.setAttribute("x1", String(m.left + m.width / 2 - f.left));
        leader.setAttribute("y1", String(m.top + m.height / 2 - f.top));
        leader.setAttribute("x2", String(p.left - f.left));
        leader.setAttribute("y2", String(p.top - f.top + 18));
      };

      if (reduced) {
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

        // One progress segment per part, each filling across its own share.
        timeline.fromTo(
          `[data-bar='${i}']`,
          { scaleX: 0 },
          { scaleX: 1, duration: share },
          share * i,
        );
      });

      drawLeader();
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      data-autoplay={SEQUENCE}
      data-autoplay-speed={SPEED}
      // Rises over Background's pinned frame. -60dvh puts the first sight of it
      // at 90dvh into Background's 150dvh of travel, which is just after that
      // section's paragraph swap finishes, and lands it flush as the frame
      // releases. bg-bg because the runway outside the frame is transparent and
      // would otherwise show the section beneath.
      className="sheet relative -mt-[110dvh] h-[460dvh] bg-bg motion-reduce:mt-0 motion-reduce:h-auto"
    >
      <div
        data-frame
        className="sticky top-0 h-[100dvh] w-full overflow-hidden motion-reduce:static motion-reduce:h-auto motion-reduce:min-h-[86vh]"
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
            className="absolute top-[49%] left-[41.0%] block size-[42px] border-5 border-[rgb(226_29_29)]"
            style={{ transform: `scale(${1 / DRIFT_SCALE})` }}
          />
        </div>

        <svg
          data-annotation
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <line
            data-leader
            stroke="rgb(226 29 29)"
            strokeWidth="1"
            x1="0"
            y1="0"
            x2="0"
            y2="0"
          />
        </svg>

        <div
          data-panel
          className="glass absolute top-1/2 right-[6%] left-6 flex max-h-[86dvh] -translate-y-1/2 flex-col rounded-[4px] p-6 md:left-auto md:w-[min(36%,470px)] md:p-8 motion-reduce:static motion-reduce:mx-6 motion-reduce:my-10 motion-reduce:max-h-none motion-reduce:translate-y-0"
        >
          {/* Scroll progress, one segment per part. */}
          <div aria-hidden className="mb-7 flex gap-3">
            {WHY_CHOOSE.parts.map((part, segment) => (
              <span
                key={part.title + segment}
                className="h-px flex-1 overflow-hidden bg-[rgb(16_18_21/0.18)]"
              >
                <span
                  data-bar={segment}
                  className="block h-full w-full origin-left scale-x-0 bg-[rgb(16_18_21/0.75)]"
                />
              </span>
            ))}
          </div>

          <div className="grid">
            {WHY_CHOOSE.parts.map((part, i) => (
              <div
                key={part.title + i}
                data-part={i}
                className="col-start-1 row-start-1 motion-reduce:row-start-auto motion-reduce:mb-8"
                style={i > 0 ? { opacity: 0 } : undefined}
              >
                <h3 className="text-2xl font-medium tracking-tight text-ink md:text-3xl">
                  {part.title}
                </h3>

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
            {WHY_CHOOSE.tagline.map((line) => (
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
