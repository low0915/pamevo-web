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
import { isHome } from "@/lib/paths";

gsap.registerPlugin(ScrollTrigger);

/** A beat between a run engaging and the page starting to move, so the section
 *  is seen where it landed before it travels. */
const AUTOPLAY_DELAY = 0.25;

/** How long the autoplay stands back after a reader takes over — a wheel, a
 *  swipe, a scroll key — or after a tab comes back to the foreground, before it
 *  picks the run up again from wherever the page now is. Long enough that a
 *  deliberate scroll is not fought, short enough that the section carries on by
 *  itself if the reader simply stops.
 *
 *  Deliberately unhurried. A reader who takes the page has usually taken it to
 *  read something, and a run that comes back the moment their hand stops reads
 *  as the page arguing with them — the more so now that a run reaches back for
 *  the page a reader has scrolled up out of. Several seconds of stillness
 *  first, and the same movement reads as the page carrying on. */
const RESUME_DELAY = 3;

/** A touch is given longer than a wheel: the fling that follows it is the
 *  browser's own momentum, which this cannot see and must not scroll against —
 *  and on a phone the finger is resting on the page it is reading. */
const TOUCH_RESUME_DELAY = 4.5;

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

/** How far above its own start a run underway will still reach for the page,
 *  in viewport heights. A run begins at the top of its section and its sticky
 *  frame is one viewport tall, so a page this far above the start is a section
 *  just leaving the bottom of the screen: still in sight, and still the thing
 *  being read. Past that the reader has gone somewhere else, and the run lets
 *  go rather than hauling them back. */
