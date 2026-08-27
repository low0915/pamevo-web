"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react/dist/ssr";
import { NAV, NAV_ZH, LOCALES, LOGO_ALT } from "@/lib/content";
import { counterpart, useLocale } from "@/lib/locale";
import { Z } from "@/lib/z";
import { holdAutoplay, releaseAutoplay } from "@/lib/autoplay";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Shared by both arms of the nav leaf branch, as in Header. The links are set
    at the scale the section headings use rather than at a menu's: this surface
    is the whole screen, and a list of two items at 24px in the middle of it
    reads as a panel that failed to size itself. */
const NAV_LINK =
  "block py-6 text-[2.25rem] leading-[1.05] font-medium tracking-tighter text-ink";

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
  const nav = active === "ZH" ? NAV_ZH : NAV;

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
                    <Link href={item.href} onClick={onClose} className={NAV_LINK}>
                      {item.label}
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
                          <a
                            href="#"
                            aria-disabled="true"
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

          <div className="flex shrink-0 gap-1 px-8 pt-6 pb-10 sm:px-9">
            {LOCALES.map((locale) => {
              const current = locale === active;
              const className = `rounded-full px-3 py-1 font-mono text-xs transition-transform duration-[160ms] ease-[var(--ease-out)] ${
                current ? "bg-ink text-bg" : "text-ink-3 active:scale-[0.97]"
              }`;

              /* Not a link when it is the language already being read — see the
                 same control in Header.tsx for why. */
              if (current) {
                return (
                  <span
                    key={locale}
                    aria-current="true"
                    lang={locale === "ZH" ? "zh-Hans" : "en"}
                    className={className}
                  >
                    {locale}
                  </span>
                );
              }

              return (
                <a
                  key={locale}
                  href={counterpart(pathname, locale)}
                  hrefLang={locale === "ZH" ? "zh-Hans" : "en"}
                  lang={locale === "ZH" ? "zh-Hans" : "en"}
                  onClick={onClose}
                  className={className}
                >
                  {locale}
                </a>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
