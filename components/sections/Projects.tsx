"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { PROJECTS } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";

/** Copies of the set laid end to end. Three is enough that the run is always
 *  wider than the viewport plus a card, which is what lets every card wrap
 *  round the far side without a seam ever reaching the frame. */
const COPIES = 3;

/** Gap between cards, as a fraction of one card. Held as a ratio rather than a
 *  length so the step is measurable from the card alone - a CSS custom property
 *  hands back the token it was written as, not the pixels it resolved to. */
const GAP_RATIO = 0.05;

/** Momentum after the pointer lets go: what fraction of the speed survives each
 *  frame, and the speed below which the strip is treated as stopped. */
const FRICTION = 0.94;
const MIN_SPEED = 0.05;

/** One arrow key throw. Decays to roughly one card at the friction above. */
const KEY_THROW = 18;

/** How deep the valley runs at a given width: about 3.5% of it, floored so the
 *  curve is still legible on a phone and capped so it does not turn into a
 *  fault line on a wide monitor. */
function valleyDepth(width: number) {
  return Math.min(Math.max(width * 0.035, 20), 64);
}

/**
 * Our Projects, as a centred title over a looping concave strip.
 *
 * The strip is an endless run of cards that the pointer drags left or right.
 * Position is one number - `offset` - and every card is placed at
 * `index * step + offset` wrapped into the length of the run, so a card leaving
 * one edge is the same element arriving at the other. There is no clone to keep
 * in sync and no seam to hide: the set is repeated three times only so the run
 * outmeasures the viewport, and the copies past the first are hidden from
 * assistive tech since they are the same six photographs again.
 *
 * Cards stay upright and ride the curve vertically: each one sinks by
 * `depth * (1 - u^2)`, where `u` is how far it sits from the middle of the
 * frame, so the middle of the strip is the floor of the valley and the ends
 * rise to meet the edges. Because the drop is computed from live position
 * rather than from the card's index, the cards travel along the curve as they
 * are dragged instead of sliding along a fixed set of offsets.
 *
 * Dragging is direct: the strip tracks the pointer exactly, then carries the
 * speed it was released at into a decaying glide. Arrow keys throw it by about
 * a card, and a trackpad's horizontal swipe drives it too.
 */
export function Projects() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLLIElement | null)[]>([]);
  const offsetRef = useRef(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const cards = cardsRef.current.filter(
      (card): card is HTMLLIElement => card !== null,
    );
    if (cards.length === 0) return;

    let width = 0;
    let step = 0;
    let run = 0;
    let depth = 0;
    let speed = 0;
    let frame = 0;
    let dragging = false;
    let lastX = 0;
    let placed = false;

    const draw = () => {
      const half = width / 2;

      for (let i = 0; i < cards.length; i++) {
        const raw = i * step + offsetRef.current;
        // Wrapped into the run, then pulled back by one card, so there is
        // always a card covering the left edge on its way in.
        const x = (((raw % run) + run) % run) - step;
        const fromCentre = Math.min(
          Math.max((x + step / 2 - half) / half, -1),
          1,
        );
        const y = depth * (1 - fromCentre * fromCentre);

        cards[i].style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    };

    const measure = () => {
      width = viewport.clientWidth;
      const cardWidth = cards[0].offsetWidth;
      step = cardWidth * (1 + GAP_RATIO);
      run = cards.length * step;
      depth = valleyDepth(width);
      // First measure only: park the run so the first photograph sits flush
      // with the left edge and the last one waits just outside it.
      if (!placed) {
        offsetRef.current = step;
        placed = true;
      }
      // The frame is one card tall plus the depth the middle sinks by.
      viewport.style.height = `${Math.round((cardWidth * 4) / 3 + depth)}px`;
      draw();
    };

    const glide = () => {
      offsetRef.current += speed;
      speed *= FRICTION;
      draw();
      frame =
        Math.abs(speed) > MIN_SPEED ? requestAnimationFrame(glide) : 0;
    };

    const throwStrip = (from: number) => {
      speed = from;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(glide);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      dragging = true;
      speed = 0;
      cancelAnimationFrame(frame);
      lastX = event.clientX;
      viewport.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - lastX;
      lastX = event.clientX;
      offsetRef.current += dx;
      // The last frame's travel is the speed the glide starts from.
      speed = dx;
      draw();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (viewport.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
      }
      if (Math.abs(speed) > MIN_SPEED) throwStrip(speed);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") throwStrip(KEY_THROW);
      else if (event.key === "ArrowRight") throwStrip(-KEY_THROW);
      else return;
      event.preventDefault();
    };

    // A trackpad's sideways swipe drives the strip; a vertical one is left to
    // the page, which is still scrolling underneath.
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      cancelAnimationFrame(frame);
      speed = 0;
      offsetRef.current -= event.deltaX;
      draw();
    };

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerUp);
    viewport.addEventListener("keydown", onKeyDown);
    viewport.addEventListener("wheel", onWheel, { passive: false });
    // Measured off the window rather than the frame: the card is sized in vw,
    // and watching the frame would mean re-measuring the height this very
    // function just set on it.
    window.addEventListener("resize", measure);

    measure();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("pointercancel", onPointerUp);
      viewport.removeEventListener("keydown", onKeyDown);
      viewport.removeEventListener("wheel", onWheel);
    };
  }, []);

  const set = PROJECTS.images;
  const cards = Array.from({ length: COPIES }, () => set).flat();

  return (
    <section className="sheet svc-curtain svc-curtain-floor relative mb-[4em] flex flex-col justify-center bg-bg py-24 md:py-36">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8 lg:px-12">
        <Reveal>
          <h2 className="text-center text-4xl leading-[1.1] font-medium tracking-tighter text-ink md:text-5xl lg:text-6xl">
            {PROJECTS.heading}
          </h2>
        </Reveal>
      </div>

      <Reveal delay={0.08} className="mt-12 md:mt-16 lg:mt-20">
        <div
          ref={viewportRef}
          role="group"
          aria-roledescription="carousel"
          aria-label={PROJECTS.heading}
          tabIndex={0}
          className="relative w-full cursor-grab touch-pan-y overflow-hidden select-none [--card:64vw] focus-visible:outline-none active:cursor-grabbing sm:[--card:40vw] lg:[--card:clamp(190px,15.2vw,300px)]"
        >
          <ul role="list" className="contents">
            {cards.map((image, i) => (
              <li
                key={`${image.src}-${i}`}
                ref={(node) => {
                  cardsRef.current[i] = node;
                }}
                aria-hidden={i >= set.length}
                className="absolute top-0 left-0 w-[var(--card)] will-change-transform"
              >
                <figure className="photo-card relative aspect-[3/4] overflow-hidden rounded-[18px] border border-[rgb(126_133_140/0.25)] bg-surface-2">
                  <Image
                    src={image.src}
                    alt={i < set.length ? image.alt : ""}
                    fill
                    draggable={false}
                    sizes="(max-width: 640px) 64vw, (max-width: 1024px) 40vw, 17vw"
                    className="graded pointer-events-none object-cover transition-[filter] duration-500 ease-[var(--ease-out)]"
                  />

                  <figcaption className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-[rgb(16_18_21/0.82)] px-2.5 py-1 font-mono text-[11px] tracking-tight text-bg backdrop-blur-[2px]">
                    {image.label}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
