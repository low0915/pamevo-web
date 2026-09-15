"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PROJECTS, PROJECTS_ZH, PROJECTS_BM } from "@/lib/content";
import { useCopy } from "@/lib/locale";
import { Reveal } from "@/components/ui/Reveal";
import { Lightbox } from "@/components/ui/Lightbox";

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

/** How much of a card hangs past each edge of the frame at rest. The run is
 *  parked a third of a card to the left of flush, so the outermost photographs
 *  are cut by the frame rather than sitting inside it: the strip reads as a
 *  run that carries on past both edges, which is what it is. */
const EDGE_PEEK = 0.34;

/** The `md` breakpoint in px, matching Tailwind's own 48rem. Below it the run
 *  is parked centred on the first card rather than running off both edges. */
const MD = 768;

/** How far the pointer may travel and still count as a tap rather than a drag.
 *  Measured as total travel, not net, so a drag that returns to where it began
 *  does not open a photograph on the way back. */
const TAP_SLOP = 6;

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
 *
 * Whichever card is nearest the middle carries `data-centred`, and globals.css
 * grades that one in colour where the rest are near-monochrome. It is the same
 * grade hover gives, and for the same reason - the card being looked at is in
 * colour - except that the middle of the frame is something a phone has too,
 * where hover is not.
 */
/**
 * NOTE: `standalone` NO LONGER HAS A CALLER.
 *
 * It existed for /our-projects, which rendered this strip as a page of its own
 * — the flag promoted the heading to `h1` and dropped the curtain margin that
 * pulls the section over the band above it on the home page. That page now
 * opens on `PageBanner` and shows every photograph in the catalogue as a
 * masonry wall instead; see components/pages/ProjectsBody.tsx and
 * components/sections/ProjectGallery.tsx for why a page someone navigated to
 * shows all 23 rather than six behind a drag gesture.
 *
 * The two remaining callers — HomeBody and the /preview-projects screenshot
 * harness — both render this bare, so the flag is always false. It is kept
 * rather than deleted because it is the whole of what makes this section
 * page-ready, and removing it would have to be put back verbatim the next time
 * a strip wants a page. Delete it if that has not happened in a while.
 */
