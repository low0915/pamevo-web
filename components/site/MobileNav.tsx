"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react/dist/ssr";
import { NAV, NAV_ZH, NAV_BM, LOCALE_MENU, LOGO_ALT } from "@/lib/content";
import { counterpart, isCurrentPath, useLocale } from "@/lib/locale";
import { Flag } from "@/components/ui/Flag";
import { Z } from "@/lib/z";
import { holdAutoplay, releaseAutoplay } from "@/lib/autoplay";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Shared by both arms of the nav leaf branch, as in Header. The links are set
    at the scale the section headings use rather than at a menu's: this surface
    is the whole screen, and a list of two items at 24px in the middle of it
    reads as a panel that failed to size itself. */
const NAV_LINK =
  "relative block py-6 text-[2.25rem] leading-[1.05] font-medium tracking-tighter text-ink";

/** The same mark the island carries, at this surface's scale: 2px where that
    one is a hairline, because it sits under 36px type rather than under 14px,
    and short rather than full-width so it reads as a mark on the label rather
    than as another of the rules that divide the rows. */
const CURRENT_MARK = (
  <span
    aria-hidden
    className="pointer-events-none absolute bottom-5 left-0 h-0.5 w-10 bg-ink"
  />
);

/** A hairline on the frost. The `--line` token is mixed for the page's own
    near-white ground and all but disappears here. */
const RULE = "border-[rgb(16_18_21/0.12)]";

/**
 * Mobile menu, as a full-screen frosted sheet.
 *
 * It covers the viewport rather than dropping a panel under the header
 * island, so the page behind it is frosted whole and the menu is the only
 * thing being read. The material is `.glass-sheet`: the same web
 * glassmorphism as the island, tinted heavier because this one can be opened
 * anywhere on the page and has to hold ink text over the dark sections too.
 *
 * The top row is laid on the island's own coordinates - 32px in, its content
 * box 64px tall under a 16px inset - so the mark does not jump as the sheet
 * takes over from the header it covers.
 *
 * Only the sheet fades; the links arrive after it on a short stagger. Fading
 * the two together would have the copy resolve out of the blur rather than
 * onto it, which reads as a page loading rather than as a menu opening.
 */
