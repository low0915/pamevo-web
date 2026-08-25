"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HERO } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

/** Word choreography, as fractions of the scrubbed timeline. */
const FIRST_WORD_AT = 0.24;
const SLOT = 0.235;
const ENTER = 0.09;
const HOLD = 0.06;
const EXIT = 0.07;
/** Slide distance in px. Large enough to read as travel at 192px type. */
const TRAVEL = 120;
/** Source frame rate. Seeks are quantised to whole frames. */
const VIDEO_FPS = 24;

/** The sequence, in viewport heights: the runway is 500dvh, but it is over
 *  after this much of it, where the sheet below starts its overlap. The
 *  timeline ends here and so does the autoplay that carries it. */
const SEQUENCE = 2;

/** How much of that the autoplay plays per second, on landing: two viewports
 *  at this pace is about eight seconds, or a word every two. */
const SPEED = 0.25;

/**
 * Scroll-scrubbed hero.
 *
 * The section is a 500vh runway; the frame inside is `sticky`, so it holds
 * still while the runway scrolls past. The sequence occupies the first 200vh
 * and the sheet below overlaps the remainder: the two must not collide, or the
 * sheet covers the description while the last word is still arriving. CSS sticky is used rather than
 * ScrollTrigger's `pin` because pinning inserts a spacer element, which would
 * fight the sheet that overlaps this section further down the page.
 *
 * One scrubbed timeline maps the whole runway:
 *   0.00 - 0.10  logo holds, vertically centred and hard left
 *   0.10 - 0.22  logo leaves
 *   0.24 - 0.80  the tagline words take turns in a single slot: each slides
 *                in from the right, holds, then continues out to the left,
 *                with a beat of empty slot before the next arrives. Everything
 *                travels leftward, including the logo's exit, so the whole
 *                sequence reads as one movement. Only one word is ever on
 *                screen; the last one stays.
 * The description is not in the timeline at all. It is on screen from the
 * first frame and never moves. It holds one line from `md` up, where its
 * 641px measures inside the available width; below that it wraps.
 *
 * The hero deliberately breaks the site's centred 1440 column and runs to the
 * viewport edge on a narrow gutter, so the lockup sits hard left at any width.
 * The video's currentTime is tweened across the same range, so the footage is
 * driven entirely by the wheel.
 *
 * The scrim is heavy and light-coloured out of necessity. Sampled across the
 * clip, the region under this text swings from luminance 187 down to 56, and
 * the logo is deep crimson (ink luminance 49) which needs a bright ground. The
 * scrim is sized for the darkest frame so the lockup never drops below AA,
 * which does mean the footage reads as a pale wash on the left.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = rootRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>("[data-word]");

      if (reduced) {
        gsap.set("[data-hero-logo]", { autoAlpha: 0 });
        gsap.set(words, { autoAlpha: 1, x: 0 });
        return;
      }

      gsap.set(words, { x: TRAVEL });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          // Two viewports of runway, in pixels. The sheet below begins its
          // overlap at exactly this point, so the sequence is complete before
          // anything starts covering it. Re-measured on refresh.
          end: () => "+=" + window.innerHeight * SEQUENCE,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // Driving `currentTime` directly on every tick queues seeks faster than
      // the decoder can service them, which is what makes scrubbed video stutter.
      // Instead: tween a plain number, quantise it to a whole frame, and only
      // issue a seek when the frame actually changes and no seek is in flight.
      const playhead = { progress: 0 };
      let lastFrame = -1;

      timeline.to(
        playhead,
        {
          progress: 1,
          duration: 1,
          onUpdate: () => {
            const duration = video.duration || 10;
            const frame = Math.round(playhead.progress * duration * VIDEO_FPS);
            if (frame === lastFrame || video.seeking) return;
            lastFrame = frame;
            video.currentTime = frame / VIDEO_FPS;
          },
        },
        0,
      );

      timeline.to(
        "[data-hero-logo]",
        { autoAlpha: 0, x: -40, duration: 0.12 },
        0.1,
      );

      // The words share one slot, so each must clear out before the next
      // arrives. Each slot is enter, hold, exit, then a beat of empty space so
      // the exit is actually seen rather than being masked by the next entry.
      // A word travels straight through: in from the left, out to the right.
      words.forEach((word, i) => {
        const enterAt = FIRST_WORD_AT + i * SLOT;

        // Decelerating in, accelerating out: the word arrives and settles,
        // then gathers pace as it leaves. Linear on both would read mechanical.
        timeline.to(
          word,
          { autoAlpha: 1, x: 0, duration: ENTER, ease: "power3.out" },
          enterAt,
        );

        if (i < words.length - 1) {
          timeline.to(
            word,
            { autoAlpha: 0, x: -TRAVEL, duration: EXIT, ease: "power2.in" },
            enterAt + ENTER + HOLD,
          );
        }
      });

    }, section);

    // Some browsers refuse to seek a video that has never been played, and the
    // duration is unknown until metadata lands.
    const onMetadata = () => ScrollTrigger.refresh();
    video.addEventListener("loadedmetadata", onMetadata);
    video
      .play()
      .then(() => video.pause())
      .catch(() => {});

    return () => {
      video.removeEventListener("loadedmetadata", onMetadata);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      data-autoplay={SEQUENCE}
      data-autoplay-speed={SPEED}
      className="relative h-[500dvh]"
    >
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        <video
          ref={videoRef}
          className="graded absolute inset-0 h-full w-full object-cover"
          src="/hero-video.mp4"
          muted
          playsInline
          preload="auto"
          aria-hidden
          tabIndex={-1}
        />

        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgb(244 245 246 / 0.94) 0%, rgb(244 245 246 / 0.90) 42%, rgb(244 245 246 / 0.45) 68%, rgb(244 245 246 / 0) 92%)",
          }}
        />

        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-6 md:px-8 lg:px-10">
            {/* The heading is text, not the logo. `data-hero-logo` is driven
                with `autoAlpha`, which writes visibility: hidden, and that
                would take an h1 out of the accessibility tree along with it.
                So the words sit in their own element the timeline never
                touches, and the logo animates as the picture it is. */}
            <h1 className="sr-only">{HERO.heading}</h1>
            <div data-hero-logo>
              <Image
                src="/logo.png"
                /* Decorative: the h1 above states the same thing, and the
                   brand should not be announced twice. */
                alt=""
                width={2220}
                height={174}
                priority
                className="h-auto w-full max-w-[520px] md:max-w-[760px] lg:max-w-[980px]"
              />
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center">
          <div className="w-full px-6 md:px-8 lg:px-10">
            {/* One grid cell holds all three, so they overlap exactly and the
                block keeps a fixed height: the description below never shifts. */}
            <p className="grid text-[2.5em] leading-[0.92] font-medium tracking-tighter text-ink sm:text-[3.75em] md:text-[5.5em] lg:text-[7.5em] xl:text-[12em]">
              {HERO.taglineWords.map((word) => (
                <span
                  key={word}
                  data-word
                  className="col-start-1 row-start-1 block whitespace-nowrap"
                  style={{ opacity: 0, visibility: "hidden" }}
                >
                  {word}
                </span>
              ))}
            </p>

            {/* Constant: on screen from the first frame, never animated, and
                held in place by the fixed-height word slot above it. */}
            <p className="mt-8 text-base leading-relaxed text-ink md:whitespace-nowrap">
              {HERO.subheading}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
