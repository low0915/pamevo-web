"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SERVICES, SERVICES_ZH } from "@/lib/content";
import { useCopy } from "@/lib/locale";

gsap.registerPlugin(ScrollTrigger);

const CARDS = SERVICES.items.length;
/** Panels move one fewer time than there are panels: the first is already there. */
const ENTRANCES = CARDS - 1;
const SHARE = 1 / ENTRANCES;

/** How far the covered panel dims while the next one rides over it. */
const SETTLE_ALPHA = 0.5;

/**
 * Our Services, as a pinned stack of full-bleed panels.
 *
 * The section is a 530vh runway with a `sticky` frame inside, so it holds still
 * while the runway scrolls past. All five panels fill that frame, and each one
 * rises from below over the panel before it. Nothing is crossfaded and nothing
 * scrolls away: the stack only ever grows, so the last panel is the one left
 * standing.
 *
 * The travel is 1:1 with the scroll and linear. Each entrance is given one
 * screen of runway and moves the panel exactly one screen, with `ease: "none"`
 * and `scrub: true`, so the panel tracks the wheel rather than easing between
 * resting places: it reads as the next service simply scrolling up over the
 * one before, not as a slideshow advancing. This is why the timeline ends at
 * `innerHeight * ENTRANCES` and not at some looser multiple — any other number
 * makes the panel drift faster or slower than the page and gives the movement
 * away. Lenis already smooths the scroll itself, so a scrub lag on top of it
 * would only add a second lerp.
 *
 * Stacking order is DOM order. Absolutely positioned siblings paint in document
 * order, so panel 5 covers panel 4 without a single z value, which keeps this
 * section out of the documented scale in `lib/z.ts`.
 *
 * The covered panel dims as it goes under, which keeps the two readable as two
 * during the overlap. It is not scaled: these panels are full-bleed, and any
 * scale would pull their edges off the frame and show the page behind. It casts
 * no shadow either — panel and section carry the same ground, and a shadow on
 * the band above would separate them into two tones.
 *
 * The breakpoint and the reduced-motion condition are held in globals.css
 * (`.svc-*`) under the same media query this timeline uses. Below md, or with
 * reduced motion, the panels are in flow and the section reads top to bottom
 * with no pin and no timeline.
 */
export function Services() {
  const rootRef = useRef<HTMLElement>(null);
  const services = useCopy(SERVICES, SERVICES_ZH);

  useEffect(() => {
    const section = rootRef.current;
    if (!section) return;

    // matchMedia rather than a one-off check: crossing the breakpoint has to
    // tear the timeline down and rebuild it, or the panels stay parked at
    // whatever offset they held on the wide layout.
    const mm = gsap.matchMedia(section);

    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]", section);
        if (cards.length < 2) return;

        // Every panel but the first waits below the frame. yPercent, so it is
        // the panel's own height and a resize needs no re-measuring.
        gsap.set(cards.slice(1), { yPercent: 100 });

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            // One panel of scroll per handover, measured off the panel itself
            // rather than off the viewport: a panel is shorter than the frame
            // by the band above it, and scrolling a screen to move it 86% of a
            // screen is exactly the drift that gives the travel away. The
            // runway is longer than this, and the sticky frame holds the last
            // panel through the rest.
            end: () => "+=" + cards[0].offsetHeight * ENTRANCES,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        timeline.fromTo(
          "[data-progress]",
          { scaleX: 0 },
          { scaleX: 1, duration: 1 },
          0,
        );

        cards.slice(1).forEach((card, i) => {
          // Back to back, no holds between them: the stack is in motion for the
          // whole runway, which is what keeps it continuous rather than snappy.
          const at = SHARE * i;

          timeline.to(card, { yPercent: 0, duration: SHARE }, at);

          // `cards[i]` is the panel this one is covering: the loop runs over
          // panels 1..n, so index i in the slice is index i + 1 in the stack.
          timeline.to(
            cards[i],
            { autoAlpha: SETTLE_ALPHA, duration: SHARE },
            at,
          );
        });
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <section ref={rootRef} className="svc-curtain sheet relative mb-[4em] bg-ink">
      {/* The heading is carried by each panel's label, so the section keeps one
          for structure without repeating it on screen five times. */}
      <h2 className="sr-only">{services.heading}</h2>

      <div className="svc-runway">
        <div className="svc-frame relative">
          {/* Keyed by position rather than by title: the locale toggle
              rewrites every title, and remounting the panels would drop the
              inline transforms the stack is being scrubbed through. */}
          {services.items.map((service, i) => (
            <article
              key={i}
              data-card
              className="svc-card bg-ink"
            >
              {/* This padding is for the panels in flow only. Pinned, the
                  space above the content belongs to the frame instead, and
                  globals.css zeroes this out. */}
              {/* Below `md` this is a flex column, not a grid: the panel is
                  held to exactly one screen there (globals.css), and something
                  has to give when the screen is short. The copy is what must
                  not, so the photograph is the flex item - it takes whatever
                  is left after the copy has been laid out, at any phone size,
                  rather than claiming a 4:5 block and pushing the copy off the
                  bottom of a panel that clips. */}
              <div className="svc-grid grid h-full grid-cols-1 pt-20 max-md:flex max-md:flex-col md:grid-cols-2">
                <div className="svc-figure-frame p-6 max-md:min-h-0 max-md:flex-1 md:p-8 lg:p-10">
                  <div className="svc-figure relative aspect-[4/5] w-full max-md:aspect-auto max-md:h-full">
                    <Image
                      src={service.image.src}
                      alt={service.image.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 46vw"
                      quality={80}
                      className="graded-soft object-cover"
                    />
                  </div>
                </div>

                {/* The left padding is deliberately lighter than the right:
                    the photograph already carries its own inset, so matching
                    them would read as one wide trench between the columns. */}
                <div className="flex flex-col justify-between gap-10 px-6 pt-6 pb-12 max-md:shrink-0 max-md:gap-6 max-md:pt-4 max-md:pb-8 md:gap-14 md:pr-10 md:pl-4 md:pt-8 md:pb-14 lg:pr-14 lg:pl-6 lg:pt-10">
                  {/* The rule sits on the top edge of the photograph opposite
                      it, so the two columns start on the same line. */}
                  <div className="border-t border-white pt-5">
                    <span className="text-base text-white capitalize md:text-lg">
                      {services.heading} [{String(i + 1).padStart(2, "0")}]
                    </span>
                  </div>

                  <div>
                    <h3 className="text-3xl leading-tight font-medium tracking-tight text-bg capitalize md:text-[2.25rem] lg:text-[2.75rem]">
                      {service.title}
                    </h3>

                    <p className="mt-7 max-w-[52ch] border-y border-[rgb(244_245_246/0.18)] py-7 text-base leading-relaxed text-[rgb(244_245_246/0.72)]">
                      {service.body}
                    </p>
                  </div>

                  <span
                    aria-hidden
                    className="font-mono text-xs tracking-[0.22em] text-[rgb(244_245_246/0.4)]"
                  >
                    {String(i + 1).padStart(2, "0")} —{" "}
                    {String(CARDS).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </article>
          ))}

          {/* Scroll progress for the stack, on the frame rather than on a panel
              so it survives every handover. Last in the DOM, so it paints over
              the panels for the same reason they paint over each other. */}
          <div
            aria-hidden
            className="svc-progress absolute inset-x-0 bottom-0 hidden h-px overflow-hidden bg-[rgb(244_245_246/0.16)]"
          >
            <span
              data-progress
              className="block h-full w-full origin-left scale-x-0 bg-[rgb(244_245_246/0.65)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