export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const { locale: active } = useLocale();
  /* A link, not a button: the two languages are separate URLs. */
  const pathname = usePathname();
  /* See the note in Header: NAV is a bare array, so this is a swap rather than
     an overlay. Both surfaces read the same two lists. */
  const nav = active === "ZH" ? NAV_ZH : active === "BM" ? NAV_BM : NAV;

  // The page is held still for as long as the menu is up. Three things, and
  // all three are needed: the body overflow refuses a reader's gesture, the
  // scroll lock refuses the wheel and the touch at Lenis, which cancels them
  // and scrolls the page itself and so would sail straight through an overflow
  // rule, and the autoplay hold stands down the timed run that would otherwise
  // carry the page along behind the menu on its own. The last of those is the
  // same hold the cookie notice takes; see lib/autoplay.ts.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lockScroll();
    holdAutoplay();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      unlockScroll();
      releaseAutoplay();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          // `dvh` rather than `inset-0`: the sheet is fixed, and on a phone
          // the fixed viewport is the tall one, so `inset-0` leaves the strip
          // behind the URL bar unfrosted until the bar collapses.
          className="glass-sheet fixed inset-x-0 top-0 flex h-[100dvh] flex-col overflow-y-auto overscroll-contain lg:hidden"
          // The sheet is exempt from the lock it just took out. Lenis tests for
          // this before it tests whether it has been stopped, so a gesture
          // inside the menu is handed back to the browser and the sheet can
          // still scroll its own copy on a short screen. `overscroll-contain`
          // is what stops that scroll running on into the page underneath.
          data-lenis-prevent
          style={{ zIndex: Z.drawer }}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.12 : 0.24, ease: EASE_OUT }}
        >
          <div className="flex h-20 shrink-0 items-center justify-between px-8 pt-4 sm:px-9">
            <Image
              src="/logo.png"
              alt={LOGO_ALT}
              width={2220}
              height={174}
              className="h-5 w-auto"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="grid size-9 place-items-center rounded-full border border-[rgb(255_255_255/0.7)] bg-[rgb(255_255_255/0.5)] text-ink transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97]"
            >
              <X size={16} weight="regular" />
            </button>
          </div>

          {/* Centred in what the top row and the locale switch leave, so the
              list sits on the optical middle of the sheet at any height. */}
          <nav className="flex flex-1 flex-col justify-center px-8 sm:px-9">
            <ul>
              {/* Keyed by route, not by label: the locale toggle rewrites every
                  label, and a remount would replay the entrance stagger under a
                  reader who only changed language. */}
              {nav.map((item, i) => (
                <motion.li
                  key={item.href ?? i}
                  className={`${RULE} border-t last:border-b`}
                  initial={
                    reduce ? false : { opacity: 0, transform: "translateY(12px)" }
                  }
                  animate={{ opacity: 1, transform: "translateY(0px)" }}
                  transition={{
                    duration: 0.32,
                    delay: reduce ? 0 : 0.08 + 0.05 * i,
                    ease: EASE_OUT,
                  }}
                >
                  {item.href ? (
                    <Link
                      href={item.href}
                      /* The sheet said nothing about where the reader was. It
                         is the whole navigation on a phone, so it is the one
                         surface that most needs to. */
                      aria-current={
                        isCurrentPath(pathname, item.href) ? "page" : undefined
                      }
                      onClick={onClose}
                      className={NAV_LINK}
                    >
                      {item.label}
                      {isCurrentPath(pathname, item.href) && CURRENT_MARK}
                    </Link>
                  ) : (
                    <a
                      href="#"
                      aria-disabled="true"
                      onClick={onClose}
                      className={NAV_LINK}
                    >
                      {item.label}
                    </a>
                  )}
                  {item.children && (
                    <ul className={`${RULE} mb-5 ml-1 grid gap-1 border-l pl-4`}>
                      {item.children.map((child) => (
                        <li key={child.label}>
                          {/* A plain anchor for the reason the island's copy
                              of this gives: these are fragment links the
                              catalogue reads, and a client navigation to a
                              fragment fires no event for it to read. */}
                          <a
                            href={child.href}
                            aria-disabled={child.href ? undefined : "true"}
                            onClick={onClose}
                            className="block py-1 text-base text-ink-2"
                          >
                            {child.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.li>
              ))}
            </ul>
          </nav>
          {/* The same three languages the header switch offers, and the same
              three states — see LOCALE_MENU in lib/content.ts. A row of chips
              rather than the dropdown the header uses: this sheet is the whole
              screen and has the width for all three, and a menu inside a menu
              would be a control opened to reach a control. */}
          <div className="flex shrink-0 gap-1 px-8 pt-6 pb-10 sm:px-9">
            {LOCALE_MENU.map((entry) => {
              const current = entry.locale === active;
              const className = `flex items-center rounded-full px-3 py-2 transition-transform duration-[160ms] ease-[var(--ease-out)] ${
                current
                  ? "bg-ink"
                  : entry.locale
                    ? "border border-[rgb(16_18_21/0.12)] active:scale-[0.97]"
                    : "border border-[rgb(16_18_21/0.12)] opacity-45"
              }`;
              /* The flag is `aria-hidden` wherever it is used, so each chip
                 carries the language's own name for anything reading the page.
                 The header's switch has the name on the row beside the flag and
                 needs no equivalent; here the chip is the flag and nothing
                 else. */
              const body = (
                <>
                  <Flag code={entry.code} />
                  <span className="sr-only" lang={entry.lang}>
                    {entry.name}
                  </span>
                </>
              );

              /* Not a link when it is the language already being read — see the
                 same control in Header.tsx for why. */
              if (current) {
                return (
                  <span
                    key={entry.code}
                    aria-current="true"
                    className={className}
                  >
                    {body}
                  </span>
                );
              }

              /* Named but not built. Held at half strength rather than left
                 looking live: on this surface there is no hover to reveal that
                 nothing happens, and a chip that looks like the others and does
                 nothing reads as a broken menu rather than as a language on the
                 way. */
              if (!entry.locale) {
                return (
                  <a
                    key={entry.code}
                    href="#"
                    aria-disabled="true"
                    onClick={onClose}
                    className={className}
                  >
                    {body}
                  </a>
                );
              }

              return (
                <a
                  key={entry.code}
                  href={counterpart(pathname, entry.locale)}
                  hrefLang={entry.lang}
                  onClick={onClose}
                  className={className}
                >
                  {body}
                </a>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
