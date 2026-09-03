"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { CaretDown, Rows, SquaresFour } from "@phosphor-icons/react/dist/ssr";

import {
  PRODUCTS,
  inSystem,
  productFromHash,
  systemFromHash,
  systemHash,
  type Product,
  type System,
} from "@/lib/products";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { PRODUCTS_PAGE, PRODUCTS_PAGE_ZH, PRODUCTS_PAGE_BM } from "@/lib/content";
import { useCopy } from "@/lib/locale";
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
  /* A client component, so the locale comes from context. The chrome — the
     heading, the view switch, the CTA and its /zh/contact href — was reading
     the English constants directly, so /zh/our-products rendered an English
     "Our Products" over Chinese specifications. */
  const copy = useCopy(PRODUCTS_PAGE, { ZH: PRODUCTS_PAGE_ZH, BM: PRODUCTS_PAGE_BM });

  /** Which row is expanded. Null is a legal state: rows close on re-click. */
  const [open, setOpen] = useState<string | null>(FIRST.no);
  /** Which image layer is visible. */
  const [shown, setShown] = useState(FIRST_KEY);
  const [view, setView] = useState<View>("list");
  const [system, setSystem] = useState<System>("all");
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

  const shownProducts = PRODUCTS.filter((p) => inSystem(p, system));

  /**
   * Filtering moves the selection with the list.
   *
   * The photograph beside the catalogue shows whichever product is selected,
   * and the selection survives a filter change that removes it — so filtering
   * to Door System while a casement window was open left a window on screen
   * beside a list of doors, with no row anywhere to explain it. The open row
   * would also still be open, off-list and unreachable.
   *
   * So the first product of the new list is selected, and preloaded, exactly as
   * if it had been clicked. The list always opens on something, which is the
   * state this component starts in and the one it is easiest to read.
   */
  const filter = useCallback(
    (next: System) => {
      setSystem(next);
      const first = PRODUCTS.find((p) => inSystem(p, next));
      if (!first) return;
      preload(first);
      setOpen(first.no);
      setShown(`${first.slug}-0`);
    },
    [preload],
  );

  /**
   * The filter, addressable: /our-products#door opens on Door System.
   *
   * `replaceState` rather than assigning `location.hash`, and rather than
   * `pushState`, for two separate reasons. Assigning the hash would make the
   * browser jump to an element with that id — there is none, so today it does
   * nothing, but the day someone adds `id="door"` anywhere this would start
   * teleporting the page on every filter click. And `pushState` would put a
   * history entry behind every press, so Back would walk the reader through
   * their own filtering rather than returning them to where they came from.
   *
   * It also cannot loop: neither `replaceState` nor `pushState` fires
   * `hashchange`, so writing the URL here never re-enters the listener below.
   */
  const setFilter = useCallback(
    (next: System) => {
      filter(next);
      const { pathname, search } = window.location;
      window.history.replaceState(null, "", `${pathname}${search}${systemHash(next)}`);
    },
    [filter],
  );

  /**
   * Arriving with a fragment, and changing it while already here.
   *
   * In an effect rather than in `useState`, because the server cannot see a
   * fragment: initialising from it would render "all" on the server and
   * something else in the browser. See `systemFromHash` in lib/products.ts.
   *
   * A bare /our-products is left alone rather than filtered to "all" — the two
   * end in the same state, but calling the filter would reset the open row and
   * the shown image, and there is no reason to disturb them for a URL that
   * asked for nothing.
   *
   * `hashchange` covers the reader who is already on this page and picks the
   * other system out of the header menu. That only works because those links
   * are plain anchors rather than Next's `Link`: a client navigation to a new
   * fragment goes through `pushState`, which fires no event at all, and the
   * filter would sit unchanged while the URL said otherwise. See the note in
   * components/site/Header.tsx.
   */
  /**
   * Opening the catalogue ON a product, from its slug in the fragment.
   *
   * This is where the home page's product grid now sends a reader. A pane there
   * used to open that product's own page, which is a dead end with one product
   * on it, and someone who has just picked one pane out of six is browsing
   * rather than deciding. `/our-products#dm80-biofold-door` puts them in the
   * catalogue with that row open and the other nineteen underneath it.
   *
   * The filter is cleared rather than left alone. A slug says nothing about a
   * system, and if the reader had filtered to Door System a link to a window
   * would land on a row that is not rendered — no element, nothing to scroll
   * to, and the selection sitting on a product they cannot see.
   *
   * TWO FRAMES BEFORE SCROLLING, and both are needed. The first lets React
   * commit the newly opened row; the second lets the layout that follows it
   * settle. The row that WAS open closes in the same commit, and when it sits
   * above this one the list shortens underneath — scrolling before that lands
   * short by the height of a whole panel. `scroll-mt-28` on the row is what
   * keeps the result clear of the header and the pinned photograph.
   */
  const openBySlug = useCallback(
    (p: Product) => {
      setSystem("all");
      preload(p);
      setOpen(p.no);
      setShown(`${p.slug}-0`);
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          document.getElementById(p.slug)?.scrollIntoView({ block: "start" }),
        ),
      );
    },
    [preload],
  );

  useEffect(() => {
    const apply = () => {
      const hash = window.location.hash;
      if (!hash) return;
      /* A product first, a filter second. The two share one fragment and
         cannot collide — no product is called "window" or "door" — and a
         fragment matching neither falls through to the unfiltered catalogue
         rather than to an empty list. */
      const product = productFromHash(hash);
      if (product) {
        openBySlug(product);
        return;
      }
      filter(systemFromHash(hash));
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [filter, openBySlug]);

  return (
    <section className="mb-[4em] px-4 pt-16 pb-24 md:px-8 md:pt-20 md:pb-36 lg:px-12">
      <div className="mx-auto w-full max-w-[1440px]">
        <h2 className="sr-only">{copy.catalogLabel}</h2>

        {/* The catalogue's toolbar: what is listed on the left, how it is
            listed on the right. Above the grid rather than inside the right
            column, so the first entry starts level with the top of the
            photograph.

            Sticky, because the thing it controls is twenty products long and a
            filter that scrolls away is a filter you have to go back up to reach.

            `top-20` is the fixed header island, which owns the first 80px of
            the viewport. The height below it is deliberate and not free: the
            bar is 48px tall - a 32px control in `py-2` - which lands its foot
            at exactly 128px, which is where the photograph beside the list
            pins (`lg:top-32`). Any taller and the two overlap; the bar is
            earlier in the document and would be painted over by the figure.

            `bg-bg` rather than glass. Rows pass underneath it, and this is the
            one surface on the page that has to hide what is behind it rather
            than suggest it - a translucent bar with product titles sliding
            through it reads as a rendering fault. `Z.raised` because the rows
            are `relative` and would otherwise paint over a bar that comes
            before them in the document.

            Two groups, both `aria-pressed` per button rather than one control
            that flips: a screen reader hears which one is active without having
            to infer it from a label that changes underneath it. */}
        <div
          style={{ zIndex: Z.raised }}
          className="sticky top-20 mb-5 flex flex-wrap items-center justify-between gap-3 bg-bg py-2"
        >
          <div
            role="group"
            aria-label={copy.filterLabel}
            className="flex items-center gap-0.5 rounded-full border border-[rgb(255_255_255/0.7)] bg-[rgb(255_255_255/0.35)] p-0.5"
          >
            {copy.filters.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={system === id}
                onClick={() => setFilter(id)}
                className={`h-8 rounded-full px-3.5 text-sm whitespace-nowrap transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97] ${
                  system === id ? "bg-ink text-bg" : "text-ink-2"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div
            role="group"
            aria-label={copy.viewLabel}
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
        <div className="grid gap-6 max-lg:block md:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,40rem)] xl:gap-8">
          {/* LEFT: pinned beside the list. top-24 clears the header island,
              which owns the first 80px of the viewport, with a little air
              beyond it. The frame is square, capped so it can never outgrow the
              viewport it is pinned inside: on a short screen the cap wins and
              the crop simply flattens back towards landscape.

              Every visited photograph stays mounted and crossfades by opacity.
              A keyed AnimatePresence would mount the incoming layer and only
              then start fetching, so an uncached shot fades to an empty box.
              Hovering a row mounts its layer ahead of the click. */}
          {/* Sticky at every width now, so on a phone the photograph holds the
              top of the screen and only the catalogue under it travels. `top-24`
              clears the header island at both, with a little air beyond it.

              `--pin-h` is a flat band below `lg`, not a ratio with a cap. The
              mask above has to know where the picture's foot falls in order to
              leave a gap under it, and a 4:3 box puts that somewhere different
              on every phone. A fixed band crops instead, which `object-cover`
              inside absorbs, and it holds the same proportion of a short phone
              as of a tall one.

              It was a third of the screen. At 34dvh the picture and the header
              island together took 383px of an 844px phone, which left less
              room than an open row needs: reading a product's specifications
              meant scrolling its own title up behind the picture, so the panel
              was left captioned by nothing. 22dvh leaves the row's header and
              its panel able to sit below the picture at once.

              It also needs to out-paint the rows, which is new: they carry
              `relative`, so they are positioned boxes later in the document and
              would otherwise scroll over the top of it. `raised` is the scale's
              own answer to that and still sits well under the header. */}
          <figure
            style={{ zIndex: Z.raised }}
            className="hidden w-full overflow-hidden rounded-[8px] border border-[rgb(126_133_140/0.25)] bg-surface-2 lg:sticky lg:top-32 lg:block lg:aspect-square lg:max-h-[calc(100dvh-11rem)]"
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
              {shownProducts.map((p) => {
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
                const gutter = floats ? "pr-36" : "";
                return (
                  <li
                    key={p.no}
                    id={p.slug}
                    data-row={p.no}
                    /* The id is the product's slug, not its number, and it is
                       the one addressable thing about a product while the
                       catalogue is a single page: it is what the ItemList in
                       lib/schema.ts points each entry at, what `scroll-mt`
                       below clears the fixed header for, and what anyone
                       sharing a link to one product actually sends. The slugs
                       are the live WordPress ones, so those links keep working
                       if per-product routes are ever added. */
                    /* The scroll offset is the pinned photograph's whole
                       footprint below `lg`, not the header island's height:
                       jumping to #dm106-casement-window with only the island
                       cleared would land the row behind the picture. Above
                       `lg` the photograph is beside the list rather than over
                       it, so there the island is all there is to clear. */
                    className="glass glass-flat glass-rim relative scroll-mt-28 overflow-hidden rounded-[8px]"
                  >
                    {/* Sticky below `lg`, parked exactly at the pinned
                        photograph's foot.

                        Without this the row's own header scrolls behind the
                        picture the moment its panel is opened — the panel is
                        taller than the screen left under the photograph — and
                        what is left on screen is a column of specifications
                        captioned by nothing. Shrinking the picture only moved
                        the scroll position at which that happens; it could not
                        remove it, because nothing stops the reader scrolling
                        further.

                        The row above dropped `overflow-hidden` for this:
                        `position: sticky` is inert inside an overflow-hidden
                        ancestor, which becomes the element's scroll box, and
                        that box is the row itself and does not scroll. The
                        thumbnail takes its own corner radius below instead.

                        Only while the row is open: a closed row has no panel
                        to read, so it has nothing to stay above, and leaving
                        it unstyled keeps its own rounded foot rather than
                        squaring it off with a header background.

                        Above `lg` the photograph sits beside the list rather
                        than over it, so nothing needs to stick. */}
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
                        {/* The photograph, below `lg` only.

                            On a phone it lives HERE — inside the row it
                            describes, in normal flow — rather than pinned to
                            the top of the screen. Pinning worked on a desktop,
                            where the picture sits in its own column beside the
                            list and overlaps nothing. On a phone there is one
                            column, so a pinned picture has to overlay the
                            catalogue, and everything that scrolled under it was
                            clipped: first the row's own title, then, once the
                            title was made sticky too, the specifications
                            passing under that. Each fix moved the seam without
                            removing it, because the overlap itself was the
                            problem.

                            In flow nothing can be covered. The picture arrives
                            with the specifications it belongs to, the row
                            scrolls as one object, and the screen is free. */}
                        <div className="relative mb-5 aspect-[4/3] w-full overflow-hidden rounded-[6px] bg-surface-2 lg:hidden">
                          <Image
                            src={p.images[0].src}
                            alt=""
                            fill
                            sizes="100vw"
                            quality={78}
                            loading="lazy"
                            className="graded-soft object-cover"
                          />
                        </div>

                        {/* Shared with the detail page at
                            /our-products/[slug]; see components/product. */}
                        <ProductSpecs
                          groups={p.groups}
                          gutter={gutter}
                          reserveOnLastLine={!hasViews}
                        />

                        {/* Product 16 is photographed three times because
                            the three photographs are its three variants, so
                            this strip is content rather than decoration. */}
                        {p.images.length > 1 && (
                          <div className="mt-5">
                            <p className="font-mono text-xs tracking-tight text-ink-2 uppercase underline decoration-[rgb(126_133_140/0.5)] decoration-1 underline-offset-[6px]">
                              {copy.viewsLabel}
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
                            href={copy.cta.href}
                            aria-label={copy.cta.aria(p.title)}
                            className="inline-flex items-center rounded-full bg-ink px-5 py-2.5 text-base font-medium tracking-tight text-bg transition-transform duration-[160ms] ease-[var(--ease-out)] hover:-translate-y-0.5 active:translate-y-0"
                          >
                            {copy.cta.label}
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
