"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import Image from "next/image";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { WHY_CHOOSE, WHY_CHOOSE_ZH, WHY_CHOOSE_BM } from "@/lib/content";
import { USP_PART } from "@/components/sections/CoreUspsPanel";
import { useCopy } from "@/lib/locale";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The index of the engineering part inside WHY_CHOOSE.parts.
 *
 * Counted off USP_PART rather than written as a literal `2`, the same way
 * WhyChoose derives its own FIRST. The three sections that read this array all
 * count from the one constant, so inserting a part into the content file moves
 * every one of them together instead of silently handing this section the ten
 * USPs.
 */
const ENGINEERING_PART = USP_PART + 1;


/**
 * A picture for each of the six figures, in the order the content lists them.
 *
 * PARALLEL BY INDEX, WHICH IS THE RISK AND THE REASON. `items[i]` is captioned
 * by `SLIDES[i]`, so the two lists have to stay the same length and the same
 * order — reorder the content and the wind figure gets the rain photograph.
 * That is checked at the top of the component rather than left to be noticed on
 * the page, because the failure is silent: six slides still render, each with
 * the wrong picture.
 *
 * The alternative was putting the filenames in `lib/content.ts` beside the
 * copy, which is where they would belong if these were product photographs. The
 * six are not: they are mood, chosen for this layout and meaningless without
 * it, and `content.ts` is translated into three languages by people who should
 * not have to carry a `src` through a translation. So they live here, next to
 * the layout that uses them.
 *
 * The alt text is written per slide rather than derived from the figure, since
 * "Wind Resistance Level 9 (>=5000 Pa)" describes the CLAIM and not the
 * PICTURE. A screen reader gets the figure from the caption underneath; what it
 * needs from the image is what the image shows.
 */
const SLIDES = [
  {
    src: "/engineering/wind.jpg",
    alt: "Towering storm clouds building against a deep blue sky",
  },
  {
    src: "/engineering/air.jpg",
    alt: "Close-up of wind-driven ripples crossing dark open water",
  },
  {
    src: "/engineering/water.jpg",
    alt: "Rain running down a pane of glass, city traffic blurred behind it",
  },
  {
    src: "/engineering/thermal.jpg",
    alt: "Glazed office towers at dusk seen from above, their windows lit",
  },
  {
    src: "/engineering/acoustic.jpg",
    alt: "A quiet, softly lit living room beside a large glazed door",
  },
  {
    src: "/engineering/hardware.jpg",
    alt: "Corner of a MEVO aluminium profile, showing the machined chambers of the section",
  },
];

/** The index of the hardware figure, which is the one the note belongs under. */
const LAST = SLIDES.length - 1;

/**
 * How many times the six are laid end to end in the DOM.
 *
 * THREE, BECAUSE A LOOP NEEDS SOMETHING ON BOTH SIDES. One set has nothing
 * after the last card, which is the blank the track used to end in. Two sets
 * fix the forward direction and leave the backward one dead, since the viewer
 * starts at the first card of the first set with nothing to its left. Three
 * puts a full set either side of the middle one, so the strip has more of
 * itself in both directions at every moment, and `recentre` below moves the
 * scroller back to the middle set whenever it wanders out of it.
 */
const SETS = 3;

/** The index of the slide whose left edge is nearest the track's own. */
function nearestSlide(
  track: HTMLElement,
  slides: (HTMLElement | null)[],
): number {
  /* Measured against the track's CONTENT edge, not its border box: the gutter
     means a card at rest sits one padding-width in, and comparing against the
     border box would score it as a padding-width away from home and pick its
     neighbour. */
  const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
  const base = track.getBoundingClientRect().left + pad;
  let nearest = 0;
  let best = Infinity;
  slides.forEach((el, i) => {
    if (!el) return;
    const d = Math.abs(el.getBoundingClientRect().left - base);
    if (d < best) {
      best = d;
      nearest = i;
    }
  });
  return nearest;
}

