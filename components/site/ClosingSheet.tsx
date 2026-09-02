import type { ReactNode } from "react";

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
 * `sheet` is the shadow the leading edge carries — the same class Background,
 * Stats, Services and Projects use where they overlap. `Z.raised` is what puts
 * this in front of the held page, including the home page's own raised stack.
 */
export function ClosingSheet({ children }: { children: ReactNode }) {
  return (
    <div className="sheet relative" style={{ zIndex: Z.raised }}>
      {children}
    </div>
  );
}
