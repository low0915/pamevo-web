"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STATS, STATS_IMAGE } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

/** Left indent per figure, as a share of the text column. Staggering them is
 *  what makes the group read as a descending diagonal rather than a list.
 *  The block boxes fill the column, but the ink stops well short of it. */
const INDENT = ["56%", "24%", "42%", "20%"];

/** How far each leader reaches into the photograph, as a share of its width.
 *  Varying it keeps the four ends from lining up into a second vertical edge. */
const REACH = [0.1, 0.02, 0.03, 0.1];

/** Seconds between one figure starting and the next. */
const STEP = 0.5;

/** How long the photograph has the stage before the first leader draws. */
const PHOTO_LEAD = 0.45;

/**
 * Stat band: four staggered figures on the left, the product shot on the
 * right, each figure joined to a point on the photograph by a leader line.
 *
 * On first scroll into view the figures arrive one at a time. Each leader
 * draws outward from the photograph to the figure's position, and the figure
 * then rises into place behind it, so the line reads as pointing something out
 * rather than as decoration that happens to be there.
 *
 * The leaders are measured, not drawn to fixed coordinates: each is a single
 * horizontal run from inside the photograph out to its label, sharing the
 * label's baseline, so the geometry survives a reflow. Points are ordered
 * image-first because the dash reveal follows the path's direction, and the
 * draw has to begin at the photograph.
 *
 * The block is centred by balancing two margins that are not symmetrical in
 * the markup: the space on the left comes from the figure indents, the space
 * on the right from the grid's own margin. Changing one without the other
 * tips the composition to that side.
 *
 * Below md the layout stacks and the leaders are hidden: they would have to
 * cross the whole column to reach an image that is no longer beside them.
 */
export function Stats() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let observer: ResizeObserver | undefined;

    const ctx = gsap.context(() => {
      const lines = STATS.map((_, i) =>
        root.querySelector<SVGPolylineElement>(`[data-connector='${i}']`),
      );
      const figures = STATS.map((_, i) =>
        root.querySelector<HTMLElement>(`[data-figure='${i}']`),
      );
      const photo = root.querySelector<HTMLElement>("[data-photo]");

      const draw = () => {
        const rootRect = root.getBoundingClientRect();
        const stacked = window.matchMedia("(max-width: 767px)").matches;

        STATS.forEach((_, i) => {
          const line = lines[i];
          const label = root.querySelector<HTMLElement>(`[data-label='${i}']`);
          const image = root.querySelector<HTMLElement>("[data-photo]");
          if (!line || !label || !image) return;

          if (stacked) {
            line.setAttribute("points", "");
            return;
          }

          const l = label.getBoundingClientRect();
          const img = image.getBoundingClientRect();

          // Subtract whatever offset the reveal currently has on this figure.
          // Measuring the animated position instead would put every leader
          // 24px low before the reveal runs, and drop the last one outside the
          // SVG entirely, where it is clipped and simply never appears.
          const figure = figures[i];
          const offsetY = figure ? Number(gsap.getProperty(figure, "y")) || 0 : 0;

          // A single horizontal run: the line sits on the label's resting
          // baseline and travels straight into the photograph.
          const y = l.bottom - rootRect.top + 7 - offsetY;
          const fromX = img.left - rootRect.left + img.width * REACH[i];
          const toX = l.left - rootRect.left;

          // Image first: the dash reveal runs along the path's direction, so
          // the path has to start where the draw should start.
          line.setAttribute("points", `${fromX},${y} ${toX},${y}`);

          // A reflow changes the path length, so the dash has to be reset to
          // match, without un-drawing a line that has already finished.
          const length = line.getTotalLength();
          gsap.set(line, {
            strokeDasharray: length,
            strokeDashoffset: line.dataset.drawn === "1" ? 0 : length,
          });
        });
      };

      if (reduced) {
        lines.forEach((line) => {
          if (line) line.dataset.drawn = "1";
        });
        gsap.set(figures, { autoAlpha: 1, y: 0 });
        draw();
      } else {
        draw();
        gsap.set(figures, { y: 24 });
        gsap.set(photo, { autoAlpha: 0, scale: 1.06, clipPath: "inset(100% 0% 0% 0%)" });

        const timeline = gsap.timeline({
          scrollTrigger: { trigger: root, start: "top 68%", once: true },
        });

        // The photograph lands first: the leaders read as reaching out from
        // something already there.
        timeline.to(
          photo,
          {
            autoAlpha: 1,
            scale: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.9,
            ease: "power3.out",
          },
          0,
        );

        STATS.forEach((stat, i) => {
          const at = PHOTO_LEAD + i * STEP;
          const line = lines[i];
          const figure = figures[i];
          const number = root.querySelector<HTMLElement>(`[data-num='${i}']`);

          if (line) {
            timeline.to(
              line,
              {
                strokeDashoffset: 0,
                duration: 0.55,
                ease: "power2.inOut",
                onComplete: () => {
                  line.dataset.drawn = "1";
                },
              },
              at,
            );
          }

          if (figure) {
            timeline.to(
              figure,
              { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" },
              at + 0.32,
            );
          }

          if (number) {
            // Counted here rather than by an in-view counter of its own, so
            // the number cannot finish counting while its figure is hidden.
            const playhead = { value: 0 };
            timeline.to(
              playhead,
              {
                value: stat.value,
                duration: 0.7,
                ease: "power2.out",
                onUpdate: () => {
                  number.textContent = Math.round(playhead.value) + stat.suffix;
                },
              },
              at + 0.32,
            );
          }
        });
      }

      observer = new ResizeObserver(draw);
      observer.observe(root);
    }, root);

    return () => {
      observer?.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section className="sheet relative mb-[4em] -mt-[50dvh] bg-bg py-24 md:py-32 motion-reduce:mt-0">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8 lg:px-12">
        <div
          ref={rootRef}
          className="relative grid gap-12 md:mr-[12%] md:grid-cols-[1fr_minmax(0,36%)] md:gap-4"
        >
          <dl className="flex flex-col justify-center gap-10 md:gap-14 md:py-4">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                data-figure={i}
                style={{ marginLeft: INDENT[i], opacity: 0 }}
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span
                    data-num={i}
                    className="block font-mono text-[clamp(2.2rem,4vw,3.5rem)] leading-none font-medium tracking-tight text-ink"
                  >
                    {stat.value}
                    {stat.suffix}
                  </span>
                  <span
                    data-label={i}
                    className="mt-2 inline-block text-base leading-snug text-ink md:text-lg"
                  >
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <div data-photo className="relative aspect-[0.58] w-full">
            <Image
              src={STATS_IMAGE.src}
              alt={STATS_IMAGE.alt}
              fill
              sizes="(max-width: 768px) 92vw, 36vw"
              quality={80}
              className="object-cover"
            />
          </div>

          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible md:block"
          >
            {STATS.map((stat, i) => (
              <polyline
                key={stat.label}
                data-connector={i}
                points=""
                fill="none"
                stroke="rgb(16 18 21 / 0.55)"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}
