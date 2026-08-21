"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react/dist/ssr";
import { NAV, LOCALES, LOGO_ALT } from "@/lib/content";
import { Z } from "@/lib/z";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Shared by both arms of the nav leaf branch, as in Header. */
const NAV_LINK = "block py-2 text-2xl font-medium tracking-tight text-ink";

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 lg:hidden"
          style={{ zIndex: Z.drawer }}
          initial={reduce ? { opacity: 0 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: EASE_OUT }}
        >
          <div
            className="absolute inset-0 bg-[rgb(244_245_246/0.6)]"
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            className="glass glass-rim absolute inset-x-3 top-3 origin-top overflow-hidden rounded-[16px] p-5"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, transform: "scale(0.95) translateY(-8px)" }
            }
            animate={{ opacity: 1, transform: "scale(1) translateY(0px)" }}
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, transform: "scale(0.97) translateY(-4px)" }
            }
            transition={{ duration: 0.22, ease: EASE_OUT }}
          >
            <div className="flex items-center justify-between">
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

            <nav className="mt-6">
              <ul className="grid gap-1">
                {NAV.map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={reduce ? false : { opacity: 0, transform: "translateY(8px)" }}
                    animate={{ opacity: 1, transform: "translateY(0px)" }}
                    transition={{
                      duration: 0.24,
                      delay: reduce ? 0 : 0.04 * i,
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
                      <ul className="mb-2 ml-1 grid gap-0.5 border-l border-line pl-4">
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

            <div className="mt-6 flex gap-1 border-t border-line pt-5">
              {LOCALES.map((locale, i) => (
                <button
                  key={locale}
                  type="button"
                  aria-pressed={i === 0}
                  className={`rounded-full px-3 py-1 font-mono text-xs transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97] ${
                    i === 0 ? "bg-ink text-bg" : "text-ink-3"
                  }`}
                >
                  {locale}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
