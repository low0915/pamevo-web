"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  WHY_CHOOSE,
  WHY_CHOOSE_ZH,
  WHY_CHOOSE_BM,
  CORE_USP_MEDIA,
  CORE_USP_NOTES,
  CORE_USP_NOTES_ZH,
  CORE_USP_NOTES_BM,
} from "@/lib/content";
import { useCopy, useLocale } from "@/lib/locale";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The index of the USP part inside WHY_CHOOSE.parts.
 *
 * IT LIVES HERE BECAUSE THIS IS THE SECTION THAT PRINTS THAT PART, and it is
 * exported because EngineeringCarousel counts its own index off it — the
 * engineering figures are the part directly after the ten USPs. One constant,
 * so the two bands cannot both claim the same entry when `parts` is reordered.
 */
export const USP_PART = 1;

/** How long each USP holds before the next, when nobody is choosing, in ms. */
const INTERVAL = 6000;
/** The crossfade between two USPs' media, in ms. */
const FADE = 800;

/**
 * Our 10 Core USPs: the ten in a dark glass panel on the left, and behind
 * the section, full bleed, the picture or clip of whichever one is chosen.
 *
 * ONE PICTURE AT A TIME, AND THE LIST CHOOSES IT. Pointing at a USP (or
 * focusing it, or tapping it) crossfades the background to that USP's media
 * and opens its one-line note under it. Left alone, the section walks through
 * the ten on a timer, a thin line under the current one filling as it goes,
 * the same language as the home hero. The timer only runs while the section is
 * on screen, so a reader arrives at 01; it pauses while the pointer or focus
 * is inside, and does not run at all under reduced motion.
 *
 * Every picture is darkened and desaturated alike (`.usp-grade`), so ten
 * pictures from ten sources read as one set, and the white type on the left
 * holds over any of them. A video plays only while it is the one showing.
 *
 * On a phone the media is a band across the top of the section, fading into
 * the ground, and the panel sits below it.
 *
 * The media and the notes are parallel to the USP list by index: see
 * CORE_USP_MEDIA in lib/content.ts. The list itself is read from
 * `WHY_CHOOSE.parts[USP_PART]`.
 */
