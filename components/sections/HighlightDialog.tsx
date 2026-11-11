"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
  type PanInfo,
} from "motion/react";
import { CaretLeftIcon, CaretRightIcon, X } from "@phosphor-icons/react";
import { Z } from "@/lib/z";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { holdAutoplay, releaseAutoplay } from "@/lib/autoplay";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export type Highlight = {
  title: string;
  /** The test grades, as printed on the card. */
  grades: string[];
  /** The plain-language explanation shown only here. */
  detail?: string;
  image: { src: string; alt: string };
};

export type HighlightLabels = {
  close: string;
  previous: string;
  next: string;
};

/* `md` and up is the centred modal; below it the bottom sheet. Read through
   useSyncExternalStore rather than an effect, so the first paint after hydration
   already knows which entrance to play. The server snapshot is `false` - the
   sheet - which only matters for the frame before hydration, when the dialog
   is closed anyway. */
const MD = "(min-width: 768px)";
function subscribe(cb: () => void) {
  const mq = window.matchMedia(MD);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
/* True once on the client. The dialog is portalled to <body>, which does not
   exist on the server, so the portal is only made after hydration. */
const noop = () => () => {};
function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}

function useDesktop() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MD).matches,
    () => false,
  );
}

/**
 * One engineering highlight held over the page: a centred dialog from `md` up,
 * a sheet risen from the foot of the screen below it.
 *
 * ONE PANEL, TWO SHAPES. The markup is the same at every width - picture, then
 * the copy - and only its arrangement changes: stacked in a sheet on a phone,
 * side by side in a dialog from `md`. So there is one list of things in one
 * order for a screen reader whichever shape is on screen.
 *
 * The sheet closes by its grab handle as well as by the X, the backdrop and
 * Escape. The drag is started from the handle only (drag controls, not
 * `drag` on the whole panel) because the panel's body scrolls on a short
 * phone, and a sheet that also dragged from its body would fight its own
 * scroll.
 *
 * Previous and next walk the five without closing, wrapping at either end the
 * way the carousel behind it does.
 *
 * Focus moves to the close button on open and back to the card that opened it
 * on close, the same contract the Lightbox keeps.
 */
