"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HERO, HERO_ZH, HERO_BM } from "@/lib/content";
import { useCopy } from "@/lib/locale";

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
 * viewport edge on a narrow gutter, so from `md` up the lockup sits hard left.
 * Below `md` there is no width to sit hard left in - the tagline alone fills
 * the line - so logo, tagline and description are centred instead, and the
 * type is sized off the viewport so `Performance.` still holds its one line
 * on a 320px phone. The video's currentTime is tweened across the same range,
 * so the footage is driven entirely by the wheel.
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
  const hero = useCopy(HERO, { ZH: HERO_ZH, BM: HERO_BM });

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
      className="relative h-[500svh]"
    >
      {/* `lvh`, where the runway around it is `svh`. The two are doing
          different jobs: the runway is a length in the scroll chain and has to
          hold still, but this frame has to COVER, and a box sized to the
          viewport-with-chrome leaves a strip of page showing along the bottom
          the moment the URL bar slides away. `lvh` is the viewport at its
          tallest, so the frame always reaches the foot of the screen; the
          overflow when the bar is showing costs nothing, because what is
          inside is `object-cover` and clipped anyway. */}
      <div className="sticky top-0 h-[100lvh] w-full overflow-hidden">
        <video
          ref={videoRef}
          className="graded absolute inset-0 h-full w-full object-cover"
          src="/hero-video.mp4"
          muted
          playsInline
          /* `auto`, and it has to stay `auto`.

             At 3.0 MB this is the largest single asset on the site and the
             obvious candidate for `preload="metadata"` — but this video is not
             played, it is SCRUBBED: the timeline below drives `currentTime`
             from scroll position. Seeking needs the byte range already
             buffered, so anything less than `auto` turns the hero into a
             stutter on first scroll, or a still frame until the network
             catches up.

             The cost is real and is worth paying down elsewhere: a `poster`
             would give the frame something to paint before the first bytes
             land, and a smaller source would cut what has to be fetched. Both
             need an asset that does not exist in public/ yet. */
          preload="auto"
          aria-hidden
          tabIndex={-1}
        />

        {/* Two scrims, because the lockup sits in a different place on each.
            The `md` one is weighted left, where the text is; the mobile one is
            centred text running the full width, so it has to hold most of the
            way across or the tail of `Performance.` lands on bare footage. */}
        <div
          aria-hidden
          className="absolute inset-0 md:hidden"
          style={{
            background:
              "linear-gradient(to right, rgb(244 245 246 / 0.94) 0%, rgb(244 245 246 / 0.92) 60%, rgb(244 245 246 / 0.86) 100%)",
          }}
        />

        <div
          aria-hidden
          className="absolute inset-0 hidden md:block"
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
            <h1 className="sr-only">{hero.heading}</h1>
            {/* Below `md` the lockup is centred, and the logo has to land in
                the same slot the first word arrives in or the handover reads
                as a jump. So on mobile this block mirrors the tagline block
                exactly: an invisible line box at the tagline's own size and
                leading, which the logo centres inside, followed by an
                invisible copy of the description. Both blocks are then the
                same height and centred in the same viewport, so the logo and
                the words share one baseline. From `md` up the mirrors are
                display:none and the layout is the original left-aligned,
                viewport-centred one. */}
            <div className="grid">
              <p
                aria-hidden
                className="invisible col-start-1 row-start-1 text-[min(3.75em,14.5vw)] leading-[0.92] font-medium tracking-tighter md:hidden"
              >
                &nbsp;
              </p>
              <div data-hero-logo className="col-start-1 row-start-1 flex items-center md:block">
                <Image
                  src="/logo.png"
                  /* Decorative: the h1 above states the same thing, and the
                     brand should not be announced twice. */
                  alt=""
                  width={2220}
                  height={174}
                  /* Was `priority`, deprecated as of Next 16. The LCP element
                     on the home page — the <video> has no poster, so it is not
                     an LCP candidate — which is the case that still wants a
                     real preload rather than merely eager loading. */
                  preload
                  className="mx-auto h-auto w-full max-w-[520px] md:mx-0 md:max-w-[760px] lg:max-w-[980px]"
                />
              </div>
            </div>
            <p
              aria-hidden
              className="invisible mt-4 text-base leading-relaxed md:hidden"
            >
              {hero.subheading}
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center">
          <div className="w-full px-6 md:px-8 lg:px-10">
            {/* One grid cell holds all three, so they overlap exactly and the
                block keeps a fixed height: the description below never shifts. */}
            <p className="grid text-center text-[min(3.75em,14.5vw)] leading-[0.92] font-medium tracking-tighter text-ink sm:text-[3.75em] md:text-left md:text-[5.5em] lg:text-[7.5em] xl:text-[12em]">
              {/* Keyed by position, not by the word itself: the locale
                  toggle rewrites all three, and keying on the text would
                  remount the spans and throw away the inline transform the
                  scrubbed timeline is holding them at. */}
              {hero.taglineWords.map((word, i) => (
                <span
                  key={i}
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
            <p className="mt-4 text-center text-base leading-relaxed text-ink md:text-left md:whitespace-nowrap">
              {hero.subheading}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
