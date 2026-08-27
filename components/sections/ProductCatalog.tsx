"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { CaretDown, Rows, SquaresFour } from "@phosphor-icons/react/dist/ssr";

import { PRODUCTS, type Product } from "@/lib/products";
import { PRODUCTS_PAGE } from "@/lib/content";
import { Z } from "@/lib/z";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** One image layer per photograph, keyed so a product with several shots keeps
 *  each of them addressable. 23 layers across the 20 products. */
type Layer = { key: string; no: string; src: string; alt: string };

const LAYERS: Layer[] = PRODUCTS.flatMap((p) =>
  p.images.map((img, i) => ({
    key: `${p.slug}-${i}`,
    no: p.no,
    src: img.src,
    alt: img.alt,
  })),
);

const FIRST = PRODUCTS[0];
const FIRST_KEY = `${FIRST.slug}-0`;

/** The two ways to read the catalogue. List is the default: it holds the most
 *  titles on screen at once, which is what a twenty-item spec list is for. */
const VIEWS = [
  { id: "list", label: "List view", Icon: Rows },
  { id: "grid", label: "Grid view", Icon: SquaresFour },
] as const;

type View = (typeof VIEWS)[number]["id"];

/**
 * The two-column product browser: photograph left, catalogue right.
 *
 * Deliberately in normal flow rather than pinned. Background and WhyChoose pin
 * because a scrubbed GSAP timeline drives them off page scroll; this section is
 * driven by clicks, so a pin would buy a runway nothing consumes. It would also
 * mean a ScrollTrigger.refresh() on every accordion toggle, since the panel's
 * content height changes, and refreshing mid-scrub is what makes pinned
 * sections jump.
 *
 * The list is in page flow, not an internal scroller: the page scrolls and the
 * photograph is pinned beside it. That keeps one scrollbar on the page, which
 * is also why Lenis needs no nested-scroll handling for this section.
 *
 * Padding sits on the section and the max-width on the box inside it, the same
 * nesting ProductsIntro uses. The reverse order only coincides with it up to
 * 1440: past that, padding inside a capped box insets the content a further
 * 48px and the photograph stops lining up with the h1.
 *
 * Below lg the whole thing collapses into one column and the photograph stops
 * being sticky: at 768 a 26rem catalogue leaves it about 110px wide, which is a
 * sliver, not a picture, and a pinned photograph on a phone eats the screen.
 */
