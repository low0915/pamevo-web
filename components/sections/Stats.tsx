"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STATS, STATS_INTRO, STATS_IMAGE } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

/** Seconds between one figure arriving and the next. */
const STEP = 0.16;

/** Seconds each horizontal rule takes to trace, upper then lower. Deliberately
    unequal: two lines of the same length drawn at the same speed read as one
    gesture, and the plan is meant to read as two. */
const HORIZONTAL_SPEED = [0.7, 1.3];

/* Type scale, straight off the design: 56 / 36 / 16 at 1920, each written as
   the vw it was drawn at and capped so it stops growing past that width. The
   figure and label floors sit below what 1024 - the narrowest width that gets
   the plan - works out to, so inside the plan they stay proportional to
   everything else placed off that width.

   Body copy is the exception: 16px flat, standfirst and boxes alike, matching
   every other section. Copy this small stops being copy if it scales with the
   drawing. */
const FIGURE = "text-[2rem] leading-[1.05] tracking-[-0.01em] lg:text-[clamp(1.75rem,2.92vw,3.5rem)]";
const LABEL = "text-[1.25rem] leading-[1.15] tracking-[-0.01em] lg:text-[clamp(1.125rem,1.875vw,2.25rem)]";
const BODY = "text-base leading-[1.45] lg:leading-[1.4]";

/** Inset from a box's own rule to its content: 34px of the 1920 drawing. */
const CELL = "lg:pt-[max(1rem,2.2dvh)] lg:pr-[1.77vw] lg:pb-[max(1.25rem,3dvh)] lg:pl-[1.77vw]";

/** Supporting line under a figure: 350px of the drawing, held to that same
    fraction of the width so it keeps its distance from the photograph, which
    is placed off the width too. The 13rem floor is what 16px copy needs to
    stay copy on a small laptop; the photograph slides right there to leave
    room for it. */
const CELL_BODY = "mt-10 max-w-[46ch] lg:mt-0 lg:max-w-[min(max(18.2vw,13rem),350px)]";

/* A rule of the plan: zero on one axis with a border on that edge, so it is a
   hairline that snaps to the device pixel grid the way a box border does - a
   1px background box rounds up to two at 125% scaling and reads thicker than
   everything around it.

   Each rule is a grid item pinned to a grid line, so it follows the row or
   column it belongs to rather than being measured a second time, and it draws
   from the end it is anchored at: the horizontals from the right, the
   verticals from the top. */
const RULE = "pointer-events-none hidden border-ink lg:block";
const RULE_H = `${RULE} lg:col-span-3 lg:col-start-1 lg:h-0 lg:w-full lg:origin-right lg:self-start lg:border-t`;
const RULE_V = `${RULE} lg:h-full lg:w-0 lg:origin-top lg:justify-self-start lg:border-l`;

/**
 * Stat band, drawn as the ruled plan from the Figma layout.
 *
 * The composition is one 1920x1080 frame - the same 16:9 the pinned band is
 * held on - so it is built in the units it was drawn in: horizontal offsets in
 * vw, vertical offsets in dvh, both taken as fractions of that frame. At a
 * 16:9 viewport it lands on the design; away from it the parts stretch with
 * their own axis instead of the whole thing scaling off-screen.
 *
 * Four hairlines carry the structure, each one continuous rather than a border
 * per box: two horizontals running the full width, the long vertical at 54%
 * running the full height, and the one at 27.6% dropping from the first
 * horizontal to the floor. Holding them as their own grid items is also what
 * keeps them on the page while a box is still hidden, since a box arrives by
 * `autoAlpha` and would otherwise take its own borders with it.
 *
 * The two rows of boxes are `1fr` under one `min-h`, so all three boxes are the
 * same height whatever the viewport does.
 *
 * The photograph is a cut-out on transparency and sits above the rules, running
 * off the right edge; the frame clips it. The lower half of the band carries a
 * gradient up out of #d9d9d9, which is what stops the white boxes reading as
 * empty paper.
 *
 * On first scroll into view the plan draws itself - horizontals tracing right
 * to left at two different speeds, verticals top to bottom - the photograph
 * wipes up behind it, and then the boxes arrive one at a time, each figure
 * counting as it lands. The
 * count runs off the same timeline rather than from a counter of its own, so a
 * number can never finish counting while its box is still hidden. The suffix is
 * a separate element from the digits on purpose: the count rewrites its
 * element's text every frame, so a suffix inside it would be erased on the
 * first tick.
 *
 * Below lg the plan is dropped for a single column - the rules come off, each
 * block carries one top border, and the photograph falls to the end.
 */