/**
 * 6 Engineering Performance Highlights, as a carousel over its own blurred still.
 *
 * THE BACKGROUND IS THE CURRENT SLIDE, BLURRED PAST LEGIBILITY. That is the
 * whole visual idea: the band takes its colour from whatever is on screen, so
 * moving through the six repaints the section rather than sliding cards across
 * a fixed ground. It is one `<Image>` per slide, cross-faded on opacity, not a
 * CSS `filter: blur()` on a live element — blur on a compositing layer that is
 * also animating is the expensive combination, and this way each backdrop is
 * painted once and only its opacity moves.
 *
 * THE BLUR IS 14px AND THE SCRIM IS WHITE, and the two were tuned together.
 * At 64px over a heavy black scrim the backdrop was a flat wash — technically
 * the slide's colour, but with no trace of the picture in it, so moving through
 * the six barely changed the band. Each softening of the blur puts more of the
 * photograph back; at 14px the shape of the image is plainly readable behind
 * the cards.
 *
 * What that spends is contrast headroom, and it is spent in the other
 * direction now: the band is LIGHT, the wash is `--surface`, and the type is
 * `--ink` rather than white. The figure still sits under its card rather than
 * over the backdrop, which is what keeps a caption with units in it off a
 * photograph that is now only lightly veiled.
 *
 * THE BLUR IS `scale-110`, AND IT HAS TO BE. `blur()` samples beyond the
 * element's own box, so the edges of a blurred image fade toward transparent
 * and leave a pale halo against the section. Scaling the layer up pushes that
 * bleed outside the frame. This is the same fix any full-bleed blurred backdrop
 * needs and it is invisible until it is missing.
 *
 * LAYOUT, PER THE BRIEF: the title sits top left, the track below it and pushed
 * right, so the two make a diagonal rather than a stack. The offset is real
 * space at `lg` (`lg:ml-[18%]`) and nothing at all below it — on a phone there
 * is no width to give away, and an indented track would just be a narrower
 * card.
 *
 * THE INDENT IS 18%, DOWN FROM 38%. At the larger figure the offset stopped
 * reading as a deliberate step and started reading as a hole: better than a
 * third of the band was empty ground to the left of the first card, and the
 * eye crossed it looking for something that was not there. 18% still breaks
 * the title's left edge — which is the whole point of the diagonal — while the
 * cards claim the width back.
 *
 * THE CARD IS IMAGE AND FIGURE, NOTHING ELSE. `parts[2]` carries a `note` about
 * the German hardware brands and it is deliberately not printed here: the brief
 * is a picture and a point per card, and the note is a sentence about three
 * suppliers that belongs with the full list rather than on one slide of six.
 * WhyChoose still prints it, so nothing is lost from the page.
 */