export function CoreUspsPanel() {
  const whyChoose = useCopy(WHY_CHOOSE, { ZH: WHY_CHOOSE_ZH, BM: WHY_CHOOSE_BM });
  const { locale } = useLocale();
  const usps = whyChoose.parts[USP_PART];
  const notes = { EN: CORE_USP_NOTES, ZH: CORE_USP_NOTES_ZH, BM: CORE_USP_NOTES_BM }[locale];
  const count = usps.items.length;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    /* The first time it is really on screen, start the walk from 01, so a
       timer that began on a brief earlier glimpse does not greet the reader
       mid-list. */
    let seen = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !seen) {
          seen = true;
          setActive(0);
        }
        setInView(entry.isIntersecting);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const next = useCallback(() => setActive((i) => (i + 1) % count), [count]);

  // Keyed on `active`, so choosing one restarts the full interval.
  useEffect(() => {
    if (paused || reduced || !inView) return;
    const id = window.setTimeout(next, INTERVAL);
    return () => window.clearTimeout(id);
  }, [active, paused, reduced, inView, next]);

  // Only the showing clip plays.
  useEffect(() => {
    videos.current.forEach((video, i) => {
      if (!video) return;
      if (i === active && inView && !reduced) video.play().catch(() => {});
      else video.pause();
    });
  }, [active, inView, reduced]);

  const running = !paused && !reduced && inView;

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden bg-[#050607] pt-[40svh] pb-16 md:py-24 lg:py-28"
      onMouseLeave={() => setPaused(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      {/* The media: every USP's layer, stacked, only the chosen one shown. A
          band across the top on a phone; the whole section from `md`. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[55svh] select-none md:inset-0 md:h-auto"
      >
        {CORE_USP_MEDIA.slice(0, count).map((media, i) => (
          <div
            key={media.image}
            className="usp-grade absolute inset-0 transition-opacity ease-in-out"
            style={{ opacity: i === active ? 1 : 0, transitionDuration: `${FADE}ms` }}
          >
            {media.video ? (
              <video
                ref={(el) => {
                  videos.current[i] = el;
                }}
                src={media.video}
                poster={media.image}
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <Image src={media.image} alt="" fill sizes="100vw" quality={75} className="object-cover" />
            )}
          </div>
        ))}

        {/* Read against: dark on the left where the panel is, clear by the
            right (from `md`); on a phone, the band fades into the ground at
            its foot. And the section's own foot closes to the ground colour
            so the join with the next band is not a seam. */}
        {/* Kept to the panel's side and the very foot, so the picture right
            of the panel is shown as it is: dark only up to ~45% across,
            clear from ~62%; the foot's wash only the bottom fifth. */}
        <div
          className="absolute inset-0 md:hidden"
          style={{ background: "linear-gradient(to top, #050607 0%, rgb(5 6 7 / 0.5) 22%, transparent 45%)" }}
        />
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              "linear-gradient(to right, rgb(5 6 7 / 0.92) 0%, rgb(5 6 7 / 0.7) 30%, rgb(5 6 7 / 0.25) 45%, transparent 62%)",
          }}
        />
        <div
          className="absolute inset-0 hidden md:block"
          style={{ background: "linear-gradient(to top, #050607 0%, transparent 20%)" }}
        />
      </div>

      <div className="relative w-full px-6 md:px-8 lg:px-10">
        <div className="max-w-[560px]">
          <Reveal>
            <h2 className="text-3xl leading-[1.1] font-medium tracking-tighter text-white capitalize md:text-4xl lg:text-5xl">
              {usps.title}
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass-dark glass-rim relative mt-8 rounded-[14px] p-4 md:mt-10 md:p-6">
              <ol role="list" onMouseEnter={() => setPaused(true)}>
                {usps.items.map((item, i) => {
                  const on = i === active;
                  return (
                    <li key={item} className="border-b border-white/10 last:border-b-0">
                      <button
                        type="button"
                        aria-expanded={on}
                        onMouseEnter={() => setActive(i)}
                        onFocus={() => {
                          setPaused(true);
                          setActive(i);
                        }}
                        onClick={() => setActive(i)}
                        className="group block w-full py-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:py-3"
                      >
                        <span className="flex items-baseline gap-4">
                          <span
                            className={`w-6 shrink-0 text-xs font-medium tabular-nums transition-colors duration-300 ${
                              on ? "text-white" : "text-white/40"
                            }`}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={`text-sm leading-snug font-medium transition-colors duration-300 lg:text-[0.9375rem] ${
                              on ? "text-white" : "text-white/60 group-hover:text-white/85"
                            }`}
                          >
                            {item}
                          </span>
                        </span>

                        {/* The note, opening under the chosen one. */}
                        <span
                          className="grid transition-[grid-template-rows] duration-500 ease-out"
                          style={{ gridTemplateRows: on ? "1fr" : "0fr" }}
                        >
                          <span className="overflow-hidden">
                            <span className="block pt-2 pl-10 text-sm leading-relaxed text-white/70">
                              {notes[i]}
                            </span>
                            {/* The timer, as a hairline filling under it. */}
                            <span className="mt-3 ml-10 block h-px overflow-hidden bg-white/15">
                              <span
                                key={on ? `on-${active}-${running}` : "off"}
                                className="block h-full origin-left bg-white/80"
                                style={
                                  on && running
                                    ? { animation: `usp-progress ${INTERVAL}ms linear both` }
                                    : { transform: on ? "scaleX(1)" : "scaleX(0)" }
                                }
                              />
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </Reveal>
        </div>
      </div>

      <style>{`
        @keyframes usp-progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .usp-grade { filter: saturate(0.88) brightness(0.94); }
      `}</style>
    </section>
  );
}