export function Stats() {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // The phone curtain pins this band by its foot rather than its head, or
  // everything below its first screen would be stranded - see `.band-frame` in
  // globals.css. A foot pin is a negative `top` set to the band's own height,
  // and CSS has no way to ask for that, so it is measured here and written
  // back as a variable. Observed rather than measured once: the band reflows
  // with the URL bar and with a rotation, and a stale height leaves the pin
  // either short of the foot or past it.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () =>
      frame.style.setProperty("--band-h", `${Math.round(frame.offsetHeight)}px`);

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const intro = gsap.utils.toArray<HTMLElement>("[data-intro]", root);
      const figures = STATS.map(
        (_, i) => root.querySelector<HTMLElement>(`[data-figure='${i}']`),
      ).filter((figure): figure is HTMLElement => figure !== null);
      const photo = root.querySelector<HTMLElement>("[data-photo]");
      const horizontals = gsap.utils.toArray<HTMLElement>("[data-rule='h']", root);
      const verticals = gsap.utils.toArray<HTMLElement>("[data-rule='v']", root);

      if (reduced) {
        gsap.set([...intro, ...figures], { autoAlpha: 1, y: 0 });
        gsap.set([...horizontals, ...verticals], { scaleX: 1, scaleY: 1 });
        gsap.set(photo, { autoAlpha: 1, scale: 1, clipPath: "inset(0%)" });
        return;
      }

      gsap.set(intro, { autoAlpha: 0, y: 20 });
      gsap.set(figures, { autoAlpha: 0, y: 24 });
      gsap.set(horizontals, { scaleX: 0 });
      gsap.set(verticals, { scaleY: 0 });
      gsap.set(photo, {
        autoAlpha: 0,
        scale: 1.06,
        clipPath: "inset(100% 0% 0% 0%)",
      });

      const timeline = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 68%", once: true },
      });

      // The plan draws itself first and the boxes land into it: one hand
      // moving right to left, then top to bottom. The two horizontals travel
      // at different speeds and are never in step - the upper one is quick and
      // arrives first, the lower one takes almost twice as long over a line of
      // the same length, which is what keeps the pair from reading as one
      // stamped shape.
      horizontals.forEach((rule, i) => {
        timeline.to(
          rule,
          {
            scaleX: 1,
            duration: HORIZONTAL_SPEED[i] ?? 0.9,
            ease: i === 0 ? "power2.out" : "power1.inOut",
          },
          i * 0.12,
        );
      });
      timeline.to(
        verticals,
        { scaleY: 1, duration: 0.9, ease: "power2.inOut", stagger: 0.1 },
        0.12,
      );

      // The photograph lands with the plan, so the figures arrive into a
      // composition that is already standing rather than onto empty paper.
      timeline.to(
        photo,
        {
          autoAlpha: 1,
          scale: 1,
          clipPath: "inset(0%)",
          duration: 0.9,
          ease: "power3.out",
        },
        0,
      );

      timeline.to(
        intro,
        { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" },
        0.05,
      );

      STATS.forEach((stat, i) => {
        const figure = figures[i];
        const number = root.querySelector<HTMLElement>(`[data-num='${i}']`);
        // Into the plan as it is drawn: the upper rule has landed and the
        // slower lower one is still travelling.
        const at = 0.6 + i * STEP;

        if (figure) {
          timeline.to(
            figure,
            { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" },
            at,
          );
        }

        if (number) {
          const playhead = { value: 0 };
          timeline.to(
            playhead,
            {
              value: stat.value,
              duration: 0.7,
              ease: "power2.out",
              onUpdate: () => {
                number.textContent = String(Math.round(playhead.value));
              },
            },
            at,
          );
        }
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="band-runway sheet relative mb-[4em] -mt-[110dvh] min-h-[110dvh] bg-surface motion-reduce:mt-0 motion-reduce:min-h-0">
      {/* Pinned, so the curtain that follows has something still to ride over.
          A pinned frame is one screen, and globals.css holds this band to it.
          `min-h` is for everywhere else: a curtain has to be at least as tall
          as its own pull-up. */}
      <div ref={frameRef} className="band-frame">
        {/* The bleed of the photograph is clipped here rather than on the
            section: `.sheet` cannot take overflow without trapping the sticky
            frame it is riding on. */}
        <div ref={rootRef} className="relative w-full overflow-hidden">
          {/* Lower half of the band lifts out of grey. Literal, not a token:
              it is a one-off wash from the design, not a surface colour. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[55.5dvh] bg-gradient-to-t from-[#d9d9d9] to-surface lg:block"
          />

          {/* Every item is placed by hand rather than flowed: the rules are
              items too, and auto-placement would hand one a box's slot. */}
          <div className="relative grid grid-cols-1 lg:min-h-[100dvh] lg:grid-cols-[27.6%_26.5%_1fr] lg:grid-rows-[minmax(43.2dvh,auto)_repeat(2,minmax(28.4dvh,1fr))]">
            {/* The intro runs to the long vertical rule. Its top inset clears
                the header island, so it has a floor in rem as well as the
                7.7dvh it was drawn at. */}
            <div className="px-6 pt-28 pb-12 lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:px-0 lg:pt-[max(7.7dvh,6rem)] lg:pb-0 lg:pl-[4.22vw]">
              <h2 data-intro className={`${FIGURE} font-normal text-ink`}>
                {STATS_INTRO.heading.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>

              <p
                data-intro
                className={`${BODY} mt-5 max-w-[52ch] text-ink lg:mt-[2dvh] lg:max-w-[min(44vw,844px)]`}
              >
                {STATS_INTRO.body}
              </p>
            </div>

            {/* The plan. The short vertical starts at the first horizontal
                rather than at the top of the frame: carried up, it would strike
                through the heading. */}
            <span aria-hidden data-rule="h" className={`${RULE_H} lg:row-start-2`} />
            <span aria-hidden data-rule="h" className={`${RULE_H} lg:row-start-3`} />
            <span
              aria-hidden
              data-rule="v"
              className={`${RULE_V} lg:col-start-2 lg:row-span-2 lg:row-start-2`}
            />
            <span
              aria-hidden
              data-rule="v"
              className={`${RULE_V} lg:col-start-3 lg:row-span-3 lg:row-start-1`}
            />

            <StatCell stat={STATS[0]} index={0} className="lg:col-start-2 lg:row-start-2" />
            <StatCell stat={STATS[1]} index={1} className="lg:col-start-3 lg:row-start-2" />
            <StatCell stat={STATS[2]} index={2} className="lg:col-start-2 lg:row-start-3" />
          </div>

          {/* Above the rules and off the right edge, as drawn: sized off the
              width so it keeps the proportion it was exported at, and hung
              from the bottom rather than the top so it always runs past the
              frame's lower edge. Anchored the other way it stops short on a
              viewport wider than 16:9 and shows the flat edge the cut-out was
              never meant to show. */}
          <div
            data-photo
            className="pointer-events-none relative mt-2 w-full select-none lg:absolute lg:top-auto lg:-bottom-[1.3dvh] lg:left-[70%] lg:mt-0 lg:w-[55.3%] xl:left-[67.5%]"
          >
            <Image
              src={STATS_IMAGE.src}
              alt={STATS_IMAGE.alt}
              width={2999}
              height={2488}
              sizes="(max-width: 1024px) 100vw, 56vw"
              quality={80}
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * One figure in the plan: number and label at the top of its box, supporting
 * line dropped to the bottom, which is what holds the two rows in register.
 *
 * The box draws no rules of its own inside the plan - those are the continuous
 * lines laid over the grid. The top border it carries is for the stacked
 * layout below lg, where there is no plan to belong to.
 */
function StatCell({
  stat,
  index,
  className,
}: {
  stat: (typeof STATS)[number];
  index: number;
  className: string;
}) {
  return (
    <div
      data-figure={index}
      className={`relative flex flex-col justify-between border-t border-ink px-6 py-10 lg:border-t-0 lg:px-0 lg:py-0 ${CELL} ${className}`}
    >
      <div>
        <p className={`${FIGURE} flex items-baseline font-normal text-ink`}>
          <span data-num={index} className="tabular-nums">
            {stat.value}
          </span>
          {stat.suffix ? <span>{stat.suffix}</span> : null}
        </p>
        <p className={`${LABEL} mt-1 font-normal text-ink lg:mt-[0.35vw]`}>
          {stat.label}
        </p>
      </div>

      <p className={`${BODY} ${CELL_BODY} text-ink`}>{stat.body}</p>
    </div>
  );
}
