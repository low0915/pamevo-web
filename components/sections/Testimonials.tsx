"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { TESTIMONIALS, TESTIMONIALS_ZH, TESTIMONIALS_BM, type Review } from "@/lib/content";
import { useCopy } from "@/lib/locale";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Testimonials, closing the home page: Google reviews on a row of cards that
 * slides sideways, under the section's title.
 *
 * The track is a native horizontal scroller with snap points, so a phone
 * swipes it, a trackpad scrolls it and the keyboard reaches every card. On
 * top of that: arrow buttons that step one card at a time (greyed at either
 * end), and a mouse drag. Cards are equal height, square-cornered (2px), and
 * sized in `vw` up to a cap so the next one is always cut off at the edge,
 * which is what says there is more.
 *
 * In plain flow after the stat band, as tall as its content: it is not a
 * curtain over Stats, which would need it to be at least a screen tall.
 */
export function Testimonials() {
  const copy = useCopy(TESTIMONIALS, { ZH: TESTIMONIALS_ZH, BM: TESTIMONIALS_BM });
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  /** The live mouse drag; null when there is none. */
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);

  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setAtStart(track.scrollLeft <= 2);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 2);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  /** One card's width plus the gap: the step an arrow moves. */
  const step = (direction: 1 | -1) => {
    const track = trackRef.current;
    const card = track?.querySelector("li");
    if (!track || !card) return;
    /* LOOPS: past the last card, next returns to the first; before the first,
       previous jumps to the last. */
    if (direction === 1 && atEnd) {
      track.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (direction === -1 && atStart) {
      track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
      return;
    }
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
  };

  /* Mouse only: touch and pen already scroll the track natively. */
  const onPointerDown = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 4) {
      d.moved = true;
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (d.moved) e.currentTarget.scrollLeft = d.left - dx;
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative bg-bg py-14 md:py-20"
    >
      <div className="px-6 md:px-8 lg:px-10">
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-ink-2 uppercase md:text-sm">
                {copy.eyebrow}
              </p>
              <h2
                id="testimonials-heading"
                className="mt-4 text-[clamp(1.75rem,3.4vw,3rem)] leading-[1.05] font-medium tracking-tighter text-balance text-ink"
              >
                {copy.heading}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {/* The "See all on Google" link is hidden for now (copy.href /
                  copy.googleLink and GoogleG are kept for when the listing
                  link is supplied). */}
              <Arrow label="Previous reviews" onClick={() => step(-1)}>
                <CaretLeftIcon size={18} weight="bold" />
              </Arrow>
              <Arrow label="Next reviews" onClick={() => step(1)}>
                <CaretRightIcon size={18} weight="bold" />
              </Arrow>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.06}>
        {/* The track runs to the screen's edges; the padding keeps the first
            card on the gutter and `scroll-pl` keeps snapped cards there too. */}
        <ul
          ref={trackRef}
          onScroll={update}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          /* A drag that moved is not a click on whatever it ended over. */
          onClickCapture={(e) => {
            if (dragging) e.preventDefault();
          }}
          className={`mt-12 flex scroll-pl-6 gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:mt-14 md:scroll-pl-8 md:gap-5 md:px-8 lg:scroll-pl-10 lg:px-10 [&::-webkit-scrollbar]:hidden ${
            dragging ? "cursor-grabbing select-none" : "cursor-grab snap-x snap-mandatory"
          }`}
        >
          {copy.reviews.map((review, i) => (
            <li
              key={i}
              className="w-[calc(100vw-4.5rem)] shrink-0 snap-start sm:w-[360px] lg:w-[min(30vw,420px)]"
            >
              <Card review={review} />
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

function Card({ review }: { review: Review }) {
  return (
    <figure className="flex h-full flex-col rounded-[2px] border border-line bg-white p-6 md:p-7">
      <div className="flex items-center justify-between gap-3">
        <Stars n={review.stars} />
        <GoogleG />
      </div>
      <blockquote className="mt-5 flex-1">
        <p className="text-base leading-relaxed text-ink">&ldquo;{review.text}&rdquo;</p>
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5 text-sm">
        {/* The reviewer's initial, in place of the Google profile photo. */}
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/10 text-sm font-medium text-[var(--brand)]"
        >
          {review.name.trim().charAt(0).toUpperCase()}
        </span>
        <span className="flex flex-col">
          <span className="font-medium tracking-tight text-ink">{review.name}</span>
          {review.when ? <span className="text-ink-2">{review.when}</span> : null}
        </span>
      </figcaption>
    </figure>
  );
}

function Arrow({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-11 items-center justify-center rounded-full border border-ink/15 bg-white/60 text-ink transition-[background-color,opacity,scale] duration-150 ease-out hover:bg-white active:scale-95 "
    >
      {children}
    </button>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span role="img" aria-label={`${n} out of 5 stars`} className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          width={16}
          height={16}
          aria-hidden
          className={i < n ? "fill-[#FBBC05]" : "fill-ink/15"}
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </span>
  );
}

/** Google's "G", in its own colours: the attribution for every review. */
function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} aria-label="Google" role="img" className="shrink-0">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.7-4.9h-4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.4a7.2 7.2 0 0 1 0-4.7V6.6h-4a12 12 0 0 0 0 10.9z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
  );
}
