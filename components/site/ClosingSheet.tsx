"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { hasClosingCurtain } from "@/lib/paths";
import { Z } from "@/lib/z";

/**
 * The CTA and the footer, as one sheet drawn up over the held page.
 *
 * They were two siblings that happened to sit next to each other, and a curtain
 * on the band alone lifted the band while the footer stayed put — half of what
 * closes the page moving and half not. They move as one now.
 *
 * THE CURTAIN IS NOT IN THIS FILE. It is the pin in components/site/PageHold.tsx
 * wrapped around everything above: that freezes the page's last screen once it
 * has been scrolled past, and this sheet then scrolls up over something standing
 * still. Which is the whole mechanism the rest of the site uses between
 * sections, and the reason earlier attempts here did not look like it — a
 * negative margin and a tween move a panel, but if what is behind it is moving
 * at the same speed nothing is ever crossed.
 *
 * So there is no margin, no transform and no ScrollTrigger. The sweep is the
 * page's own scrolling against a held backdrop, which is why it costs nothing
 * and cannot fall out of step on a short page the way a scrubbed range can.
 *
 * THE CURTAIN IS THE HOME PAGE'S ALONE NOW, and this reads the same predicate
 * PageHold does — see `hasClosingCurtain`. Off the home page the pin above is
 * gone, so there is nothing held for this to cross, and what is left has to
 * come off with it:
 *
 *   `sheet` is the lip of shadow the LEADING EDGE of a curtain carries. With
 *   nothing to travel over it is a dark line permanently ruled above the
 *   footer, which reads as a seam in the page rather than as depth.
 *
 *   `Z.raised` exists to put this in front of the held page. With nothing
 *   holding, raising it lifts the footer out of the normal flow order for no
 *   reason, and a raised box that overlaps nothing is only a way for a later
 *   change to end up painted underneath it.
 *
 * Which leaves a plain wrapper: the band and the footer, in flow, scrolling up
 * from the bottom of the page like anything else. The pair stays grouped — that
 * was never about the curtain.
 */
export function ClosingSheet({ children }: { children: ReactNode }) {
  const curtained = hasClosingCurtain(usePathname());

  /* A bare fragment rather than the same div without its classes: an
     unpositioned wrapper with no styles of its own is a box the layout has to
     account for and nothing needs. */
  if (!curtained) return <>{children}</>;

  return (
    <>
      {/* THE LINGER. An empty stretch of scroll between the held page and the
          sheet, so the page's last screen (on the home page, the
          testimonials) stays fully on view a while before the sheet starts to
          cross it, rather than being covered the moment it settles. Invisible:
          it is unraised, so the held page paints over it. Change the height to
          hold longer or shorter; gone under reduced motion, where nothing is
          held. */}
      <div aria-hidden className="h-[35svh] motion-reduce:hidden" />
      <div className="sheet relative" style={{ zIndex: Z.raised }}>
        {children}
      </div>
    </>
  );
}
