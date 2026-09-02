"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { hasEnquiryBand } from "@/lib/paths";

/**
 * Holds the page's last screen so the closing sheet can be drawn over it.
 *
 * This is the half of the curtain that is easy to miss. Everywhere else on the
 * site a curtain works because the section above PINS — it stops on screen
 * while the section below rides up over it, and the reader watches an edge
 * travel across something standing still. Without that hold there is no
 * curtain: two things scrolling together at the same speed cannot overlap,
 * however large a negative margin they are given.
 *
 * The section above here is the whole page, and it is different on every route,
 * so it cannot be asked to pin itself. This wraps it and does it from outside.
 *
 * `top: min(0px, 100lvh - height)` is the FOOT-PIN, the same expression
 * Stats.tsx uses and /our-story's frame after it. Read it in two cases:
 *
 *   - The page is taller than the screen, which is the normal one. The
 *     expression is a large negative number, so the wrapper sticks only once it
 *     has been scrolled almost entirely past — the moment its own foot reaches
 *     the foot of the screen. From then on its LAST SCREEN is frozen and the
 *     sheet below scrolls up over it.
 *   - The page is shorter than the screen. `min` picks 0, the wrapper pins at
 *     the top, and the sheet covers it from below. There is barely any scroll
 *     on such a page and nothing to watch either way.
 *
 * NOT ON /contact. The sheet that rides up is the enquiry band plus the footer,
 * and /contact is the one page the band takes itself off — so the sheet there
 * is a footer on its own, half the height, unable to cover the screen, drawing
 * a curtain over a form for no reason. `hasEnquiryBand` is the single predicate
 * both this and the band read, so the two can never end up disagreeing about
 * which pages close this way.
 *
 * CSS cannot ask an element for its own height, so it is measured here and
 * written back as a variable. Observed rather than measured once: the page
 * reflows with the URL bar, a rotation, a font swap, an image landing, and an
 * accordion opening — and a stale height leaves the pin either short of the
 * foot or past it, which shows as the last screen jumping as the curtain
 * starts.
 */
export function PageHold({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const held = hasEnquiryBand(pathname);

  useEffect(() => {
    const el = ref.current;
    if (!el || !held) return;

    const measure = () =>
      el.style.setProperty("--hold-h", `${Math.round(el.offsetHeight)}px`);

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [held]);

  /* A plain wrapper where there is no curtain. Not `position: static` on the
     same element with the `top` left in place — an unpinned page should have
     nothing measuring it and no custom property set on it either, so the only
     difference between the two states is one class. */
  if (!held) return <div>{children}</div>;

  return (
    <div
      ref={ref}
      /* No `z-index`. The closing sheet comes after this in the source and is
         raised, so it paints over this without either of them having to name a
         number — and leaving this unpositioned in the stack keeps the home
         page's own raised sheet working inside it. */
      className="sticky motion-reduce:static"
      style={{ top: "min(0px, calc(100lvh - var(--hold-h, 100lvh)))" }}
    >
      {children}
    </div>
  );
}