export function ProductCatalog() {
  const reduce = useReducedMotion();

  /** Which row is expanded. Null is a legal state: rows close on re-click. */
  const [open, setOpen] = useState<string | null>(FIRST.no);
  /** Which image layer is visible. */
  const [shown, setShown] = useState(FIRST_KEY);
  const [view, setView] = useState<View>("list");
  /** Which layers have been mounted, and so fetched. Never shrinks. */
  const [mounted, setMounted] = useState<ReadonlySet<string>>(
    () => new Set([FIRST_KEY]),
  );

  const preload = useCallback((p: Product) => {
    setMounted((prev) => {
      const key = `${p.slug}-0`;
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      p.images.forEach((_, i) => next.add(`${p.slug}-${i}`));
      return next;
    });
  }, []);

  /** Selecting always shows the product; only the disclosure toggles. That way
   *  the photograph never blanks out and aria-expanded never lies. */
  const toggle = useCallback(
    (p: Product) => {
      preload(p);
      setShown(`${p.slug}-0`);
      setOpen((prev) => (prev === p.no ? null : p.no));
    },
    [preload],
  );

  return (
    <section className="mb-[4em] px-4 pt-16 pb-24 md:px-8 md:pt-20 md:pb-36 lg:px-12">
      <div className="mx-auto w-full max-w-[1440px]">
        <h2 className="sr-only">{PRODUCTS_PAGE.catalogLabel}</h2>

        {/* Above the grid rather than inside the right column, so the first
            entry starts level with the top of the photograph.

            Two buttons rather than one that flips: with aria-pressed on each, a
            screen reader hears which view is active without having to infer it
            from a label that changes underneath it. Mirrors the locale toggle
            in the header. */}
        <div className="mb-5 flex justify-end">
          <div
            role="group"
            aria-label={PRODUCTS_PAGE.viewLabel}
            className="flex items-center gap-0.5 rounded-full border border-[rgb(255_255_255/0.7)] bg-[rgb(255_255_255/0.35)] p-0.5"
          >
            {VIEWS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={view === id}
                aria-label={label}
                onClick={() => setView(id)}
                className={`grid size-8 place-items-center rounded-full transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97] ${
                  view === id ? "bg-ink text-bg" : "text-ink-3"
                }`}
              >
                <Icon size={15} weight="regular" />
              </button>
            ))}
          </div>
        </div>

        {/* items-start is what lets the figure be shorter than the column and
            so have somewhere to stick. A stretched grid item fills the row and
            position: sticky has no travel.

            Below `lg` this stops being a grid at all, and that is what lets the
            photograph stick there too. A grid item is laid in its grid area,
            and in one column that area is the item's own row - so a sticky
            figure would be pinned inside a box exactly its own height and never
            move. As a block child of a block container its containing block is
            the whole column, which is the length of the catalogue. The gap goes
            with the grid, so the figure carries the spacing itself. */}
        <div className="grid gap-6 [--pin-gap:1.5rem] [--pin-h:34dvh] [--pin-top:6rem] max-lg:block md:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,40rem)] xl:gap-8">
          {/* LEFT: pinned beside the list. top-24 clears the header island,
              which owns the first 80px of the viewport, with a little air
              beyond it. The frame is square, capped so it can never outgrow the
              viewport it is pinned inside: on a short screen the cap wins and
              the crop simply flattens back towards landscape.

              Every visited photograph stays mounted and crossfades by opacity.
              A keyed AnimatePresence would mount the incoming layer and only
              then start fetching, so an uncached shot fades to an empty box.
              Hovering a row mounts its layer ahead of the click. */}
          {/* Masks the strip above the pinned photograph, below `lg`. A row
              scrolling up passes under the picture, which paints over it, and
              then out the other side into the 24 of clearance above it - where
              it has nothing to be in front of and reads as the list leaking
              past its own frame. This covers that strip in the page's own
              ground, so the list ends at the photograph's top edge.

              Zero height, so it claims no room in the column, with the band
              itself painted by an absolutely positioned child. It has to sit
              in the same block container as the list to stick for the length
              of it, and it cannot wrap the figure: that would make the wrapper
              the grid item at `lg` and leave the figure sticking inside a box
              its own height, which is no travel at all.

              It runs past the foot of the picture by `--pin-gap` as well, so a
              row does not surface hard against the picture's own bottom edge -
              it comes out of a band of ground, the same gap that separates the
              two when nothing is stuck yet.

              First in the column and on the same `raised` step as the picture,
              so the picture - later in the document - still paints over it
              where the two meet before either has begun to stick. */}
          <div
            aria-hidden
            style={{ zIndex: Z.raised }}
            className="pointer-events-none sticky top-0 h-0 lg:hidden"
          >
            <div className="absolute inset-x-0 top-0 h-[calc(var(--pin-top)+var(--pin-h)+var(--pin-gap))] bg-bg" />
          </div>

          {/* Sticky at every width now, so on a phone the photograph holds the
              top of the screen and only the catalogue under it travels. `top-24`
              clears the header island at both, with a little air beyond it.

              `--pin-h` is a flat third of the screen below `lg`, not a ratio
              with a cap. The mask above has to know where the picture's foot
              falls in order to leave a gap under it, and a 4:3 box puts that
              somewhere different on every phone. A fixed band crops instead,
              which `object-cover` inside absorbs, and it keeps the picture to
              a third of the screen on a short phone as well as a tall one.

              It also needs to out-paint the rows, which is new: they carry
              `relative`, so they are positioned boxes later in the document and
              would otherwise scroll over the top of it. `raised` is the scale's
              own answer to that and still sits well under the header. */}
          <figure
            style={{ zIndex: Z.raised }}
            className="sticky top-[var(--pin-top)] h-[var(--pin-h)] w-full overflow-hidden rounded-[8px] border border-[rgb(126_133_140/0.25)] bg-surface-2 max-lg:mb-[var(--pin-gap)] lg:top-32 lg:aspect-square lg:h-auto lg:max-h-[calc(100dvh-11rem)]"
          >
            {LAYERS.filter((l) => mounted.has(l.key)).map((l) => (
              <div
                key={l.key}
                data-active={l.key === shown}
                className="absolute inset-0 opacity-0 transition-opacity duration-[280ms] ease-[var(--ease-out)] data-[active=true]:opacity-100"
              >
                <Image
                  src={l.src}
                  alt={l.alt}
                  fill
                  /* Was `priority`, deprecated as of Next 16. Eager rather
                     than preload: this photograph and the ProductsIntro hero
                     are both plausible LCP depending on viewport, so preloading
                     both would only have them race. */
                  loading={l.key === FIRST_KEY ? "eager" : "lazy"}
                  sizes="(max-width: 1023px) 100vw, (max-width: 1440px) 60vw, 900px"
                  quality={78}
                  className="graded-soft object-cover"
                />
              </div>
            ))}
          </figure>

          {/* RIGHT: the rows stand on the page, in page flow. No shell, no
              clipping box, no internal scroll, so the list is as long as it is
              and the photograph beside it holds still.

              .glass over the flat page ground. Each row carries its own rim
              now that there is no shell to carry one for the set. */}
          {/* items-start so an expanded card does not stretch the sibling
              beside it to match. */}
          <ul
            className={
              view === "grid"
                ? "grid grid-cols-2 items-start gap-4 sm:gap-6"
                : "flex flex-col gap-6"
            }
          >
              {PRODUCTS.map((p) => {
                const isOpen = open === p.no;
                // The button sits in the panel's bottom right corner, out of
                // flow, level with whatever line ends the panel - so it costs
                // no row of its own and leaves no empty band beside it. Out of
                // flow means nothing reflows around it, so the block that ends
                // the panel reserves the width instead: `views` when there is a
                // thumbnail strip, the last specification when there is not.
                //
                // Only in list view. A grid card is about 170px wide on a
                // phone, and 9rem of reserved gutter would leave the text
                // almost nothing, so there the button keeps its own row - where
                // it very nearly fills the card anyway.
                const floats = view !== "grid";
                const hasViews = p.images.length > 1;
                const lastGroup = p.groups.length - 1;
                const gutter = floats ? "pr-36" : "";
                return (
                  <li
                    key={p.no}
                    data-row={p.no}
                    className="glass glass-flat glass-rim relative overflow-hidden rounded-[8px]"
                  >
                    <h3>
                      <button
                        type="button"
                        id={`row-${p.no}`}
                        aria-controls={`panel-${p.no}`}
                        aria-expanded={isOpen}
                        onClick={() => toggle(p)}
                        onPointerEnter={() => preload(p)}
                        onFocus={() => preload(p)}
                        className={`flex w-full text-left transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.99] ${
                          view === "grid" ? "flex-col" : "items-stretch"
                        }`}
                      >
                        {/* Its own column, flush to the row's edges, so it does
                            not sit inside the text's padding. The row's rounded
                            corners clip it.

                            Decorative: the title beside it already names the
                            product, so an alt here would only repeat it. */}
                        <span
                          aria-hidden
                          className={`relative shrink-0 overflow-hidden bg-surface-2 ${
                            view === "grid"
                              ? "aspect-[4/3] w-full"
                              : "min-h-[7rem] w-28 sm:w-36 lg:w-40"
                          }`}
                        >
                          <Image
                            src={p.images[0].src}
                            alt=""
                            fill
                            sizes={
                              view === "grid"
                                ? "(max-width: 1023px) 46vw, 20vw"
                                : "(max-width: 640px) 112px, 160px"
                            }
                            quality={60}
                            className="graded-soft object-cover"
                          />
                        </span>
                        {/* In grid view this wraps: the number and caret take
                            the first line and the title, ordered last and given
                            the full width, takes the second. On a 164px card the
                            three sharing one line left the title 61px. */}
                        <span
                          className={`flex flex-1 items-center gap-4 ${
                            view === "grid"
                              ? "w-full flex-wrap gap-y-2 px-4 py-4"
                              : "px-5 py-5 xl:gap-5"
                          }`}
                        >
                          <span className="font-mono text-xs text-ink-3">{p.no}</span>
                          {/* In grid view the title box reserves three lines for
                              every card, so the grid stays even instead of
                              stepping with each title's length. Reserving space
                              rather than clamping: a truncated product name is
                              worse than a little air under a short one. */}
                          <span
                            // basis-full rather than w-full: flex-1 sets a 0
                            // basis, which would let the title share the first
                            // line instead of wrapping onto its own.
                            className={`text-base font-medium tracking-tight text-ink ${
                              view === "grid"
                                ? "order-last flex min-h-[6rem] basis-full items-center sm:min-h-[4.5rem]"
                                : "flex-1 xl:text-lg"
                            }`}
                          >
                            {p.title}
                          </span>
                          <CaretDown
                            size={14}
                            weight="bold"
                            aria-hidden
                            className={`shrink-0 text-ink-3 transition-transform duration-200 ease-[var(--ease-out)] ${
                              view === "grid" ? "ml-auto" : ""
                            }`}
                            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                          />
                        </span>
                      </button>
                    </h3>

                    {/* Always mounted, and closed by animating to height 0
                        rather than by unmounting.

                        This panel used to unmount, on the reasoning that a
                        zero-height panel keeps its content focusable and in the
                        accessibility tree — which is a real bug, but `inert` is
                        the fix for it rather than unmounting. Unmounting had a
                        cost that was invisible from inside the component: `open`
                        starts at the first product, so the server rendered ONE
                        product's specifications and nineteen bare titles. Every
                        thermal rating, hardware brand and profile dimension in
                        the catalogue — the whole of what anyone would search
                        for — was absent from the HTML and appeared only after a
                        click.

                        `inert` takes the closed panel out of the tab order and
                        out of the accessibility tree, so nothing is focusable
                        behind a collapsed row, while the text stays in the
                        document where a crawler can read it. Content hidden
                        this way in a standard accordion is indexed normally.

                        AnimatePresence is gone with the unmount: there is no
                        exit to sequence any more, so `animate` alone drives both
                        directions. */}
                    <motion.div
                      id={`panel-${p.no}`}
                      role="region"
                      aria-labelledby={`row-${p.no}`}
                      inert={!isOpen}
                      className="overflow-hidden"
                      initial={false}
                      animate={{
                        height: isOpen ? "auto" : 0,
                        opacity: isOpen ? 1 : 0,
                      }}
                      transition={{ duration: reduce ? 0 : 0.24, ease: EASE_OUT }}
                    >
                      <div className="relative border-t border-[rgb(255_255_255/0.55)] px-5 pt-5 pb-6">
                        {p.groups.map((g, gi) => (
                          <div key={g.title} className="mt-4 first:mt-0">
                            <p className="font-mono text-xs tracking-tight text-ink-2 uppercase underline decoration-[rgb(126_133_140/0.5)] decoration-1 underline-offset-[6px]">
                              {g.title}
                              {g.titleZh ? (
                                <span
                                  lang="zh-Hans"
                                  className="ml-2 font-sans normal-case"
                                >
                                  {g.titleZh}
                                </span>
                              ) : null}
                            </p>
                            <ul className="mt-2 space-y-2.5">
                              {g.items.map((item, ii) => (
                                <li
                                  key={item.en}
                                  className={`text-base leading-relaxed text-ink ${
                                    !hasViews &&
                                    gi === lastGroup &&
                                    ii === g.items.length - 1
                                      ? gutter
                                      : ""
                                  }`}
                                >
                                  {item.en}
                                  {item.zh ? (
                                    <span
                                      lang="zh-Hans"
                                      className="mt-1 block text-base text-ink-2"
                                    >
                                      {item.zh}
                                    </span>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}

                        {/* Product 16 is photographed three times because
                            the three photographs are its three variants, so
                            this strip is content rather than decoration. */}
                        {p.images.length > 1 && (
                          <div className="mt-5">
                            <p className="font-mono text-xs tracking-tight text-ink-2 uppercase underline decoration-[rgb(126_133_140/0.5)] decoration-1 underline-offset-[6px]">
                              {PRODUCTS_PAGE.viewsLabel}
                            </p>
                            <div className={`mt-2 flex flex-wrap gap-2 ${gutter}`}>
                              {p.images.map((img, i) => {
                                const key = `${p.slug}-${i}`;
                                return (
                                  <button
                                    key={key}
                                    type="button"
                                    aria-pressed={shown === key}
                                    aria-label={img.alt}
                                    onClick={() => setShown(key)}
                                    className="relative h-14 w-20 overflow-hidden rounded-[6px] border border-[rgb(126_133_140/0.3)] transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97] aria-pressed:border-ink"
                                  >
                                    <Image
                                      src={img.src}
                                      alt=""
                                      fill
                                      sizes="80px"
                                      quality={50}
                                      className="graded-soft object-cover"
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* The panel's closing move, and the only thing in
                            it that is not a specification.

                            A Link, not a button: it navigates, so it wants
                            to be openable in a new tab and to be picked up
                            as a link by anything reading the page.

                            `bottom-6` is the panel's own `pb-6`, so the
                            button's foot lands on the last line's foot
                            rather than near it. */}
                        <div
                          className={
                            floats
                              ? "absolute right-5 bottom-6"
                              : "mt-6 flex justify-end"
                          }
                        >
                          <Link
                            href={PRODUCTS_PAGE.cta.href}
                            aria-label={PRODUCTS_PAGE.cta.aria(p.title)}
                            className="inline-flex items-center rounded-full bg-ink px-5 py-2.5 text-base font-medium tracking-tight text-bg transition-transform duration-[160ms] ease-[var(--ease-out)] hover:-translate-y-0.5 active:translate-y-0"
                          >
                            {PRODUCTS_PAGE.cta.label}
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    </section>
  );
}
