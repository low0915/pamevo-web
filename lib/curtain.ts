/**
 * The home page's curtain scroll effect, on or off.
 *
 * On: every band below the hero pins and the next one rides up over it
 * (DoorCollection -> WhyMevo -> Stats), and the enquiry band + footer are
 * drawn up over the held page at the end (PageHold + ClosingSheet).
 *
 * Off: the same sections, in plain flow, one after another - the layout the
 * page already falls back to under `prefers-reduced-motion`. Nothing is
 * deleted; flip this back to `true` to restore the effect exactly as it was.
 */
export const HOME_CURTAIN = false;
