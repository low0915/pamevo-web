"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  AUTOPLAY_HOLD_EVENT,
  AUTOPLAY_RELEASE_EVENT,
  HERO_REPLAY_EVENT,
} from "@/lib/autoplay";
import { SCROLL_LOCK_EVENT, SCROLL_UNLOCK_EVENT } from "@/lib/scroll-lock";

gsap.registerPlugin(ScrollTrigger);

/** A beat between a run engaging and the page starting to move, so the section
 *  is seen where it landed before it travels. */
const AUTOPLAY_DELAY = 0.25;

/** How long the autoplay stands back after a reader takes over — a wheel, a
 *  swipe, a scroll key — or after a tab comes back to the foreground, before it
 *  picks the run up again from wherever the page now is. Long enough that a
 *  deliberate scroll is not fought, short enough that the section carries on by
 *  itself if the reader simply stops. */
const RESUME_DELAY = 1.2;

/** A touch is given longer than a wheel: the fling that follows it is the
 *  browser's own momentum, which this cannot see and must not scroll against. */
const TOUCH_RESUME_DELAY = 2;

/** Keys that scroll. Anything else is typing, and no reason to stand back. */
const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
]);

/** How much of the remaining distance Lenis closes each frame. Shared by the
 *  instance and by the autoplay's own scrolls, so both ease alike. */
const LERP = 0.1;

/** Longest frame the autoplay will account for. A tab left in the background,
 *  or one very slow paint, would otherwise come back as a single large jump. */
const MAX_FRAME = 0.05;

/** What a section's `data-autoplay` pair resolves to once measured: the scroll
 *  range its scrubbed sequence occupies, and the pace to play it at. */
type Run = {
  section: HTMLElement;
  start: number;
  end: number;
  speed: number;
};

/** Per-section progress, kept apart from the measurements so that re-measuring
 *  on a resize neither rewinds a run underway nor replays a finished one. */
type Played = { engaged: number; done: boolean };

