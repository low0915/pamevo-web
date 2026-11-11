"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { HERO, HERO_ZH, HERO_BM } from "@/lib/content";
import { localePath, useCopy, useLocale } from "@/lib/locale";

/** How long each slide holds before the next, in ms. */
const INTERVAL = 7000;
/** Crossfade between slides, in ms. */
const FADE = 900;
/** Horizontal travel, in px, a drag needs before it changes slide. */
const SWIPE = 50;
/** How far the text follows the pointer during a drag, as a share of it. */
const DRAG_FOLLOW = 0.25;

/**
 * Home hero: a full-screen slider with media as the background.
 *
 * The first slide is the lockup (the logo, the tagline), then one per entry in
 * `HERO.slides`, each leading somewhere. The slider itself, its timer, drag,
 * progress bars and arrows, is HeroCarousel below, which the inner pages'
 * PageHero shares at partial height.
 *
 * The scrim is light and weighted left: the logo is deep crimson and needs a
 * bright ground.
 */
export function Hero() {
  const hero = useCopy(HERO, { ZH: HERO_ZH, BM: HERO_BM });
  const { locale } = useLocale();

  return (
    <HeroCarousel
      label={hero.heading}
      className="h-[100svh] min-h-[560px]"
      /* The page's real heading. The visible lockup is the logo image, so the
         words are given to screen readers and crawlers here, outside the
         slides, where a slide change can never hide them. */
      heading={<h1 className="sr-only">{hero.heading}</h1>}
      slides={[
        {
          key: "home",
          /* The product, in the opening shot: a door and a window in a home.
             `preload`, as the first thing on the page. */
          media: (
            <Image
              src={hero.image}
              alt={hero.alt}
              fill
              sizes="100vw"
              preload
              draggable={false}
              className="graded-hero object-cover"
            />
          ),
          content: (
            <Lockup
              mark={
                <Image
                  src="/logo.png"
                  /* Decorative: the h1 above states the same thing. */
                  alt=""
                  width={2220}
                  height={174}
                  preload
                  draggable={false}
                  className="h-full w-auto"
                />
              }
              headline={hero.tagline}
              body={hero.subheading}
            />
          ),
        },
        ...hero.slides.map((slide) => ({
          key: slide.href,
          media: (
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              sizes="100vw"
              draggable={false}
              className="graded-hero object-cover"
              /* A slide may nudge its photograph: `shift` is a percentage of
                 the image's own size, and the 1.16 zoom is the margin that
                 keeps an edge from showing when it moves. Only slides that
                 ask for a shift are zoomed. */
              style={
                "shift" in slide && slide.shift
                  ? {
                      transform: `scale(1.16) translate(${("x" in slide.shift ? slide.shift.x : 0) ?? 0}%, ${("y" in slide.shift ? slide.shift.y : 0) ?? 0}%)`,
                    }
                  : undefined
              }
            />
          ),
          content: (
            <Lockup
              mark={
                <p className="text-sm font-medium tracking-[0.2em] text-ink-2 uppercase md:text-base">
                  {slide.eyebrow}
                </p>
              }
              headline={slide.title}
              body={slide.body}
              cta={{ label: slide.cta, href: localePath(slide.href, locale) }}
            />
          ),
        })),
      ]}
    />
  );
}

export type HeroSlide = {
  key: string;
  /** The background: an image, filling the slide. The scrim goes over it. */
  media: ReactNode;
  /** The text block, set left on the site gutter (centred on a phone). */
  content: ReactNode;
};

/**
 * The slider every hero on the site is built on: the home page's at full
 * screen, the inner pages' (PageHero) at partial height.
 *
 * Slides crossfade on a timer that pauses while the pointer or focus is inside
 * the hero, and does not run at all under reduced motion. Each slide is a
 * stacked layer; only the current one is visible, and the others are `inert`
 * so their content is out of the tab order and the accessibility tree. That
 * is why the page's h1 comes in through `heading`, outside the slides.
 *
 * Drag (mouse, pen or touch) changes slide; the text follows the pointer a
 * little and carries on the way it was thrown as its slide fades.
 */
