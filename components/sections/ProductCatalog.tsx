"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CaretDown, Rows, SquaresFour } from "@phosphor-icons/react/dist/ssr";

import { PRODUCTS, type Product } from "@/lib/products";
import { PRODUCTS_PAGE } from "@/lib/content";

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
    <section className="mb-[4em] px-4 pb-24 md:px-8 md:pb-36 lg:px-12">
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
            position: sticky has no travel. */}
        <div className="grid gap-6 md:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,40rem)] xl:gap-8">
          {/* LEFT: pinned beside the list. top-24 clears the header island,
              which owns the first 80px of the viewport, with a little air
              beyond it. The frame is square, capped so it can never outgrow the
              viewport it is pinned inside: on a short screen the cap wins and
              the crop simply flattens back towards landscape.

              Every visited photograph stays mounted and crossfades by opacity.
              A keyed AnimatePresence would mount the incoming layer and only
              then start fetching, so an uncached shot fades to an empty box.
              Hovering a row mounts its layer ahead of the click. */}
          <figure className="relative aspect-[4/3] w-full overflow-hidden rounded-[8px] border border-[rgb(126_133_140/0.25)] bg-surface-2 lg:sticky lg:top-32 lg:aspect-square lg:max-h-[calc(100dvh-11rem)]">
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
                  priority={l.key === FIRST_KEY}
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

                    {/* Unmounted when closed rather than held at height 0. A
                        zero-height panel keeps its content focusable and in the
                        accessibility tree, which is the classic accordion bug. */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          // AnimatePresence tracks its children by key. Without
                          // one the exit never runs, and the closed panel is
                          // left mounted at full height.
                          key={`panel-${p.no}`}
                          id={`panel-${p.no}`}
                          role="region"
                          aria-labelledby={`row-${p.no}`}
                          className="overflow-hidden"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: reduce ? 0 : 0.24, ease: EASE_OUT }}
                        >
                          <div className="border-t border-[rgb(255_255_255/0.55)] px-5 pt-5 pb-6">
                            {p.groups.map((g) => (
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
                                  {g.items.map((item) => (
                                    <li
                                      key={item.en}
                                      className="text-base leading-relaxed text-ink"
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
                                <div className="mt-2 flex gap-2">
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
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    </section>
  );
}
