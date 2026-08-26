/**
 * Takes the page's scroll away while a dialog owns the screen, and gives it
 * back when the dialog closes.
 *
 * `overflow: hidden` on the body is not enough on its own, and the reason is
 * worth writing down: it stops a *reader* scrolling, not a *script*. Lenis
 * cancels the wheel event and sets the scroll position itself, and the
 * autoplay asks it to scroll on a timer — both are programmatic, both sail
 * straight past an overflow that is only there to refuse a gesture. So the
 * lock has to be spoken to Lenis, which is what these events are for. The body
 * overflow stays as well: it is what covers the keyboard, the scrollbar, and
 * the reduced-motion case where there is no Lenis at all.
 *
 * Events rather than a shared instance, as with lib/autoplay.ts: the Lenis
 * instance belongs to components/ui/SmoothScroll.tsx and is not worth exporting
 * out of the effect that owns its lifetime.
 *
 * A locked page still lets a dialog scroll its own content, as long as the
 * dialog is marked `data-lenis-prevent` — Lenis checks that before it checks
 * whether it has been stopped, so the gesture is left to the browser.
 */
export const SCROLL_LOCK_EVENT = "scroll:lock";
export const SCROLL_UNLOCK_EVENT = "scroll:unlock";

export function lockScroll() {
  window.dispatchEvent(new Event(SCROLL_LOCK_EVENT));
}

export function unlockScroll() {
  window.dispatchEvent(new Event(SCROLL_UNLOCK_EVENT));
}