export function HeroCarousel({
  label,
  className,
  heading,
  slides,
}: {
  /** The carousel's accessible name. */
  label: string;
  /** Height classes: the home hero is full screen, the inner pages' are not. */
  className: string;
  heading?: ReactNode;
  slides: HeroSlide[];
}) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  /** Where the current drag started, or null when there is none. */
  const dragStart = useRef<number | null>(null);
  /** The live drag distance, for the text to follow. */
  const [dragX, setDragX] = useState<number | null>(null);
  /** Where the text was let go on the slide a drag just left, so it carries on
      from there as it fades instead of snapping back. */
  const [leaveX, setLeaveX] = useState(0);

  const go = useCallback(
    (step: number) => setIndex((i) => (i + step + count) % count),
    [count],
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Keyed on `index`, so a manual change restarts the full interval rather
  // than advancing again a moment later.
  useEffect(() => {
    if (paused || reduced || count < 2) return;
    const id = window.setTimeout(() => go(1), INTERVAL);
    return () => window.clearTimeout(id);
  }, [index, paused, reduced, go, count]);

  // Once the slide that was dragged away is fully faded, put its text back.
  useEffect(() => {
    if (leaveX === 0) return;
    const id = window.setTimeout(() => setLeaveX(0), FADE);
    return () => window.clearTimeout(id);
  }, [leaveX]);

  const running = !paused && !reduced && dragX === null;

  const endDrag = (commit: boolean) => {
    if (commit && dragX !== null && Math.abs(dragX) > SWIPE) {
      setLeaveX(dragX);
      go(dragX < 0 ? 1 : -1);
    }
    dragStart.current = null;
    setDragX(null);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      /* `touch-action: pan-y` leaves vertical swipes to the page, so a phone
         can still scroll past the hero; only horizontal drags reach here. */
      className={`relative ${className} w-full touch-pan-y overflow-hidden bg-surface select-none ${
        dragX === null ? "cursor-grab" : "cursor-grabbing"
      }`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
      /* Mouse, pen and touch alike. A press on a control or a slide's button
         is left to it, so clicking one is never read as a drag. */
      onPointerDown={(e) => {
        if (e.button !== 0 || (e.target as HTMLElement).closest("a, button")) return;
        dragStart.current = e.clientX;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (dragStart.current === null) return;
        setDragX(e.clientX - dragStart.current);
      }}
      onPointerUp={() => endDrag(true)}
      onPointerCancel={() => endDrag(false)}
    >
      {heading}

      {slides.map((slide, i) => (
        <Slide key={slide.key} active={index === i} label={`${i + 1} / ${count}`}>
          {slide.media}
          <Scrim mobile="foot" />
          <SlideBody active={index === i} dragX={dragX} leaveX={leaveX}>
            {slide.content}
          </SlideBody>
        </Slide>
      ))}

      {/* Controls: the slide count and the progress bars, which fill over the
          time left on the current slide and double as slide buttons; then the
          arrows. */}
      <div className="absolute inset-x-0 bottom-0 px-6 pb-8 md:px-8 md:pb-10 lg:px-10">
        <div className="flex items-center justify-center gap-4 md:justify-between">
          <div className="flex items-center gap-4">
            <p
              aria-hidden
              className="text-sm font-medium tracking-tight text-ink tabular-nums"
            >
              {String(index + 1).padStart(2, "0")}
              <span className="text-ink/40"> / {String(count).padStart(2, "0")}</span>
            </p>
            <div className="flex items-center gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.key}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                  className="group relative flex h-8 items-center"
                >
                  <span className="relative block h-[3px] w-12 overflow-hidden rounded-full bg-ink/20 md:w-16">
                    <span
                      /* Keyed on the index and the pause, so the fill restarts
                         with the timer: on every change, and on resuming. */
                      key={i === index ? `on-${index}-${running}` : "off"}
                      className="absolute inset-y-0 left-0 block rounded-full bg-ink"
                      style={
                        i !== index
                          ? { width: 0 }
                          : running
                            ? {
                                width: "100%",
                                transformOrigin: "left",
                                animation: `hero-progress ${INTERVAL}ms linear both`,
                              }
                            : { width: "100%" }
                      }
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <ArrowButton label="Previous slide" onClick={() => go(-1)}>
              <CaretLeftIcon size={18} weight="bold" />
            </ArrowButton>
            <ArrowButton label="Next slide" onClick={() => go(1)}>
              <CaretRightIcon size={18} weight="bold" />
            </ArrowButton>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hero-progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </section>
  );
}

function Slide({
  active,
  label,
  children,
}: {
  active: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={label}
      aria-hidden={!active}
      inert={!active}
      className="absolute inset-0 transition-opacity ease-in-out"
      style={{ opacity: active ? 1 : 0, transitionDuration: `${FADE}ms` }}
    >
      {children}
    </div>
  );
}

/** The text block. It fades with its slide and does not move on its own:
    the only movement is following the pointer during a drag, and, on the
    slide a drag has just left, carrying on from where it was let go. */
function SlideBody({
  active,
  dragX,
  leaveX,
  children,
}: {
  active: boolean;
  dragX: number | null;
  leaveX: number;
  children: ReactNode;
}) {
  let x = 0;
  let transition = "translate 400ms var(--ease-out)";
  if (active && dragX !== null) {
    x = dragX * DRAG_FOLLOW;
    transition = "none";
  } else if (!active) {
    // Twice the follow distance, eased: the text keeps travelling the way it
    // was thrown while the slide fades. With no drag, `leaveX` is 0 and the
    // text simply fades where it is.
    x = leaveX * DRAG_FOLLOW * 2;
    transition = leaveX ? `translate ${FADE}ms var(--ease-out)` : "none";
  }

  return (
    /* Below `md` the block sits at the FOOT of the slide, just over the
       controls (`pb-28` clears their 32px row and its 32px inset with room to
       spare), so the top of the photograph is left clear. From `md` it centres
       as before. */
    <div className="absolute inset-0 flex items-end pb-28 md:items-center md:pb-0">
      <div
        className="w-full px-6 text-center md:px-8 md:text-left lg:px-10"
        style={{ translate: `${x}px 0`, transition }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * One layout for every slide, so they line up exactly as they swap.
 *
 * The mark row is a fixed height whatever is in it — the logo on the first
 * slide, a short eyebrow on the others — and its content sits on the row's
 * bottom edge. The headline holds one line from `md` up and the body one line
 * from `lg` up. Below `md` the headline wraps — the tagline to three lines —
 * so it reserves three lines' height there, and a shorter headline leaves the
 * space under itself rather than shifting the whole block. The button row is
 * a fixed height too, and held empty on the first slide, which has no button.
 *
 * BELOW `md` NONE OF THAT HOLDS, on purpose. There the block sits on the foot
 * of the slide rather than centring, so reserved space reads as gaps rather
 * than alignment: the headline takes only the lines it needs, the rows are
 * set close, the empty button row on the first slide is dropped, and the
 * button is the smaller 40px pill.
 * With every row the same height on every slide, each slide's block centres
 * to the same place, and each row of one sits exactly where the same row of
 * the others was.
 */
function Lockup({
  mark,
  headline,
  body,
  cta,
}: {
  mark: ReactNode;
  headline: string;
  body: string;
  /** Every slide but the first has one. The first holds the same height empty,
      so its lockup centres to the same place as the others'. */
  cta?: { label: string; href: string };
}) {
  return (
    <>
      <div className="mb-3 flex h-6 items-end justify-center md:mb-8 md:h-9 md:justify-start lg:h-11">
        {mark}
      </div>
      <p className="text-[clamp(1.875rem,3.5vw,5rem)] leading-[1] font-medium tracking-tighter text-ink md:whitespace-nowrap">
        {headline}
      </p>
      <p className="mt-3 text-base leading-relaxed text-ink md:mt-5 md:text-lg lg:whitespace-nowrap">
        {body}
      </p>
      <div
        className={`mt-5 h-10 items-center justify-center md:mt-8 md:flex md:h-12 md:justify-start ${
          cta ? "flex" : "hidden"
        }`}
      >
        {cta && (
          <Link
            href={cta.href}
            draggable={false}
            className="group inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium md:h-12 md:px-7 md:text-base tracking-tight text-bg transition-transform duration-[160ms] ease-out hover:-translate-y-0.5 active:translate-y-0"
          >
            {cta.label}
            <ArrowRight
              className="size-4 transition-transform md:size-[18px] duration-200 ease-out group-hover:translate-x-0.5"
            />
          </Link>
        )}
      </div>
    </>
  );
}

/** Two scrims, because the text sits differently on each: full width on
    mobile, weighted left from `md` up.

    Mobile has two forms. `wash` is an even veil over the whole picture, for
    the static inner-page heroes whose copy is centred on it. `foot` is for the
    carousel, whose copy sits at the bottom on a phone: the white rises from the
    foot and is gone by about the upper third, so the photograph reads clear
    above the copy and the copy still holds on near-solid ground (ink on 0.92 of
    the page ground is well past AA whatever is behind it). */
export function Scrim({ mobile = "wash" }: { mobile?: "wash" | "foot" }) {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 md:hidden"
        style={{
          background:
            mobile === "foot"
              ? "linear-gradient(to top, rgb(244 245 246 / 0.96) 0%, rgb(244 245 246 / 0.92) 42%, rgb(244 245 246 / 0.6) 56%, rgb(244 245 246 / 0.15) 68%, rgb(244 245 246 / 0) 76%)"
              : "linear-gradient(to right, rgb(244 245 246 / 0.9) 0%, rgb(244 245 246 / 0.8) 60%, rgb(244 245 246 / 0.7) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 hidden md:block"
        style={{
          background:
            "linear-gradient(to right, rgb(244 245 246 / 0.95) 0%, rgb(244 245 246 / 0.85) 35%, rgb(244 245 246 / 0.45) 58%, rgb(244 245 246 / 0) 80%)",
        }}
      />
    </>
  );
}

function ArrowButton({
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
      className="flex size-11 items-center justify-center rounded-full border border-ink/15 bg-white/60 text-ink backdrop-blur transition-[background-color,scale] duration-150 ease-out hover:bg-white active:scale-95"
    >
      {children}
    </button>
  );
}
