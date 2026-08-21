"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PROJECTS } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";

/** Frame edge rake. The outer element is skewed and the contents are
 *  counter-skewed, which keeps the border radius intact: a clip-path polygon
 *  would give the angle but square off every corner. */
const SKEW = 4;

export function Projects() {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const frames = Array.from(
      root.querySelectorAll<HTMLElement>("[data-frame]"),
    );
    const ratios = new Map<number, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.frame);
          ratios.set(index, entry.intersectionRatio);
        }
        // Most-visible frame wins; ties resolve to the leftmost, so the frame
        // sitting in the focus position stays sharp rather than flickering
        // between two equally visible neighbours.
        let best = 0;
        let bestRatio = -1;
        ratios.forEach((ratio, index) => {
          if (ratio > bestRatio + 0.01) {
            bestRatio = ratio;
            best = index;
          }
        });
        setActive(best);
      },
      // Fine-grained thresholds: an observer only reports when a threshold is
      // crossed, so a coarse list lets the focused frame lag behind the scroll.
      { root, threshold: Array.from({ length: 21 }, (_, step) => step / 20) },
    );

    frames.forEach((frame) => observer.observe(frame));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="sheet svc-curtain relative mb-[4em] bg-bg py-24 md:py-36">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8 lg:px-12">
        <Reveal>
          <h2 className="text-4xl leading-[1.1] font-medium tracking-tighter text-ink md:text-5xl lg:text-6xl">
            {PROJECTS.heading}
          </h2>
        </Reveal>

        <ul
          ref={scrollerRef}
          className="hscroll mt-14 flex gap-4 overflow-x-auto overflow-y-hidden pb-6 md:mt-16"
        >
          {PROJECTS.images.map((image, i) => (
            <li
              key={image.src}
              data-frame={i}
              className="relative shrink-0 overflow-hidden rounded-[16px] border border-[rgb(126_133_140/0.25)] bg-surface-2"
              style={{
                transform: `skewX(-${SKEW}deg)`,
                width: "clamp(280px, 74vw, 520px)",
                aspectRatio: "16 / 10",
              }}
            >
              <div
                className="absolute inset-0"
                style={{ transform: `skewX(${SKEW}deg) scale(1.14)` }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  data-active={i === active}
                  sizes="(max-width: 768px) 74vw, 520px"
                  className="frame-img object-cover"
                />
              </div>

              <span
                className="absolute top-4 right-4 rounded-full bg-ink px-3.5 py-1.5 font-mono text-xs tracking-tight text-bg"
                style={{ transform: `skewX(${SKEW}deg)` }}
              >
                {image.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