export function Projects({ standalone = false }: { standalone?: boolean }) {
  /* See the note on Background: JSX reads a lowercase tag name as a literal
     element and an uppercase one as a component, so the case is doing work. */
  const Heading = standalone ? "h1" : "h2";
  const projects = useCopy(PROJECTS, { ZH: PROJECTS_ZH, BM: PROJECTS_BM });
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLLIElement | null)[]>([]);
  const offsetRef = useRef(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeLightbox = useCallback(() => setOpenIndex(null), []);

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
    let travelled = 0;
    let placed = false;
    /** Which card currently carries `data-centred`. -1 before the first draw. */
    let centred = -1;

    const draw = () => {
      const half = width / 2;
      let nearest = 0;
      let nearestDistance = Infinity;

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

        // The card in the middle of the frame is the one the strip is
        // "showing", and it is graded in colour rather than in the site's
        // near-monochrome. `fromCentre` is already the number that says so -
        // it is what the valley is computed from - so this costs a comparison
        // rather than a second pass or any measuring of its own.
        const distance = Math.abs(fromCentre);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = i;
        }
      }

      // Written only when it changes. `draw` runs every frame of every drag and
      // every glide, and touching the DOM on each of them - for an attribute
      // that is the same as it was - would put a style recalc in the middle of
      // a gesture that is otherwise pure transforms.
      if (nearest !== centred) {
        if (centred !== -1) cards[centred].removeAttribute("data-centred");
        cards[nearest].setAttribute("data-centred", "");
        centred = nearest;
      }
    };

    const measure = () => {
      width = viewport.clientWidth;
      const cardWidth = cards[0].offsetWidth;
      step = cardWidth * (1 + GAP_RATIO);
      run = cards.length * step;
      depth = valleyDepth(width);
      // First measure only. Below `md` the strip opens with the first
      // photograph centred in the frame instead of cut by its left edge: a
      // phone has no width for a run to read as a run, so it reads as one
      // card with its neighbours just showing at either side. Card 0 is drawn
      // at `(offset mod run) - step`, so centring it is one step past the
      // middle. Wider, the run is parked a third of a card short of flush and
      // runs off both edges, which is what it is.
      if (!placed) {
        offsetRef.current =
          window.innerWidth < MD
            ? step + (width - cardWidth) / 2
            : step * (1 - EDGE_PEEK);
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
      travelled = 0;
      speed = 0;
      cancelAnimationFrame(frame);
      lastX = event.clientX;
      viewport.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - lastX;
      lastX = event.clientX;
      travelled += Math.abs(dx);
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

      // A tap opens the photograph under the pointer. The card is found by
      // hit-testing rather than by a handler on the card itself: the pointer
      // is captured by the frame for the length of the gesture, so the click
      // that follows is retargeted to the frame and never reaches the card.
      if (travelled <= TAP_SLOP && event.type === "pointerup") {
        const hit = document
          .elementFromPoint(event.clientX, event.clientY)
          ?.closest<HTMLElement>("[data-photo]");
        if (hit) {
          setOpenIndex(Number(hit.dataset.photo));
          return;
        }
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

  const set = projects.images;
  const cards = Array.from({ length: COPIES }, () => set).flat();

  return (
    <section
      // The phone curtain here is cut to 80dvh (globals.css) so this section
      // is sized by its own content rather than by a floor it cannot fill.
      // That is what makes the padding below mean anything: under a binding
      // floor, `justify-center` hands back every pixel trimmed off `py` as
      // slack, and the section measures the same whatever it is set to. The
      // bottom margin goes too - nothing rides over this section, so the 4em
      // was gap for its own sake, sitting directly on the footer's border.
      // The curtain classes are the home page's arrangement — a pull-up over
      // the section above and a floor tall enough to cover what it is pulled
      // over. On /our-projects there is nothing above it, and a 110svh floor on
      // a page this short would leave a screen of empty ground under it.
      className={`relative mb-[4em] flex flex-col justify-center bg-bg py-24 max-md:mb-0 max-md:py-14 md:py-36 ${
        standalone ? "max-md:pt-28" : "sheet svc-curtain svc-curtain-floor"
      }`}
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-8 lg:px-10">
        <Reveal>
          <Heading className="text-center text-4xl leading-[1.1] font-medium tracking-tighter text-ink md:text-5xl lg:text-6xl">
            {projects.heading}
          </Heading>
        </Reveal>

        <Reveal delay={0.06}>
          <p className="mx-auto mt-6 text-center text-base leading-relaxed text-ink-2 md:whitespace-nowrap">
            {projects.blurb}
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.12} className="mt-6 md:mt-8">
        <div
          ref={viewportRef}
          role="group"
          aria-roledescription="carousel"
          aria-label={projects.heading}
          tabIndex={0}
          className="relative w-full cursor-grab touch-pan-y overflow-hidden select-none [--card:64vw] focus-visible:outline-none active:cursor-grabbing sm:[--card:58vw] lg:[--card:clamp(280px,23vw,460px)]"
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
                <button
                  type="button"
                  data-photo={i % set.length}
                  // Keyboard only: a pointer tap is handled by the frame, which
                  // owns the gesture and has already told a drag from a click.
                  onClick={() => setOpenIndex(i % set.length)}
                  tabIndex={i >= set.length ? -1 : 0}
                  aria-label={projects.openLabel(image.label)}
                  className="block w-full cursor-zoom-in text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                >
                <figure className="photo-card relative aspect-[3/4] overflow-hidden rounded-[18px] border border-[rgb(126_133_140/0.25)] bg-surface-2">
                  <Image
                    src={image.src}
                    alt={i < set.length ? image.alt : ""}
                    fill
                    draggable={false}
                    sizes="(max-width: 640px) 64vw, (max-width: 1024px) 58vw, 25vw"
                    className="graded pointer-events-none object-cover transition-[filter] duration-500 ease-[var(--ease-out)]"
                  />

                  {/* NO `backdrop-blur` HERE, AND IT IS NOT AN OVERSIGHT.

                      This carried `backdrop-blur-[2px]`, which rendered
                      nothing: the pill's own ground is `rgb(16 18 21 / 0.82)`,
                      opaque enough that there is no photograph showing through
                      for a blur to act on. Screenshotted with the filter and
                      with it forced off, the same crop came back byte for byte
                      identical.

                      What it did cost was real. `backdrop-filter` promotes the
                      element to its own compositor layer and re-rasterises what
                      is behind it every frame REGARDLESS of whether the element
                      is on screen - and this caption is inside a carousel that
                      renders COPIES sets of cards for its infinite loop, so the
                      page carried eighteen of these, of which all but two or
                      three are off-screen at any moment. On a 6x-throttled
                      phone that was the largest single contributor to the
                      style-recalculation cost of scrolling the home page.

                      If a translucent pill is ever wanted here, the tint has to
                      come down first - and then the blur is worth paying for
                      because it would actually be visible. */}
                  <figcaption className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-[rgb(16_18_21/0.82)] px-2.5 py-1 font-mono text-xs tracking-tight text-bg">
                    {image.label}
                  </figcaption>
                </figure>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal delay={0.16} className="mt-12 md:mt-16">
        <div className="mx-auto flex w-full max-w-[1440px] justify-center px-6 md:px-8 lg:px-10">
          <Link
            href={projects.cta.href}
            className="inline-flex items-center rounded-full bg-ink px-7 py-3.5 text-base font-medium tracking-tight text-bg transition-transform duration-[160ms] ease-[var(--ease-out)] hover:-translate-y-0.5 active:translate-y-0"
          >
            {projects.cta.label}
          </Link>
        </div>
      </Reveal>

      <Lightbox
        image={openIndex === null ? null : set[openIndex]}
        onClose={closeLightbox}
      />
    </section>
  );
}
