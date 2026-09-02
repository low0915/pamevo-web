import type { ReactNode } from "react";

import type { Locale } from "@/lib/paths";

/**
 * The three flags the language switch is drawn with.
 *
 * Inline SVG, as the WhatsApp mark in the header is: the CSP is `'self'` for
 * everything and there is no icon dependency in this repo that carries flags,
 * so a package would be a network install and a bundle for three shapes that
 * never change. These are a few hundred bytes each and are drawn from the
 * official constructions rather than traced by eye — the stars in particular
 * are computed, not sketched.
 *
 * Normalised to 3:2 in a 24x16 box. Malaysia and the United Kingdom are both
 * 1:2 flags and China is 2:3, so all three are off their true proportions
 * here. That is the ordinary compromise for a set of flags in a list: at 18px
 * wide, ragged widths read as a broken layout and a stretched Union Jack does
 * not read as anything at all.
 *
 * Some simplifications are deliberate and only visible under magnification:
 * the Union Jack's saltire is drawn symmetric rather than counterchanged, and
 * Malaysia's canton is a clean half rather than the true eight-stripe height.
 * At the size this is used, neither is a difference anyone can see.
 *
 * WHICH COUNTRY STANDS FOR WHICH LANGUAGE is a convention, not a fact, and
 * these are the conventional picks rather than the only defensible ones:
 * the United Kingdom for English, Malaysia for Bahasa Melayu, China for
 * Simplified Chinese. The middle one is the only one that is really about this
 * country. If the client would rather English carried no flag, or a different
 * one, it is one entry in the record below.
 */

/** Every flag is drawn in this box and scaled by the caller. */
const BOX = "0 0 24 16";

const FLAGS: Record<string, ReactNode> = {
  /* United Kingdom. Blue field, white saltire, red saltire over it, then the
     white cross and the red cross of St George over both. Drawn as strokes
     rather than as filled polygons: at this size the geometry that separates
     the two reads identically and the stroke version is a tenth of the path. */
  EN: (
    <>
      <rect width="24" height="16" fill="#012169" />
      {/* No clip path: an `svg` root clips to its own viewport already, and a
          fixed id would be repeated once per flag on the page. */}
      <path d="M0 0 24 16M24 0 0 16" stroke="#fff" strokeWidth="3.4" />
      <path d="M0 0 24 16M24 0 0 16" stroke="#C8102E" strokeWidth="1.8" />
      <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5.4" />
      <path d="M12 0v16M0 8h24" stroke="#C8102E" strokeWidth="3.2" />
    </>
  ),

  /* Malaysia. Fourteen stripes for the thirteen states and the federal
     government, red first; the canton carries the crescent and the
     fourteen-pointed Bintang Persekutuan. The crescent is one disc with a
     second punched out of it, which is what a crescent is. */
  BM: (
    <>
      <rect width="24" height="16" fill="#fff" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect
          key={i}
          y={(i * 16) / 7}
          width="24"
          height={16 / 14}
          fill="#CC0001"
        />
      ))}
      <rect width="12" height="9.14" fill="#010066" />
      {/* The crescent is a gold disc with a second disc punched out of it, and
          the punch is painted in the canton's own blue rather than cut with a
          mask or an even-odd path. It sits wholly inside the canton, so a blue
          disc is exactly the hole — and one fewer thing to get wrong than two
          arcs, which is how this was drawn first: same radius, same endpoints,
          opposite sweeps, which traces one circle twice and fills nothing. */}
      <circle cx="5" cy="4.57" r="2.7" fill="#FFCC00" />
      <circle cx="6.1" cy="4.57" r="2.25" fill="#010066" />
      <path
        d="M8.35 2.62 8.62 3.39 9.20 2.81 9.10 3.62 9.87 3.35 9.44 4.05 10.25 4.14 9.56 4.57 10.25 5.00 9.44 5.09 9.87 5.79 9.10 5.52 9.20 6.33 8.62 5.75 8.35 6.52 8.08 5.75 7.50 6.33 7.60 5.52 6.83 5.79 7.26 5.09 6.45 5.00 7.14 4.57 6.45 4.14 7.26 4.05 6.83 3.35 7.60 3.62 7.50 2.81 8.08 3.39Z"
        fill="#FFCC00"
      />
    </>
  ),

  /* China. One large star with four smaller ones in an arc, each of the four
     turned so that one of its points aims at the large one.

     Placed off the official 30x20 construction rather than by eye — big star
     at (5,5) r3, the four at (10,2) (12,4) (12,7) (10,9) r1 — scaled by 0.8
     into this box. Set by eye first, and the cluster sat low and wide enough
     to read as the wrong flag. */
  ZH: (
    <>
      <rect width="24" height="16" fill="#EE1C25" />
      <g fill="#FFDE00">
        <path d="M4.00 1.60 4.54 3.26 6.28 3.26 4.87 4.28 5.41 5.94 4.00 4.92 2.59 5.94 3.13 4.28 1.72 3.26 3.46 3.26Z" />
        <path d="M8.41 2.29 7.97 1.90 7.47 2.20 7.70 1.67 7.26 1.29 7.84 1.34 8.07 0.80 8.20 1.37 8.78 1.42 8.28 1.72Z" />
        <path d="M9.71 3.99 9.46 3.47 8.88 3.55 9.30 3.15 9.04 2.63 9.56 2.90 9.97 2.49 9.87 3.07 10.39 3.34 9.81 3.42Z" />
        <path d="M9.38 6.37 9.36 5.79 8.80 5.63 9.35 5.43 9.33 4.85 9.68 5.31 10.23 5.11 9.91 5.59 10.26 6.05 9.70 5.89Z" />
        <path d="M7.50 7.82 7.71 7.28 7.25 6.92 7.83 6.94 8.04 6.40 8.19 6.96 8.77 6.99 8.29 7.31 8.44 7.87 7.99 7.51Z" />
      </g>
    </>
  ),
};

/**
 * One flag, at the size the switch uses it.
 *
 * `aria-hidden`, always. A flag is not the name of a language — it is a country
 * — and a reader who cannot see it is owed the word rather than the picture.
 * Every place this is used carries the language's own name or an `aria-label`
 * beside it; if a new caller does not, it needs one.
 *
 * The hairline is load-bearing on two of the three: Malaysia and the United
 * Kingdom both run white to their edges, and on the near-white glass this sits
 * on there would otherwise be no telling where the flag stops.
 */
export function Flag({
  code,
  className,
}: {
  code: Locale | string;
  className?: string;
}) {
  const art = FLAGS[code];
  if (!art) return null;

  return (
    <svg
      viewBox={BOX}
      className={`h-3 w-[1.125rem] shrink-0 rounded-[2px] ring-1 ring-[rgb(16_18_21/0.2)] ${className ?? ""}`}
      aria-hidden
      focusable="false"
    >
      {art}
    </svg>
  );
}
