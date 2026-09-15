"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PROJECT_GALLERY, PROJECTS, PROJECTS_ZH, PROJECTS_BM } from "@/lib/content";
import { useCopy } from "@/lib/locale";
import { Reveal } from "@/components/ui/Reveal";
import { Lightbox } from "@/components/ui/Lightbox";

/**
 * Every photograph in the catalogue, as a masonry wall.
 *
 * This is the standalone /our-projects page. The home page keeps the dragged
 * strip in Projects.tsx — the two are answering different questions. A strip is
 * a taste of a portfolio shown in passing on a longer page; a reader who has
 * navigated to a projects page has asked to see the work, and the strip's
 * answer to that was six photographs behind a gesture, with the other
 * seventeen not reachable at all.
 *
 * MASONRY, NOT A GRID OF EQUAL TILES, and the distinction is the whole point of
 * the layout. The catalogue photography runs from 1:1 (14, 19) to nearly 2:1
 * (06, 12), and a uniform grid can only reconcile that by cropping every
 * picture to one shape — which is what the strip did, throwing away the sides
 * of every landscape shot to fit a 3:4 card. Here each tile is given the
 * photograph's own proportions, so what is shown is the picture that was taken.
 *
 * HOW THE COLUMNS WORK. CSS `columns` would be the short way to say this, and
 * it is the wrong way: a column layout fills the first column to the bottom
 * before starting the second, so reading order runs down and then across while
 * the DOM order runs across and then down. A keyboard tabbing through it jumps
 * around the page, and a screen reader reads the wall in an order nobody sees.
 * So the columns are built in the markup instead — the images are dealt into N
 * lists, shortest-column-first, and each list is a flex column. Reading order
 * and visual order then agree, and the columns come out within a row or so of
 * the same height because the dealing accounts for how tall each picture will
 * actually be.
 *
 * That dealing has to happen somewhere both the server and the client agree on,
 * or the first paint reshuffles. It is a pure function of the image list and
 * the column count, both of which are known without measuring anything, so it
 * runs during render and produces the same wall on both sides.
 *
 * The column count itself is the one thing that cannot be known on the server,
 * since it depends on the viewport. Rather than measure and re-deal, all three
 * arrangements are rendered and CSS shows one — see `COLUMN_COUNTS`. Three
 * copies of 23 `<Image>` tags sounds wasteful and is not, but ONLY BECAUSE
 * EVERY TILE IS LAZY: a lazy image inside a `display:none` subtree is never
 * fetched, so the two walls that are not on screen cost markup and nothing
 * else, while the browser's own lazy loader fetches the top of the visible wall
 * on first paint anyway.
 *
 * That is also why not one tile here is `loading="eager"`, tempting as it is
 * for the handful above the fold. `eager` defeats the arrangement at its one
 * load-bearing point: it is fetched regardless of visibility, so marking the
 * first six of each wall eager fetched EIGHTEEN photographs on every load, a
 * dozen of them for walls the viewport had already ruled out. Measured in the
 * built HTML before the change: 19 eager images on a page that shows at most
 * seven. If a genuine LCP hint is ever wanted here it has to be `preload` on a
 * single tile of a single wall, not a count applied to all three.
 */

/** The wall at each breakpoint, and the `sizes` hint that goes with it. One
 *  column on a phone, two from `sm`, three from `lg` — the tiles stay wide
 *  enough that a window in one is still readable as a window. */
const COLUMN_COUNTS = [
  { columns: 1, className: "sm:hidden", sizes: "calc(100vw - 3rem)" },
  {
    columns: 2,
    className: "hidden sm:grid lg:hidden",
    sizes: "calc((100vw - 5rem) / 2)",
  },
  {
    columns: 3,
    className: "hidden lg:grid",
    sizes: "min(calc((1440px - 6rem) / 3), calc((100vw - 6rem) / 3))",
  },
] as const;

/**
 * Deal the images into `count` columns, shortest column first.
 *
 * Height is the only thing being balanced, and a tile's height is its aspect
 * ratio: every column is the same width, so a 2560x1707 picture is 0.667 of a
 * column tall wherever it lands. Summing those ratios is summing heights in
 * units of column-width, which is what makes a greedy pass work without any
 * measurement — and why it holds at every viewport rather than at the one it
 * was tuned for.
 *
 * Greedy rather than optimal. Perfect balancing is a partition problem, and the
 * gain over dealing in order would be a few pixels at the foot of one column;
 * this keeps DOM order equal to reading order, which the optimal arrangement
 * would not.
 */
function deal<T extends { width: number; height: number }>(
  images: T[],
  count: number,
) {
  const columns: T[][] = Array.from({ length: count }, () => []);
  const heights = new Array(count).fill(0);

  for (const image of images) {
    let shortest = 0;
    for (let i = 1; i < count; i++) {
      if (heights[i] < heights[shortest]) shortest = i;
    }
    columns[shortest].push(image);
    heights[shortest] += image.height / image.width;
  }

  return columns;
}