export function HighlightDialog({
  items,
  index,
  onIndex,
  onClose,
  labels,
}: {
  items: Highlight[];
  /** Which highlight is open, or `null` for closed. */
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
  labels: HighlightLabels;
}) {
  const reduce = useReducedMotion();
  const desktop = useDesktop();
  const mounted = useMounted();
  const drag = useDragControls();
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<Element | null>(null);
  const open = index !== null;
  const count = items.length;

  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement;
    closeRef.current?.focus();

    /* The same three holds the mobile menu takes: body overflow for a reader's
       gesture, Lenis's lock for the wheel and touch it would otherwise scroll
       the page with, and the autoplay hold for the timed runs behind it. */
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lockScroll();
    holdAutoplay();

    return () => {
      document.body.style.overflow = previous;
      unlockScroll();
      releaseAutoplay();
      const opener = openerRef.current;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [open]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % count);
      if (e.key === "ArrowLeft") onIndex((index - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, count, onClose, onIndex]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) onClose();
  };

  const item = index === null ? null : items[index];

  /* The sheet rises from below the screen; the dialog settles in from a touch
     lower and smaller. Reduced motion gets a fade for both. */
  const panelMotion = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : desktop
      ? {
          initial: { opacity: 0, y: 16, scale: 0.98 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: 8, scale: 0.99 },
        }
      : {
          initial: { y: "100%" },
          animate: { y: 0 },
          exit: { y: "100%" },
        };

  /* PORTALLED TO <body>, AND IT HAS TO BE. The carousel section is `isolate`,
     which makes it a stacking context of its own, so any z-index set inside it
     is capped at the section's level - the fixed header, at z 40 outside it,
     painted over the dialog and its backdrop. At the body the dialog's z sits
     in the same stack as the header's, where it wins. */
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {item && index !== null && (
        <motion.div
          key="highlight-dialog"
          className="fixed inset-0 flex items-end justify-center md:items-center md:p-8"
          style={{ zIndex: Z.lightbox }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
        >
          {/* The backdrop, its own layer so it can fade while the panel slides. */}
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-[rgb(16_18_21/0.55)] backdrop-blur-[3px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="highlight-dialog-title"
            data-lenis-prevent
            drag={desktop || reduce ? false : "y"}
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={onDragEnd}
            {...panelMotion}
            transition={{ duration: reduce ? 0.14 : 0.32, ease: EASE_OUT }}
            className="relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-[22px] bg-surface shadow-[0_-12px_40px_rgb(16_18_21/0.18)] md:max-h-[min(88dvh,640px)] md:max-w-[980px] md:flex-row md:rounded-[22px] md:shadow-[0_24px_80px_rgb(16_18_21/0.28)]"
          >
            {/* Grab handle, the sheet only. A 44px-tall strip so it is a real
                target, with the visible pill centred in it. */}
            <div
              aria-hidden
              onPointerDown={(e) => drag.start(e)}
              className="absolute inset-x-0 top-0 z-10 flex h-7 cursor-grab touch-none justify-center pt-2.5 md:hidden"
            >
              <span className="h-1 w-10 rounded-full bg-white/80 shadow-[0_0_0_1px_rgb(16_18_21/0.08)]" />
            </div>

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={labels.close}
              className="glass absolute top-3 right-3 z-10 grid size-10 place-items-center rounded-full text-ink transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.95] md:top-4 md:right-4"
            >
              <X size={18} weight="regular" />
            </button>

            {/* The picture. A band across the top of the sheet; the left
                column of the dialog, full height. */}
            <div className="relative aspect-[16/10] w-full shrink-0 bg-ink/5 md:aspect-auto md:w-[46%]">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={item.image.src}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                >
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 460px"
                    quality={75}
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* The copy. Scrolls on its own when a phone is too short for it,
                which is what `data-lenis-prevent` on the panel hands back to
                the browser. */}
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
              <div className="flex-1 px-6 pt-6 pb-4 md:px-10 md:pt-14">
                <p className="font-mono text-xs tracking-[0.18em] text-ink-2 tabular-nums">
                  {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </p>
                <h3
                  id="highlight-dialog-title"
                  className="mt-3 text-2xl leading-[1.1] font-medium tracking-tight text-ink md:text-[2rem]"
                >
                  {item.title}
                </h3>

                {/* The grades, as the card prints them: the figures the
                    description below is explaining. */}
                <ul className="mt-5 flex flex-col gap-2">
                  {item.grades.map((g) => (
                    <li
                      key={g}
                      className="border-l-2 border-brand pl-3 text-sm leading-snug font-medium text-ink md:text-base"
                    >
                      {g}
                    </li>
                  ))}
                </ul>

                {item.detail && (
                  <p className="mt-6 border-t border-line pt-6 text-base leading-relaxed text-ink-2">
                    {item.detail}
                  </p>
                )}
              </div>

              {/* Walk the five without closing. */}
              <div className="flex shrink-0 items-center justify-between gap-4 border-t border-line px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-10 md:py-5">
                <div className="flex flex-1 gap-1.5" aria-hidden>
                  {items.map((it, i) => (
                    <span
                      key={it.title}
                      className={`h-px flex-1 transition-colors duration-300 ${
                        i === index ? "bg-ink/80" : "bg-ink/15"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onIndex((index - 1 + count) % count)}
                    aria-label={labels.previous}
                    className="grid size-11 place-items-center rounded-full border border-line text-ink transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.95]"
                  >
                    <CaretLeftIcon size={18} weight="bold" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onIndex((index + 1) % count)}
                    aria-label={labels.next}
                    className="grid size-11 place-items-center rounded-full border border-line text-ink transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.95]"
                  >
                    <CaretRightIcon size={18} weight="bold" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
