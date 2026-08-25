"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { CaretDown, List } from "@phosphor-icons/react/dist/ssr";
import { siWhatsapp } from "simple-icons";
import { NAV, LOCALES, LOGO_ALT, WHATSAPP } from "@/lib/content";
import { Z } from "@/lib/z";
import { replayHero } from "@/lib/autoplay";
import { MobileNav } from "./MobileNav";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Shared by both arms of the nav leaf branch. There is no clsx in this repo,
    so the string is hoisted rather than duplicated. */
const NAV_LINK =
  "block rounded-full px-2.5 py-1.5 text-sm whitespace-nowrap text-ink transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97] hover:text-ink";

/**
 * Floating island header with a liquid-glass texture.
 *
 * The glass is a web glassmorphism approximation, not Apple Liquid Glass.
 * The morph is scroll-driven through motion values only: no scroll listener,
 * no component state, so nothing re-renders as the page moves. The element is
 * `position: fixed`, so interpolating its width reflows only its own subtree.
 */
export function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const [openAbout, setOpenAbout] = useState(false);
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const { scrollY } = useScroll();

  const range = [0, 120];
  const maxWidth = useTransform(scrollY, range, [1344, 1000], { clamp: true });
  const radius = useTransform(scrollY, range, [22, 999], { clamp: true });
  const background = useTransform(
    scrollY,
    range,
    ["rgba(255,255,255,0.28)", "rgba(255,255,255,0.62)"],
    { clamp: true },
  );
  const blur = useTransform(scrollY, range, [12, 28], { clamp: true });
  const backdropFilter = useTransform(blur, (b) => `blur(${b}px) saturate(180%)`);
  const shadow = useTransform(
    scrollY,
    range,
    [
      "0 2px 10px rgba(16,18,21,0.04)",
      "0 10px 34px rgba(16,18,21,0.12)",
    ],
    { clamp: true },
  );
  const logoScale = useTransform(scrollY, range, [1, 0.85], { clamp: true });
  const logoTransform = useTransform(logoScale, (s) => `scale(${s})`);

  const staticStyle = reduce
    ? { maxWidth: 1344, borderRadius: 22 }
    : {
        maxWidth,
        borderRadius: radius,
        background,
        backdropFilter,
        WebkitBackdropFilter: backdropFilter,
        boxShadow: shadow,
      };

  return (
    <>
      <header
        className="fixed inset-x-0 top-4 flex justify-center px-4 md:px-8 lg:px-12"
        style={{ zIndex: Z.header }}
      >
        <motion.div
          style={staticStyle}
          className="glass glass-rim relative flex h-16 w-full items-center gap-4 overflow-hidden px-4 sm:px-5"
        >
          {/* Home is where the hero plays, so the mark is also the way back to
              the top of it — including from the home page itself, where the
              link alone would not move anything. */}
          <Link href="/" aria-label="MEVO Malaysia, home" onClick={replayHero}>
            <motion.span
              className="block origin-left"
              style={reduce ? undefined : { transform: logoTransform }}
            >
              <Image
                src="/logo.png"
                alt={LOGO_ALT}
                width={2220}
                height={174}
                priority
                className="h-4 w-auto"
              />
            </motion.span>
          </Link>

          <nav className="ml-auto hidden lg:block">
            <ul className="flex items-center">
              {NAV.map((item) =>
                item.children ? (
                  <li
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setOpenAbout(true)}
                    onMouseLeave={() => setOpenAbout(false)}
                  >
                    <button
                      type="button"
                      aria-expanded={openAbout}
                      onFocus={() => setOpenAbout(true)}
                      className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-sm text-ink transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97]"
                    >
                      {item.label}
                      <CaretDown size={11} weight="bold" className="text-ink-3" />
                    </button>

                    <AnimatePresence>
                      {openAbout && (
                        <motion.div
                          className="glass glass-rim absolute left-0 top-full mt-2 w-52 origin-top-left overflow-hidden rounded-[14px] p-1.5"
                          initial={
                            reduce
                              ? { opacity: 0 }
                              : { opacity: 0, transform: "scale(0.97)" }
                          }
                          animate={{ opacity: 1, transform: "scale(1)" }}
                          exit={
                            reduce
                              ? { opacity: 0 }
                              : { opacity: 0, transform: "scale(0.97)" }
                          }
                          transition={{ duration: 0.18, ease: EASE_OUT }}
                        >
                          {item.children.map((child) => (
                            <a
                              key={child.label}
                              href="#"
                              aria-disabled="true"
                              className="block rounded-[9px] px-3 py-2 text-sm text-ink-2 transition-colors duration-200 hover:bg-[rgb(255_255_255/0.6)] hover:text-ink"
                            >
                              {child.label}
                            </a>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                ) : (
                  <li key={item.label}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        aria-current={pathname === item.href ? "page" : undefined}
                        className={NAV_LINK}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <a href="#" aria-disabled="true" className={NAV_LINK}>
                        {item.label}
                      </a>
                    )}
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="ml-auto hidden items-center gap-0.5 rounded-full border border-[rgb(255_255_255/0.7)] bg-[rgb(255_255_255/0.35)] p-0.5 lg:ml-4 lg:flex">
            {LOCALES.map((locale, i) => (
              <button
                key={locale}
                type="button"
                aria-pressed={i === 0}
                className={`rounded-full px-2 py-0.5 font-mono text-xs transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97] ${
                  i === 0 ? "bg-ink text-bg" : "text-ink-3"
                }`}
              >
                {locale}
              </button>
            ))}
          </div>

          {/* ml-auto below lg, where the nav and the locale switch are hidden:
              without it this would sit beside the logo instead of beside the
              menu button. Simple Icons for the brand mark, as the footer does. */}
          <a
            href={WHATSAPP.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={WHATSAPP.label}
            className="ml-auto grid size-9 place-items-center rounded-full border border-[rgb(255_255_255/0.7)] bg-[rgb(255_255_255/0.4)] text-ink transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97] lg:ml-2"
          >
            <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
              <path d={siWhatsapp.path} />
            </svg>
          </a>

          <button
            type="button"
            onClick={() => setOpenMenu(true)}
            aria-label="Open menu"
            className="grid size-9 place-items-center rounded-full border border-[rgb(255_255_255/0.7)] bg-[rgb(255_255_255/0.4)] text-ink transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97] lg:hidden"
          >
            <List size={17} weight="regular" />
          </button>
        </motion.div>
      </header>

      <MobileNav open={openMenu} onClose={() => setOpenMenu(false)} />
    </>
  );
}