export function ProjectGallery() {
  const projects = useCopy(PROJECTS, { ZH: PROJECTS_ZH, BM: PROJECTS_BM });
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeLightbox = useCallback(() => setOpenIndex(null), []);

  /* Indexed before dealing, so the lightbox can be opened by position in the
     original list rather than by position in whichever column a tile landed
     in — the three walls deal differently, and all three have to name the same
     photograph. */
  const images = PROJECT_GALLERY.map((image, index) => ({ ...image, index }));

  return (
    <section className="bg-bg px-6 pt-16 pb-24 md:px-8 md:pt-20 md:pb-32 lg:px-10">
      <div className="mx-auto w-full max-w-[1440px]">
        {/* One wall per breakpoint; CSS shows the one that fits. The hidden two
            cost no bytes — see the note at the top of the file. */}
        {COLUMN_COUNTS.map(({ columns, className, sizes }) => (
          <div
            key={columns}
            /* `grid` rather than `flex` so the columns are equal width without
               a basis on each one. The class strings are literals in
               COLUMN_COUNTS rather than built from `columns`, because Tailwind
               compiles the classes it can see in the source and a template
               string produces no CSS. */
            className={`${className} gap-4 md:gap-6 ${
              columns === 1
                ? "grid-cols-1"
                : columns === 2
                  ? "grid-cols-2"
                  : "grid-cols-3"
            }`}
          >
            {deal(images, columns).map((column, columnIndex) => (
              <div
                key={columnIndex}
                className="flex flex-col gap-4 md:gap-6"
              >
                {column.map((image, positionInColumn) => (
                  <Reveal
                    key={image.src}
                    /* Staggered down the column, not across the wall: the
                       columns reveal in parallel, so a tile's delay is how far
                       down it sits rather than its index in the list — which
                       would make the third column wait for the first two.
                       Capped so the foot of a long column is not still
                       waiting when it is scrolled to. */
                    delay={Math.min(positionInColumn, 4) * 0.05}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(image.index)}
                      aria-label={projects.openLabel(image.label)}
                      className="block w-full cursor-zoom-in text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                    >
                      <figure
                        /* 8px, where the strip's cards are 18. The radius is
                           inherited from those cards and does not survive the
                           change of layout: 18px reads as a rounded card when
                           there is one of it at a time on a dark ground, and as
                           soft-edged clutter when there are 23 in a grid with
                           every corner meeting three others. Tighter lets the
                           wall read as a wall. */
                        className="photo-card relative overflow-hidden rounded-[8px] border border-[rgb(126_133_140/0.25)] bg-surface-2"
                        /* The photograph's own shape, which is what makes the
                           wall masonry. Inline because it is per-image: a
                           Tailwind arbitrary value built from a variable
                           compiles to nothing. `object-cover` still fits the
                           picture, so a wrong ratio here is a tile of the
                           wrong height rather than a stretched photograph. */
                        style={{
                          aspectRatio: `${image.width} / ${image.height}`,
                        }}
                      >
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          draggable={false}
                          sizes={sizes}
                          /* Lazy on every tile, including the ones above the
                             fold, and that is deliberate — see the note at the
                             top of the file on what `eager` costs here. */
                          loading="lazy"
                          /* `graded` is the near-monochrome the site grades its
                             photography to; globals.css brings a card back to
                             colour on hover. The strip also had a
                             `data-centred` rule for touch, where there is no
                             hover — here the whole wall is on screen at once
                             and there is no one tile being "shown", so colour
                             on hover is the whole of it. */
                          className="graded object-cover transition-[filter,transform] duration-500 ease-[var(--ease-out)]"
                        />

                        {/* No `backdrop-blur`: the pill's ground is opaque
                            enough that there is nothing showing through for a
                            blur to act on, and `backdrop-filter` re-rasterises
                            every frame whether or not it is on screen. The
                            measurement is in Projects.tsx. */}
                        <figcaption className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-[rgb(16_18_21/0.82)] px-2.5 py-1 font-mono text-xs tracking-tight text-bg">
                          {image.label}
                        </figcaption>
                      </figure>
                    </button>
                  </Reveal>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      <Reveal delay={0.1} className="mt-16 md:mt-20">
        <div className="flex justify-center">
          <Link
            href={projects.cta.href}
            className="inline-flex items-center rounded-full bg-ink px-7 py-3.5 text-base font-medium tracking-tight text-bg transition-transform duration-[160ms] ease-[var(--ease-out)] hover:-translate-y-0.5 active:translate-y-0"
          >
            {projects.cta.label}
          </Link>
        </div>
      </Reveal>

      <Lightbox
        image={openIndex === null ? null : PROJECT_GALLERY[openIndex]}
        onClose={closeLightbox}
      />
    </section>
  );
}