export function EngineeringCarousel() {
  const whyChoose = useCopy(WHY_CHOOSE, {
    ZH: WHY_CHOOSE_ZH,
    BM: WHY_CHOOSE_BM,
  });
  const part = whyChoose.parts[ENGINEERING_PART];

  /* SLIDES is written against the English list, and the copy is translated in
     three files. If a language ever disagrees about the count, `items[i]` and
     `SLIDES[i]` stop describing the same figure — so fall back to the list the
     table was written against rather than captioning the wrong photograph. */
  const items =
    part.items.length === SLIDES.length
      ? part.items
      : WHY_CHOOSE.parts[ENGINEERING_PART].items;

  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLUListElement>(null);
  const slideRefs = useRef<(HTMLLIElement | null)[]>([]);
  /* Where the ARROWS think we are, in strip coordinates (0..SETS*6-1).
     Distinct from `active`, which is what the rail shows: this one counts
     which copy, because that is what the next step has to be measured from. */
  const pos = useRef(SLIDES.length);
  /* The live drag. `null` when nothing is being dragged, so the handlers can
     tell "not dragging" from "dragging, but not moved yet". */
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  /* Mirrors the drag into React only to swap the cursor and kill snapping —
     the scrolling itself never round-trips through state. */
  const [dragging, setDragging] = useState(false);

  /**
   * Scroll so that strip-index `i` sits at the track's start edge, wrapping the
   * index back into the middle set as it goes.
   *
   * ONE FUNCTION OWNS THE POSITION, AND THAT IS THE FIX. The version before this
   * split the job three ways — a `go` that stepped, a `recentre` that teleported
   * a whole set sideways, and a scroll listener that resynced the index — and
   * the three raced each other. `recentre` fired between presses and moved the
   * index the next press measured from; the listener overwrote that index from
   * a half-finished animation; `snap-mandatory` then dragged the result to
   * whichever snap point was nearest. Traced over eight presses the track went
   * 7, 9, 13, 9, 13 — advancing two cards, then four, then oscillating between
   * the same pair forever.
   *
   * With a single writer there is nothing to race: the index moves, the scroller
   * follows it, and the wrap is arithmetic rather than a second scroll chasing
   * the first.
   */
  const scrollToIndex = useCallback((i: number, smooth: boolean) => {
    const track = trackRef.current;
    if (!track) return;

    /* Wrap into the MIDDLE set. All three sets hold the same six pictures, so
       an index and its counterpart one set away land on the same card — which
       is what lets the loop run forever without the strip running out. Written
       as `((x % n) + n) % n` because JS keeps the sign of the dividend: a plain
       `-1 % 6` is `-1`, and stepping back off the first card would index
       nothing. */
    const within = (((i - SLIDES.length) % SLIDES.length) + SLIDES.length) % SLIDES.length;
    const wrapped = SLIDES.length + within;

    const el = slideRefs.current[wrapped];
    if (!el) return;

    pos.current = wrapped;
    setActive(within);

    /* THE GUTTER LIVES IN THIS SUM. Scrolling to `offsetLeft - track.offsetLeft`
       lands the card on the scroller's content origin — which is INSIDE the
       left padding, so a `pl-6` pads only the initial scroll position and the
       card at rest still sits hard against the screen edge. On a phone that
       read as the carousel bleeding off the side with no margin at all.
       Subtracting the padding back out leaves the card standing on the same
       24px line as the heading above it. */
    const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;

    /* `track.scrollTo`, NOT `el.scrollIntoView`. `scrollIntoView` scrolls every
       ancestor that can scroll until the element is in view — including the
       document — and the whole PAGE slid sideways with the card: the heading ran
       off the left edge and the fixed header went with it. */
    track.scrollTo({
      left: el.offsetLeft - track.offsetLeft - pad,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  /**
   * Step one card.
   *
   * RELATIVE, NOT ABSOLUTE, AND THAT IS WHAT MAKES IT A LOOP. The first version
   * wrapped an index into a single set of six and scrolled to that card. The
   * arrows looped but the track did not: past card six there was nothing to the
   * right, so the strip ended in blank ground and "forward" from the last card
   * scrolled backwards to the first. With three sets rendered, forward is
   * simply the next card along.
   */
  const go = useCallback(
    (delta: number) => scrollToIndex(pos.current + delta, true),
    [scrollToIndex],
  );

  /* Open on the first card of the middle set, so there is a full set of strip
     to travel through in either direction before any wrap is needed. Not
     smooth: this is the starting position, not a movement. */
  useEffect(() => {
    scrollToIndex(SLIDES.length, false);
  }, [scrollToIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    /* The rail follows the scroller so a SWIPE lights the right segment — the
       arrows set `active` themselves, but a finger never goes through them.
       Reported modulo the count, since the three copies of card three are all
       card three.

       It deliberately does not write `pos`. Doing that from a scroll event
       means reading a position that may be half-way through an animation, which
       is exactly what made consecutive presses compound. */
    const onScroll = () => {
      setActive(nearestSlide(track, slideRefs.current) % SLIDES.length);
    };

    /* After a SWIPE the scroller is somewhere the arrows did not put it, so the
       next press has to start from there.

       THE GUARD IS NOT OPTIONAL. An arrow-driven scroll also ends here, and it
       ends on the card `pos` already names — but a wrap has meanwhile teleported
       the strip, so `nearestSlide` reports the counterpart index one set away.
       Adopting that unconditionally walked `pos` a set forward on every press
       and the track alternated between two cards forever (traced: 7, 9, 7, 9).
       Comparing MODULO the count asks the only question that matters — is the
       viewer on a different one of the six? — and a wrap, which lands on the
       same one of the six by construction, is correctly ignored. */
    const onScrollEnd = () => {
      const here = nearestSlide(track, slideRefs.current);
      if (here % SLIDES.length !== pos.current % SLIDES.length) {
        pos.current = here;
      }
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    track.addEventListener("scrollend", onScrollEnd, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("scrollend", onScrollEnd);
    };
  }, []);


  /**
   * MOUSE DRAG. Touch already worked and this is only for pointers that do not.
   *
   * The track is a native overflow scroller, so a finger has always been able
   * to fling it — that is the browser's own touch scrolling, momentum and all,
   * and none of this code runs for it. A MOUSE gets nothing: browsers give
   * desktop pointers a scrollbar and a wheel, not a grab. So these handlers
   * exist to add the one interaction that was missing, and they are scoped to
   * it — `pointerType === "touch"` returns immediately rather than layering a
   * second, worse scroll implementation on top of the one that already works.
   *
   * SNAPPING IS TURNED OFF WHILE DRAGGING, which is the detail that makes it
   * feel like dragging rather than fighting. With `snap-mandatory` live, every
   * `scrollLeft` written mid-gesture is immediately dragged back to the nearest
   * snap point, so the card sticks, jerks, and refuses to sit between two
   * positions. Released, snapping comes back and the track settles onto a card
   * on its own — which is exactly the behaviour wanted at the end of a throw.
   */
  const onPointerDown = (e: PointerEvent<HTMLUListElement>) => {
    const track = trackRef.current;
    if (!track || e.pointerType === "touch") return;
    /* Ignore anything but the primary button: a right-click opening the context
       menu must not leave the track stuck in a drag. */
    if (e.button !== 0) return;

    /* THE NATIVE IMAGE DRAG IS WHAT WAS BREAKING THIS, and it is why the
       feature worked under synthetic events and failed under a real mouse.
       Every card is an `<img>`, and pressing on an image starts the browser's
       own HTML5 drag-and-drop: it takes over the gesture, fires `pointercancel`
       at us, and the listeners below tear themselves down on the first
       movement. Synthetic `PointerEvent`s never trigger it — they are
       untrusted, so drag-and-drop ignores them — which is exactly why an
       in-page test passed while the real thing did nothing.

       `preventDefault` here stops that before it begins; `draggable={false}` on
       the images and `onDragStart` below close the same hole from the other
       side, because the native drag can also be initiated from a press the
       track never sees. */
    e.preventDefault();

    drag.current = { x: e.clientX, left: track.scrollLeft, moved: false };
    setDragging(true);

    /* SNAP OFF NOW, ON THE ELEMENT, NOT VIA THE CLASS. `snap-mandatory` does
       not merely influence where a scroll settles — it REVERTS a written
       `scrollLeft` outright: measured, assigning `scrollLeft + 300` left the
       value unchanged at 4118, while the same write with snapping off landed at
       4418. So the drag could not move the track at all.

       The conditional class below turns snapping off too, and on its own it is
       too late: `setDragging` is asynchronous, so the first few `pointermove`s
       run against the old, still-snapping style and are silently thrown away.
       Writing the style here takes effect on this line. The class stays for the
       cursor and to keep the rendered markup honest about the state. */
    track.style.scrollSnapType = "none";

    /* THE MOVE AND UP LISTENERS GO ON THE WINDOW, NOT ON THE TRACK.
       `setPointerCapture` on the track is the tidier-looking option and it does
       not work here: capture retargets subsequent pointer events to the
       captured element, and inside a scroller that is competing with the
       browser's own panning — measured, exactly ONE `pointermove` arrived and
       the scroll never followed the cursor. The window sees every move
       regardless of what the pointer is over, which is also what makes a drag
       that runs off the edge of the track keep working instead of freezing
       half-way. */
    const onMove = (ev: globalThis.PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = ev.clientX - d.x;
      /* A few pixels of slop before it counts as a drag. Without it the tiny
         movement inside an ordinary click registers as one and swallows the
         click — see `onClickCapture` below. */
      if (!d.moved && Math.abs(dx) > 4) d.moved = true;
      track.scrollLeft = d.left - dx;
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (!drag.current) return;
      drag.current = null;
      setDragging(false);
      /* Snapping back on, and the track settles onto a card by itself — which
         is exactly the behaviour wanted at the end of a throw. Cleared rather
         than set, so the class is what decides it from here. */
      track.style.scrollSnapType = "";
      /* Resync the arrows to whatever card the drag left us on, so the next
         press steps from there rather than from where the arrows last put us. */
      pos.current = nearestSlide(track, slideRefs.current);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  /* A drag that ends on top of a card would otherwise fire that card's click.
     Captured on the way down and swallowed — but only when the pointer actually
     travelled, so a plain click still works. */
  const onClickCapture = (e: MouseEvent) => {
    if (drag.current?.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section className="relative isolate overflow-hidden bg-surface py-20 md:py-24 lg:py-28">
      {/*
        The blurred backdrop: every slide, stacked, with only the active one
        opaque. All six are rendered rather than swapped through one element so
        the cross-fade has something to fade to — swapping `src` on a single
        Image pops, because the new file is still decoding when the old one
        disappears.

        `priority` on the first only. The rest are ordinary lazy images; they
        are decoded well before anyone reaches slide four, and marking six
        full-bleed photographs as priority would have them all competing with
        the page's real LCP.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 select-none"
      >
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className={
              "absolute inset-0 transition-opacity duration-[900ms] ease-[var(--ease-entry)] motion-reduce:transition-none " +
              (i === active ? "opacity-100" : "opacity-0")
            }
          >
            <Image
              src={slide.src}
              alt=""
              fill
              /* Sized for the blur it is about to get. At 64px this was 640px
                 wide, because everything finer was averaged into mush anyway;
                 at 28px the picture keeps enough structure that a source that
                 small shows as soft banding across a full-bleed band, so it
                 goes up rather than being left at a figure chosen for a
                 heavier blur. */
              sizes="1280px"
              quality={62}
              priority={i === 0}
              className="scale-110 object-cover blur-[14px]"
            />
          </div>
        ))}
        {/* The scrim, WHITE — and flipping it flips the whole band.

            It was black at 0.45 and the section was a dark one: white type on a
            darkened photograph. A white wash over the same six pictures makes
            the band light, so everything that was legible BECAUSE it was white
            stops being legible, and the type below is near-black now rather
            than white. That is not a side effect to notice later; it is what
            changing a scrim's colour means.

            0.62 is set by the darkest of the six, not the average. The hardware
            slide is near-black metal, and at a lighter wash `--ink` on it fails
            AA; at this figure the worst patch still holds the caption. The two
            edge washes close the band to `--surface` top and bottom so the join
            with the sections either side is not a visible seam. */}
        <div className="absolute inset-0 bg-surface/62" />
        <div className="absolute inset-0 bg-linear-to-b from-surface via-transparent to-surface" />
      </div>

      <div className="relative">
        {/* THE TITLE BLOCK, TOP LEFT, ON ONE LINE.

            IT HELD TWO LINES AND THAT WAS A `max-w-[16ch]` DOING IT. A measure
            cap is the right tool for a heading that is allowed to wrap — it
            makes the break depend on the words rather than the viewport — but
            this one is not allowed to wrap, so the cap is gone and
            `whitespace-nowrap` states the rule directly instead of hoping a
            width happens to produce it.

            THE SIZE HAS TO COME DOWN TO PAY FOR IT. A line that cannot break
            can only fit by being smaller, so the clamp is retuned: 3.6vw
            against the old 4.5vw, which is what keeps the longest of the three
            translations inside the band at `lg` rather than running under the
            carousel. Below `lg` the nowrap is dropped — at phone width no size
            in this range fits on one line, and forcing it would either overflow
            the screen or shrink the heading to body copy. */}
        <div className="px-6 md:px-8 lg:px-10">
          {/* THE HEADING REVEALS; THE TRACK DELIBERATELY DOES NOT.

              `Reveal` animates `transform: translateY`, and the track is a
              scroller whose card positions are measured with `offsetLeft` and
              `getBoundingClientRect`. A transform on it — or on any ancestor —
              shifts those readings while the animation is mid-flight, so a
              drag or an arrow press during the reveal would scroll to the wrong
              card. The cards carry their own entrance instead: they arrive with
              the section, and the first thing that moves them is the reader. */}
          <Reveal>
            <h2 className="text-[clamp(1.5rem,3.6vw,3.25rem)] leading-[1.05] font-medium tracking-tighter text-ink lg:whitespace-nowrap">
              {part.title}
            </h2>
          </Reveal>
        </div>

        {/*
          THE TRACK, OFFSET RIGHT AND RUNNING OFF THE EDGE.

          `pr-6` with no matching right cap: the last card is meant to reach the
          screen edge and be cut by it, because a track that ends flush reads as
          a finished row and a track that runs out of frame reads as something
          you can keep pulling. The scroll padding matches the left inset so a
          card called up by an arrow lands on the same line the title starts on
          rather than jammed against the viewport.

          `snap-x` with `snap-start`: a swipe settles ON a card rather than
          between two. `scrollbar-width: none` hides the native bar — the arrows
          and the cut-off card already say this scrolls, and a grey scrollbar
          under a photographic band is the one piece of chrome that would date
          it.
        */}
        <ul
          ref={trackRef}
          role="list"
          onPointerDown={onPointerDown}
          onDragStart={(e) => e.preventDefault()}
          onClickCapture={onClickCapture}
          /* NO TRAILING PAD, AND THAT IS THE FIX FOR THE BLANK. A single set of
             six cannot scroll its last card to the left edge — the scroller
             stops when the strip's right edge meets the container's — so the
             earlier version bought that travel with `pr-[34vw]` of empty space.
             It worked, and it was the blank: past card six the track showed
             nothing at all. Three sets give the last card real cards to its
             right instead of padding, which is both the travel and the loop.

             NO `scroll-smooth` EITHER, AND THAT ONE IS SUBTLE. The class sets
             `scroll-behavior: smooth` on the element, which makes EVERY
             programmatic scroll animate — including the recentre, whose whole
             job is to teleport one set sideways without being seen. With it on,
             the silent jump became a visible second scroll racing the first,
             and the track oscillated between two cards instead of advancing.
             `go` passes `behavior: "smooth"` explicitly for the movement that
             should be seen, so nothing is lost by taking the blanket rule off. */
          className={
            "mt-8 flex snap-x scroll-pl-6 md:scroll-pl-8 lg:scroll-pl-0  gap-5 overflow-x-auto pb-2 pr-6 pl-6 [scrollbar-width:none] md:mt-10 md:gap-6 md:pr-8 md:pl-8 lg:mt-12 lg:ml-[18%] lg:pr-0 lg:pl-0 [&::-webkit-scrollbar]:hidden" +
            /* Snapping OFF mid-drag (see the handlers): with it on, every
               scroll written by the pointer is yanked back to the nearest snap
               point and the card will not follow the cursor. `cursor-grabbing`
               while held, `cursor-grab` at rest, so the affordance is visible
               before anyone tries it. */
            (dragging
              ? " cursor-grabbing select-none"
              : " cursor-grab snap-mandatory")
          }
          
        >
          {/* Three sets laid end to end. `flatMap` rather than a nested loop so
              the list stays flat and `slideRefs` can be indexed by strip
              position — `set * 6 + i` — which is the coordinate `go` and
              `nearestSlide` both work in.

              The duplicates are `aria-hidden` and the middle set is not: a
              screen reader should hear the six figures once, not eighteen
              times. The visible set keeps its `<figure>` semantics; the copies
              are scenery that exists to give the scroller somewhere to go. */}
          {Array.from({ length: SETS }).flatMap((_, set) =>
            items.map((item, i) => (
              <li
                key={`${set}-${item}`}
                aria-hidden={set !== 1}
                ref={(el) => {
                  slideRefs.current[set * SLIDES.length + i] = el;
                }}
                /* WIDE CARDS, PER THE BRIEF, and sized in `vw` rather than a
                 fraction of the track: the track is indented at `lg`, so a
                 percentage would make the cards narrower exactly where there is
                 most room for them. Viewport units keep the card the same size
                 whatever the indent does, and the cap stops it becoming a
                 billboard on an ultrawide display. */
                className="group w-[calc(100vw-3rem)] shrink-0 snap-start sm:w-[64vw] lg:w-[min(46vw,720px)]"
              >
                <figure className="flex h-full flex-col">
                  <div className="relative aspect-16/10 w-full overflow-hidden rounded-[16px] bg-ink/5">
                    <Image
                      src={SLIDES[i].src}
                      alt={SLIDES[i].alt}
                      fill
                      sizes="(max-width: 640px) 82vw, (max-width: 1024px) 64vw, 46vw"
                      quality={72}
                      /* The hover physics the brief's own house style asks for,
                       and the reason the figure is `overflow-hidden`: the image
                       grows inside a box that does not, so the crop tightens
                       rather than the card changing size and shoving its
                       neighbours. */
                      draggable={false}
                    className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  </div>

                  {/* The point. It sits under the picture rather than over it:
                    these are figures with units in them, and a caption laid over
                    a photograph has to fight whatever is behind it at exactly
                    the moment it is being read as data. */}
                  <figcaption className="mt-5 text-lg leading-snug font-medium tracking-tight text-ink md:text-xl lg:text-2xl">
                    {item}

                    {/* THE HARDWARE NOTE, ON THE ONE CARD IT BELONGS TO.
                        
                        Read from `part.note` rather than written out here, and
                        that is the whole reason this is three lines instead of
                        one. The sentence already exists in `lib/content.ts` —
                        and so do its Chinese and Malay translations. Pasting the
                        English into the component would render the same card in
                        English on all three locales, and would leave a second
                        copy of a claim about named suppliers to drift out of
                        step with the first.

                        `LAST` picks the card it hangs off. The note is about the
                        German hardware system, which is the last of the six, so
                        it is keyed to that position rather than matched against
                        the caption text — the text is translated and a string
                        comparison would silently stop matching in Chinese.
                        
                        `block` on a span inside the figcaption rather than a
                        `<p>`: a paragraph is not valid inside a figcaption's
                        phrasing content, and the caption is one thought — the
                        claim and what backs it — rather than two. */}
                    {i === LAST && part.note ? (
                      <span className="mt-2 block text-xs leading-relaxed font-normal tracking-normal text-ink-3 italic md:text-sm">
                        {part.note}
                      </span>
                    ) : null}
                  </figcaption>
                </figure>
              </li>
            )),
          )}
        </ul>

        {/* THE CONTROLS, on the track's own line.

            Buttons rather than dots-only: six slides is more than a dot row can
            be aimed at comfortably, and the arrows give the keyboard something
            real to focus.

            THEY WRAP, and neither is ever disabled. Stepping past the last card
            returns to the first and stepping back from the first goes to the
            last, so the six can be walked round indefinitely in either
            direction without the track dead-ending. The progress rail below is
            what keeps that honest: a looping carousel hides how much is left,
            so the rail states the position outright — six segments, the current
            one lit — which a pair of arrows that never grey out cannot. */}
        <div className="mt-8 flex items-center gap-4 px-6 md:px-8 lg:mt-10 lg:ml-[18%] lg:px-0 lg:pl-0">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous highlight"
              className="glass glass-rim relative flex size-11 items-center justify-center rounded-full text-ink transition-opacity duration-200 hover:opacity-80"
            >
              <CaretLeftIcon size={18} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next highlight"
              className="glass glass-rim relative flex size-11 items-center justify-center rounded-full text-ink transition-opacity duration-200 hover:opacity-80"
            >
              <CaretRightIcon size={18} weight="bold" />
            </button>
          </div>

          {/* The progress rail. Six segments, the active one lit — it says
              which of the six is up and how many remain, which a pair of
              arrows on their own does not. Not interactive: it reports the
              scroller, and the arrows and the swipe already drive it. */}
          <div aria-hidden className="flex flex-1 gap-1.5">
            {SLIDES.map((slide, i) => (
              <span
                key={slide.src}
                className={
                  "h-px flex-1 transition-colors duration-300 " +
                  (i === active ? "bg-ink/80" : "bg-ink/15")
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
