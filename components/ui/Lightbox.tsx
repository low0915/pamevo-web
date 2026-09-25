"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react/dist/ssr";
import { Z } from "@/lib/z";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export type LightboxImage = {
  src: string;
  alt: string;
  label?: string;
  width: number;
  height: number;
};

/**
 * Room kept clear at the top for the fixed header (top-4 over h-16), and the
 * same again at the foot for the caption under the picture.
 *
 * THE TWO ARE EQUAL BECAUSE THE PICTURE IS CENTRED, and that is the whole
 * reason this is one constant rather than two. A centred box divides its
 * leftover space evenly, so the only way to hold the picture clear of the
 * header is to reserve the header's own band at BOTH ends: reserve it only at
 * the top and centring hands half of it straight back, putting the picture
 * under the header again.
 *
 * It was `items-end` with this reserved at the top alone, which kept the
 * picture clear but pushed it against the foot of the screen and stacked every
 * spare pixel above it. On a phone showing a wide landscape shot that measured
 * 605px of empty space over the picture and 56 under it.
 *
 * The cost is the picture is sized against `100dvh - 2 * HEADROOM` rather than
 * one, so a tall photograph is smaller than it used to be. That is the trade
 * being made on purpose: the old arrangement bought its extra height by
 * spending the space asymmetrically, which is what made it look wrong.
 */
const HEADROOM = "10rem";

/**
 * A single photograph held over the page.
 *
 * The whole screen is the dismiss target: the backdrop is one full-bleed layer
 * with the close handler on it, and only the picture stops the click from
 * reaching it, so anywhere that is not the picture itself closes. That is why
 * the frame is sized from the photograph's own proportions rather than given a
 * fixed box to sit inside: a letterboxed box would swallow the clicks either
 * side of a tall photograph, which is exactly the empty space people aim at.
 * The close button repeats the gesture at the top right for anyone who would
 * not think to try the empty space, and Escape does the same from the keyboard.
 *
 * The picture is centred on the screen, with the header's band reserved above
 * it and matched below so that centring cannot give the top half back — see
 * the note on HEADROOM. The two never share the same pixels.
 *
 * Focus moves to the close button on open and returns to whatever opened the
 * lightbox on close, so a keyboard never lands behind the overlay.
 */
export function Lightbox({
  image,
  onClose,
}: {
  image: LightboxImage | null;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!image) return;

    openerRef.current = document.activeElement;
    closeRef.current?.focus();

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      const opener = openerRef.current;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [image, onClose]);

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-[rgb(16_18_21/0.9)] px-4 backdrop-blur-[3px] md:px-10"
          /* Both ends reserved, and the picture centred in what is left — see
             the note on HEADROOM for why the two have to match. The vertical
             padding is inline rather than a `py` class because it is the same
             constant the height below is computed from, and the two must not
             be able to drift apart. */
          style={{
            zIndex: Z.lightbox,
            paddingTop: HEADROOM,
            paddingBottom: HEADROOM,
          }}
          role="dialog"
          aria-modal="true"
          aria-label={image.label ?? image.alt}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: EASE_OUT }}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close image"
            className="absolute top-4 right-4 grid size-11 place-items-center rounded-full border border-[rgb(244_245_246/0.3)] bg-[rgb(244_245_246/0.12)] text-bg backdrop-blur-[2px] transition-transform duration-[160ms] ease-[var(--ease-out)] hover:scale-[1.04] active:scale-[0.97] md:top-6 md:right-6"
          >
            <X size={18} weight="regular" />
          </button>

          <motion.figure
            className="flex max-h-full min-h-0 flex-col items-center"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.24, ease: EASE_OUT }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(max-width: 768px) 92vw, 80vw"
              /* Was `priority`, deprecated as of Next 16. A modal image is
                 never above the fold at load; eager is what this always meant. */
              loading="eager"
              // The one place a click does not dismiss. It sits on the picture
              // rather than on the figure so the caption and the space beside a
              // tall photograph still belong to the backdrop.
              onClick={(event) => event.stopPropagation()}
              className="h-auto max-h-full w-auto max-w-full min-h-0 rounded-[14px] object-contain"
              /* Both reservations subtracted, not one: the picture sits inside
                 a box that is now padded at both ends, and subtracting a single
                 HEADROOM would let a tall photograph overflow it by the other.
                 The caption is laid out under the picture inside this box, so
                 the foot of the reservation covers it. */
              style={{ maxHeight: `calc(100dvh - ${HEADROOM} * 2)` }}
            />

            {image.label && (
              <figcaption className="mt-4 shrink-0 font-mono text-xs tracking-[0.18em] text-[rgb(244_245_246/0.62)] uppercase">
                {image.label}
              </figcaption>
            )}
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