/**
 * Lenis smooth scrolling, driven off the GSAP ticker, and the autoplay that
 * carries the scrubbed sections at the top of the page.
 *
 * Lenis interpolates toward the scroll target with a lerp, so it eases to a
 * stop without ever passing the target: smooth, no bounce.
 *
 * Running Lenis on `gsap.ticker` rather than its own rAF loop keeps it on the
 * same clock as every ScrollTrigger on the page. Two independent loops would
 * read and write scroll position in an undefined order and the pinned hero
 * would judder. `lagSmoothing(0)` stops GSAP from silently skipping time after
 * a slow frame, which would desync the scrubbed video from the scroll.
 *
 * Autoplay
 * --------
 * A section opts in by declaring two numbers: `data-autoplay`, how many
 * viewport heights its scrubbed sequence lasts, and `data-autoplay-speed`, how
 * many of those to play per second. They live on the section because that is
 * where the same length already ends its timeline; this file only reads them,
 * and so never needs to know which sections exist or how many.
 *
 * Those sections are scrubbed runways: their animation is a function of scroll
 * position and nothing else. So they are played by scrolling the page, not by
 * running their timelines — that way there is only ever one source of truth for
 * where a sequence is, and a reader who takes over mid-way finds the page
 * exactly where it looked.
 *
 * A run engages when the page reaches the top of its section, which for a
 * sticky section is the moment its frame snaps into place, and lets go at the
 * end of its sequence. Each plays once: the gaps between them, and everything
 * past the last, are the reader's own to scroll, and scrolling back up does not
 * restart a sequence already sat through.
 *
 * Each frame the run adds its step to Lenis's *target*, which is the same
 * number a wheel gesture adds to. Nothing is overwritten, so a manual scroll
 * lands on top of the autoplay rather than instead of it. And because the step
 * goes to the target while Lenis still lerps toward it, the movement carries
 * the same easing as the rest of the site.
 *
 * A reader who takes over is given the page: any scroll input stands the run
 * down, and it picks up again a beat after the last one, from wherever they
 * left it — never rewinding, never wrestling the wheel. Leaving the tab does
 * the same, so coming back does not begin with the page already moving.
 *
 * Every run is armed again by the three things that mean "start over" — a load,
 * a navigation that arrives home, and the header logo, which on the home page
 * links nowhere and so would otherwise reset nothing. Each of those puts the
 * page back at the top first, and scroll restoration is turned off in the
 * document itself (see app/layout.tsx) so a reload cannot land halfway down a
 * sequence before this ever runs.
 *
 * It holds while the tab is hidden. Touch input buys a longer stand-down than a
 * wheel, since the fling that follows a swipe is the browser's own momentum,
 * which this cannot see and must not scroll against.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const replayRef = useRef<(() => void) | null>(null);
  const measureRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: LERP,
      smoothWheel: true,
      // Touch platforms have their own momentum; ours would only fight it.
      syncTouch: false,
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    let runs: Run[] = [];
    // Keyed by section rather than by index: a client navigation swaps the page
    // under this effect, and the sections of a moment ago may not be these.
    let played = new WeakMap<HTMLElement, Played>();

    const progressOf = (section: HTMLElement) => {
      let progress = played.get(section);
      if (!progress) {
        progress = { engaged: 0, done: false };
        played.set(section, progress);
      }
      return progress;
    };

    // Read from the DOM rather than held in here: the sections declare their
    // own runways, and both ends of one move with the viewport.
    const measure = () => {
      const screen = window.innerHeight;
      runs = Array.from(
        document.querySelectorAll<HTMLElement>("[data-autoplay]"),
      ).map((section) => {
        const start = section.getBoundingClientRect().top + window.scrollY;
        return {
          section,
          start,
          end: start + Number(section.dataset.autoplay) * screen,
          speed: Number(section.dataset.autoplaySpeed),
        };
      });
    };

    // Seconds left of standing back after an interruption. Time, rather than a
    // flag on some other party's state: it always runs down, so nothing that
    // happens to the page can leave the autoplay stood down for good.
    let hold = 0;
    const interrupt = (seconds = RESUME_DELAY) => {
      hold = Math.max(hold, seconds);
    };
    const onWheel = () => interrupt();
    const onTouch = () => interrupt(TOUCH_RESUME_DELAY);
    const onKeyDown = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key)) interrupt();
    };
    // Only the return to the foreground matters: a hidden tab has no ticker to
    // run the autoplay with, and this keeps it from resuming the instant one
    // comes back, before the reader has looked at it.
    const onVisibility = () => {
      if (document.visibilityState === "visible") interrupt();
    };

    // Held open-endedly, rather than for a countdown: a dialog is up until it
    // is not, and nobody can say in advance how long that will be.
    let paused = false;
    const onHold = () => {
      paused = true;
    };
    const onRelease = () => {
      paused = false;
      // The same beat any other interruption gets, so the page eases back in
      // rather than jumping the moment the dialog clears.
      interrupt();
    };

    const autoplay = (dt: number) => {
      if (paused) return;
      if (document.visibilityState !== "visible") return;
      if (hold > 0) {
        hold = Math.max(0, hold - dt);
        return;
      }

      const at = lenis.targetScroll;

      for (const run of runs) {
        const progress = progressOf(run.section);
        if (progress.done) continue;
        // Not reached yet — and nothing after it can have been, since the runs
        // are in document order.
        if (at < run.start) return;
        if (at >= run.end) {
          progress.done = true;
          continue;
        }

        progress.engaged += dt;
        if (progress.engaged < AUTOPLAY_DELAY) return;

        // Added to the target, not to the position: a wheel gesture this frame
        // has already moved the target, and this moves it further along.
        //
        // `programmatic: false` is what makes that hold. A programmatic scroll
        // rewrites the target with its own animated position on every update,
        // so reading the target back and adding to it would only ever return
        // the place the page had already reached — the run would crawl, and a
        // wheel gesture would be wiped out by the next frame. Declining it
        // leaves the target where it is put. It also drops Lenis's default
        // easing with it, hence the explicit lerp.
        lenis.scrollTo(
          Math.min(at + window.innerHeight * run.speed * dt, run.end),
          { programmatic: false, lerp: LERP },
        );
        return;
      }
    };

    // A dialog has the screen: refuse the wheel and the touch outright, and
    // refuse the autoplay's own scrollTo with them, which a stopped Lenis does
    // on its own. `overflow: hidden` on the body cannot do this - it declines a
    // gesture, and every one of these arrives as a script instead.
    const onLock = () => lenis.stop();
    const onUnlock = () => lenis.start();

    // Back to the top, with every run armed to play again from there.
    const replay = () => {
      lenis.scrollTo(0, { immediate: true, force: true });
      played = new WeakMap();
      hold = 0;
      measure();
    };
    replayRef.current = replay;
    measureRef.current = measure;

    const raf = (time: number, deltaTime: number) => {
      autoplay(Math.min(deltaTime / 1000, MAX_FRAME));
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // On a phone the URL bar collapses and expands as the page is scrolled,
    // and every one of those fires `resize`. Left alone, ScrollTrigger
    // re-measures each pin and scrub mid-gesture and the page jumps under the
    // thumb - worst on the service stack, which is five sticky panels deep.
    // This makes it ignore a resize that only changed the height on a touch
    // device, which is exactly the URL bar and nothing else. An orientation
    // change still refreshes, because that changes the width.
    ScrollTrigger.config({ ignoreMobileResize: true });

    measure();
    // Same reasoning for the autoplay's own measurements: the runs are read off
    // `window.innerHeight`, so a URL bar sliding away would re-cut every runway
    // in the middle of one being played. Only a width change is a real layout
    // change worth re-reading.
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      measure();
    };
    window.addEventListener("resize", onResize);
    ScrollTrigger.addEventListener("refresh", measure);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onTouch, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener(AUTOPLAY_HOLD_EVENT, onHold);
    window.addEventListener(AUTOPLAY_RELEASE_EVENT, onRelease);
    window.addEventListener(SCROLL_LOCK_EVENT, onLock);
    window.addEventListener(SCROLL_UNLOCK_EVENT, onUnlock);

    return () => {
      replayRef.current = null;
      measureRef.current = null;
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      window.removeEventListener("resize", onResize);
      ScrollTrigger.removeEventListener("refresh", measure);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onTouch);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener(AUTOPLAY_HOLD_EVENT, onHold);
      window.removeEventListener(AUTOPLAY_RELEASE_EVENT, onRelease);
      window.removeEventListener(SCROLL_LOCK_EVENT, onLock);
      window.removeEventListener(SCROLL_UNLOCK_EVENT, onUnlock);
      lenis.destroy();
    };
  }, []);

  // A load, or a navigation that arrives home. Declared after the effect above
  // so the replay it calls is already in hand on the first render.
  //
  // Every other navigation re-measures instead. The runs are read off the DOM
  // once and the effect that reads them is mounted in the layout, so it outlives
  // any client navigation: a page that declares no `[data-autoplay]` of its own
  // would otherwise inherit the runs of the page before it and scroll itself
  // with them. /our-products and /contact declare none, and both were being
  // carried down the page by the home page's hero. Re-measuring hands them the
  // empty list they should have had.
  useEffect(() => {
    if (pathname === "/") replayRef.current?.();
    else measureRef.current?.();
  }, [pathname]);

  // The header logo, for a reader who is already home.
  useEffect(() => {
    const onReplay = () => replayRef.current?.();
    window.addEventListener(HERO_REPLAY_EVENT, onReplay);
    return () => window.removeEventListener(HERO_REPLAY_EVENT, onReplay);
  }, []);

  return null;
}
