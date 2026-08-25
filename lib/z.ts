/** Documented z-index scale. Nothing in this project sets an arbitrary z value. */
export const Z = {
  base: 0,
  raised: 10,
  header: 40,
  drawer: 50,
  grain: 60,
  /** Over the grain: the lightbox owns the screen while it is open. */
  lightbox: 70,
  /** Top of the stack. A consent choice is the one surface that must never be
   *  obscured, whatever is open behind it. Handed to vanilla-cookieconsent at
   *  runtime as --cc-z-index; see components/site/CookieConsent.tsx. */
  consent: 80,
} as const;
