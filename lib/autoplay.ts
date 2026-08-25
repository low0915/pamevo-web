/**
 * Fired when the page should go back to the top and play its opening again —
 * the header logo asks for this when the reader is already home, where a link
 * to `/` navigates nowhere and so resets nothing on its own.
 *
 * The runs themselves are declared by the sections, in `data-autoplay` (how
 * many viewport heights the section's scrubbed sequence lasts) and
 * `data-autoplay-speed` (how many of those to play per second). See
 * components/ui/SmoothScroll.tsx, which reads them.
 */
export const HERO_REPLAY_EVENT = "hero:replay";

export function replayHero() {
  window.dispatchEvent(new Event(HERO_REPLAY_EVENT));
}

/**
 * Stands the autoplay down while something else owns the reader's attention,
 * and hands the page back when it is done.
 *
 * The autoplay infers "a reader has taken over" from scroll input — a wheel, a
 * swipe, a key, a tab returning to the foreground. A dialog opening produces
 * none of those, so a page left to itself would scroll on behind someone who is
 * reading a cookie notice. These two events say it in words instead.
 *
 * Held rather than stopped: the release resumes the run from wherever the page
 * now is, after the same beat any other interruption gets.
 */
export const AUTOPLAY_HOLD_EVENT = "autoplay:hold";
export const AUTOPLAY_RELEASE_EVENT = "autoplay:release";

export function holdAutoplay() {
  window.dispatchEvent(new Event(AUTOPLAY_HOLD_EVENT));
}

export function releaseAutoplay() {
  window.dispatchEvent(new Event(AUTOPLAY_RELEASE_EVENT));
}