const RECLAIM = 1;

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
 * Wherever they left it, including above the run: a reader who scrolls back up
 * out of a sequence still has it resumed for them, and the page eases back down
 * into the section rather than stopping where they stood. That holds while the
 * section is still on screen; scroll further back than that and the run lets go
 * of the page, and engages again if they come back to it. See RECLAIM.
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
  const arriveRef = useRef<((home: boolean) => void) | null>(null);

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
    //
    // Gated on the home page, and read off `location` rather than taken as an
    // argument so that every caller is covered - this also runs on a
    // ScrollTrigger refresh, which knows nothing about routing. The three
    // scrubbed sections live on the home page and nowhere else, so in practice
    // the query below already returns nothing anywhere else; the guard is what
    // makes that a rule rather than a coincidence, and it holds even for the
    // moment during a navigation when the outgoing page's sections are still
    // in the document.
    const measure = () => {
      if (!isHome(window.location.pathname)) {
        runs = [];
        return;
      }
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
    //
    // Counted, because there are two independent holders and they overlap. The
    // cookie notice holds from the moment it appears until it is answered, and
    // the mobile menu holds for as long as it is open - so a reader who opens
    // and closes the menu without answering the notice would, with a plain
    // boolean, hand the page back while the notice was still up. The count is
    // floored at zero so a stray release cannot take it negative and strand the
    // autoplay off.
    let holds = 0;
    const onHold = () => {
      holds += 1;
    };
    const onRelease = () => {
      holds = Math.max(0, holds - 1);
      // The same beat any other interruption gets, so the page eases back in
      // rather than jumping the moment the last dialog clears.
      if (holds === 0) interrupt();
    };

    const autoplay = (dt: number) => {
      if (holds > 0) return;
      if (document.visibilityState !== "visible") return;
      if (hold > 0) {
        hold = Math.max(0, hold - dt);
        return;
      }

      const at = lenis.targetScroll;

      for (const run of runs) {
        const progress = progressOf(run.section);
        if (progress.done) continue;
        if (at >= run.end) {
          progress.done = true;
          continue;
        }

        // Above the run's start, which is two different situations.
        //
        // A run that has never played is simply not reached yet, and nothing
        // after it can have been either, since the runs are in document order:
        // the gap in front of it is the reader's own to scroll, and the
        // autoplay waits at the edge of it.
        //
        // A run already underway is a different matter. A reader who scrolls
        // back up out of one lands here, and this is where the autoplay used to
        // park for good: every run before this one is `done` and so skipped,
        // this one is refused for being ahead of the page, and nothing else
        // moves the page — so the sequence stopped and never picked itself up
        // again. It keeps the page instead, and eases back down into its
        // section from wherever the reader left off, the same as it would from
        // anywhere inside it.
        //
        // Only while the section is still on screen. A reader who has scrolled
        // further than that has left the sequence rather than glanced back at
        // it, so the run stands down — and, having kept no progress, engages
        // afresh with its full opening beat if they return.
        if (at < run.start) {
          if (progress.engaged === 0) return;
          if (run.start - at > window.innerHeight * RECLAIM) {
            progress.engaged = 0;
            return;
          }
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
    //
    // Counted for the same reason the hold is, and with more at stake: a lock
    // that is taken twice and released once leaves Lenis stopped, and a stopped
    // Lenis is a page that cannot be scrolled at all.
    let locks = 0;
    const onLock = () => {
      if (locks++ === 0) lenis.stop();
    };
    const onUnlock = () => {
      if (locks > 0 && --locks === 0) lenis.start();
    };

    /**
     * Keeps Lenis's idea of how far the page goes honest, continuously.
     *
     * Lenis measures the document once and then leans on a ResizeObserver over
     * `documentElement` to keep `limit` current. That observer barely ever
     * fires here: an observer reports a BOX changing, `documentElement`'s box
     * is the viewport, and what changes on this site is the content inside it -
     * a navigation to a shorter page, a catalogue row opening or closing.
     * `scrollHeight` is not something a ResizeObserver watches. (Lenis also
     * debounces it 250ms, so even where a box does change, the answer is late.)
     *
     * `body` is watched instead. Its box grows and shrinks with its content, so
     * every one of those changes arrives here.
     *
     * The clamp is the half that matters. `resize()` on its own would leave a
     * target carried over from a taller page sitting past the new bottom, and
     * Lenis adds a wheel gesture to the TARGET rather than to the position - so
     * every further scroll would push an already unreachable number further
     * away, and the page would sit pinned at its bottom and refuse to move.
     * Only corrected when the target is genuinely out of range, so an ordinary
     * resize part-way through a scroll is left alone.
     *
     * This is the backstop. `arrive` below handles the navigation case head-on;
     * this catches every other way the page can get shorter - and would catch
     * the navigation case too, if the timing of that one were ever wrong again.
     */
    const onContentResize = () => {
      lenis.resize();
      if (lenis.targetScroll > lenis.limit) {
        lenis.scrollTo(lenis.limit, { immediate: true, force: true });
      }
    };
    const contentObserver = new ResizeObserver(onContentResize);
    contentObserver.observe(document.body);

    /**
     * Arriving on a page: the top of it, measured, with Lenis told where it is.
     *
     * A client navigation swaps the document underneath Lenis, and it notices
     * none of that on its own:
     *
     *   - `limit`, the furthest the page can scroll, is still the last page's.
     *     Lenis keeps it fresh with a ResizeObserver over `documentElement`, and
     *     that observer does not fire here - see `onContentResize` above.
     *   - `targetScroll` is still the offset the reader had reached on the page
     *     they left. Next puts the window back at the top, but Lenis is not
     *     asked and does not look, so on its next frame it scrolls the new page
     *     straight back down to the old number.
     *
     * Land on a shorter page with both carried over and the page cannot be
     * scrolled at all: the target sits past the real bottom, the browser clamps
     * to the bottom, and Lenis adds a wheel gesture to the TARGET rather than to
     * the position, so every further scroll pushes an already unreachable number
     * further away. Measured on this site before the fix: leaving the home page
     * part-way down and arriving at /contact left a target of 8381 against a
     * limit of 14163, on a page 941 tall. That is the stuck scroll.
     *
     * Scrolled to 0 rather than synced to `window.scrollY`, and that is not a
     * shortcut. Reading the window back is a race - Next resets it, Lenis
     * scrolls it back, and which of those has happened when this runs decides
     * the answer. There is no need to ask: `history.scrollRestoration` is
     * `"manual"` for the whole site (see components/site/Shell.tsx), nothing
     * carries `scroll={false}`, and nothing here routes imperatively - so every
     * arrival, forward or back, means the top of the page, WITH ONE EXCEPTION:
     * a link that carries a fragment naming an element on the destination. The
     * Our Profile dropdown added those (/our-profile#story, #vision); `arrive`
     * honours them and the top is the default for everything else. See
     * `hashTarget` below. `force`, so a dialog holding the scroll lock cannot also
     * block the correction that keeps the page scrollable once it closes.
     *
     * `home` additionally arms the runs, which is what makes the opening
     * sequence play again rather than count as already sat through.
     */
    /**
     * The one exception to "every arrival is the top of the page".
     *
     * A fragment that names an element on the page just loaded is a real
     * destination, not noise: /our-profile#vision is the Vision & Mission
     * section, reached from the Our Profile dropdown. Lenis owns the scroll, so
     * the browser's own jump to the fragment does not stick — the manual scroll
     * restoration and `arrive`'s scrollTo(0) below would put the reader at the
     * top regardless. This hands Lenis the target instead.
     *
     * `-96` clears the 80px header island, and matches the `scroll-mt-24` the
     * targets carry for the reduced-motion path, where Lenis is not running and
     * the browser's native fragment scroll honours that margin instead. So both
     * paths land the element the same 96px below the top.
     *
     * A hash that names nothing — /our-products#window is a filter keyword, not
     * an element id — falls through to the top, which is the unchanged
     * behaviour and what the catalogue's own handler then acts on.
     */
    /* No JS offset: Lenis honours the target's CSS `scroll-mt-24` (96px) on its
       own, the same 96 the browser's native scroll uses under reduced motion —
       measured, an added `-96` here stacked on top of it and cleared the header
       twice over (the section landed 192px down, not 96). One clearance, in the
       CSS, for both paths. */
    const hashTarget = () => {
      const id = window.location.hash.slice(1);
      if (!id) return null;
      let el: HTMLElement | null;
      try {
        el = document.getElementById(decodeURIComponent(id));
      } catch {
        el = document.getElementById(id);
      }
      // A section that manages its own fragment scrolling opts out with
      // `data-hash-managed` — the product catalogue, which opens the row named
      // by the slug and then scrolls, and has to own that timing. Returning
      // null hands the arrival back to the ordinary top-of-page path, which is
      // exactly what happened before this handler existed, so that page is
      // unchanged.
      if (el?.closest("[data-hash-managed]")) return null;
      return el;
    };

    /**
     * Scroll to the fragment target once the page has finished loading — NOT
     * on mount.
     *
     * A fresh load of /our-profile#vision has the 230svh Background runway above
     * the target, and the height of that runway is not final until its images
     * and web fonts have resolved: measured, the target sits at document
     * position 2426 during the first ~500ms and then collapses 356px to its
     * real 2070 as the load settles. Scrolling on mount — immediately, or after
     * a couple of frames, or when the position merely holds still for a moment —
     * lands on the transient and leaves the section ~356px past the header. The
     * only honest signal that the height above the target is final is `load`,
     * which waits for exactly those images, so this waits for it and scrolls
     * once. `fonts.ready` covers a font that settles after `load` and shifts the
     * text; both resolve to the same target, so the second is a no-op when the
     * first already landed it.
     *
     * ONE scroll per arrival, never a re-assert on a timer — a repeated scroll
     * would yank a reader who had already started scrolling away. The cost is
     * that the section is reached a beat after the page paints rather than
     * instantly, which is how a heavy anchored page behaves natively anyway (the
     * reduced-motion path, where the browser owns the scroll, does the same).
     *
     * Cross-page only, which is all there is: the dropdown's fragment links are
     * plain anchors (full document loads, so `load` fires), and a same-page hash
     * change goes through `onHashChange` below, where the layout is long settled.
     */
    let hashRaf = 0;
    const scrollToHash = () => {
      const el = hashTarget();
      if (el) lenis.scrollTo(el, { immediate: true, force: true });
    };
    const scrollToHashAfterLoad = () => {
      cancelAnimationFrame(hashRaf);
      if (!hashTarget()) return;
      const run = () => {
        // A frame after load so the final layout is painted, not just parsed.
        hashRaf = requestAnimationFrame(scrollToHash);
      };
      if (document.readyState === "complete") run();
      else window.addEventListener("load", run, { once: true });
      // A font that resolves after `load` shifts the text above the target; the
      // same scroll re-runs against the now-final height. It resolves to the
      // same place once fonts are already in, so on the common path it moves
      // nothing.
      document.fonts?.ready.then(scrollToHash).catch(() => {});
    };

    const arrive = (home: boolean) => {
      lenis.resize();
      if (hashTarget()) {
        scrollToHashAfterLoad();
      } else {
        lenis.scrollTo(0, { immediate: true, force: true });
      }
      if (home) {
        played = new WeakMap();
        hold = 0;
      }
      measure();
    };

    arriveRef.current = arrive;

    // Same-page fragment clicks. A dropdown link to /our-profile#vision, chosen
    // while already on /our-profile, changes only the hash — `pathname` is
    // unchanged, so the effect that calls `arrive` never fires. This is the
    // reader gliding from one section to another, so it animates rather than
    // jumping. Cross-page arrivals go through `arrive` above and jump.
    const onHashChange = () => {
      const target = hashTarget();
      if (target) lenis.scrollTo(target, { force: true });
    };
    window.addEventListener("hashchange", onHashChange);


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
      arriveRef.current = null;
      cancelAnimationFrame(hashRaf);
      window.removeEventListener("hashchange", onHashChange);
      lenis.off("scroll", onScroll);
      contentObserver.disconnect();
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

  // Every navigation, and the first load. Declared after the effect above so
  // the callbacks it reaches for are already in hand on the first render.
  //
  // Arriving home arms the runs from the top; arriving anywhere else hands
  // Lenis the new page and leaves it with no runs at all. Both paths re-measure,
  // and both have to: the effect that owns the runs is mounted in the layout, so
  // it outlives any client navigation, and a page that declares no
  // `[data-autoplay]` of its own would otherwise inherit the runs of the page
  // before it and scroll itself with them.
  //
  // `isHome`, not `pathname === "/"`. The Chinese home page is `/zh` and is the
  // same page - under the old check it was the one home page that never got its
  // runs armed, and every navigation within the Chinese half of the site was
  // treated as a navigation away from home.
  //
  // Twice, a frame apart. This effect runs on commit, but Next puts the window
  // back at the top of the new page after that, and the layout being measured
  // has not been painted yet - so the first pass fixes the common case at once
  // and the second catches the height and the scroll position once they have
  // settled. Both are idempotent, so running twice costs a measurement.
  useEffect(() => {
    const settle = () => arriveRef.current?.(isHome(pathname));
    settle();
    const id = requestAnimationFrame(settle);
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // The header logo, for a reader who is already home.
  useEffect(() => {
    const onReplay = () => arriveRef.current?.(true);
    window.addEventListener(HERO_REPLAY_EVENT, onReplay);
    return () => window.removeEventListener(HERO_REPLAY_EVENT, onReplay);
  }, []);

  return null;
}
