"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PRODUCT_GRID, PRODUCT_GRID_ZH, PRODUCT_GRID_BM } from "@/lib/content";
import { useCopy } from "@/lib/locale";
import { PRODUCTS } from "@/lib/products";

gsap.registerPlugin(ScrollTrigger);

/**
 * The six products the band shows, by slug: three windows, then three doors.
 *
 * The order is the layout. Above `md` the grid is three across, so the first
 * three fill the top row and the last three the bottom, and the band reads as
 * one row of each — the whole catalogue in two lines. Below `md` it is two
 * across and that pairing necessarily breaks; the run of three windows followed
 * by three doors is still the order they arrive in.
 *
 * Within each three, one per kind rather than three of a kind: casement,
 * sliding and panoramic across the top; panoramic, bifold and entry beneath.
 * Six products from one family would say less about the range than six from
 * six, and the range is what a band on the home page is for.
 *
 * Slugs rather than titles, so a name can only ever come from the catalogue
 * itself and the two can never drift apart. A slug that no longer exists drops
 * out of the band instead of rendering an empty pane behind a dead link — which
 * would also cost a row its third pane, so anything changed here should keep
 * the count at six and the split at 3/3.
 */
const FEATURED = [
  // Windows.
  "dm106-casement-window",
  "dm132-sliding-window",
  "dm15-slimline-panoramic-window",
  // Doors.
  "dm27-slimline-panoramic-door",
  "dm80-biofold-door",
  "fortune-deer-entry-door",
];

/**
 * Padding above a pane's name, in the two cases a pane can be in.
 *
 * The band's frame is `sticky top-0`, so the top row's own top edge is the top
 * of the viewport — and the first 80px of that belong to the fixed header
 * island, which floats over every section and is exactly `top-4` plus its own
 * `h-16`. A name set against the pane's ordinary padding sits underneath it.
 *
 * 88px at the narrow end rather than the 96 the Background section uses, and
 * the 8px between the two is not fussiness. Below `md` this grid is three rows
 * deep inside one viewport, so a row on a 640px-tall phone is 213px and every
 * step of clearance comes directly out of the space a four-word product name
 * has to wrap in. 88 clears the island with 8px to spare and buys a line back.
 * From `sm` up the rows are tall enough that the question stops being a
 * question and this falls in with the rest of the site.
 *
 * Written as complete sets rather than as an override on top of a shorthand, so
 * a pane gets exactly one `padding-top` per breakpoint and the cascade never
 * has to be reasoned about: `p-*` and `pt-*` from different variants do not
 * compose the way they read, and `sm:p-6` would quietly undo an unprefixed
 * `pt-24`.
 */
const CLEAR_HEADER = "pt-[5.5rem] sm:pt-24 md:pt-28 lg:pt-32";
const PANE_TOP = "pt-4 sm:pt-6 md:pt-8 lg:pt-10";
/** The third pane: second row while the grid is two across, first row once it
    is three across, so it clears the island only from `md` up. */
const PANE_TOP_THEN_CLEAR = "pt-4 sm:pt-6 md:pt-28 lg:pt-32";

/**
 * The product band: a glazed window, six panes to it.
 *
 * One photograph fills the section and the panes are laid over it edge to edge,
 * three across and two down, so the picture is never seen except through glass.
 * The lines between them are the mullions, and they draw themselves when the
 * band comes into view.
 *
 * The composition is the subject: the section is a window, and the company
 * makes windows.
 *
 * The glass is sharp rather than light: 12px of blur, which is barely frosting
 * at all and leaves the frame, the sill and the shadow across it reading as
 * themselves through the panes. That is a choice against the other one — blur
 * and tint are a single contrast budget, and buying the picture back costs 0.58
 * of tint where 110px of blur would have cost 0.26. The panes are darker than
 * any other glass on this site, and the picture is worth seeing.
 *
 * Where the budget comes from was measured off the photograph, not judged by
 * eye; by eye it was wrong by 50 luminance and the first cut of this band
 * failed AA on a phone. The sunlit shaft across the sill runs to 252, and
 * `object-cover` puts it under a product name at some viewport whatever the
 * crop. Worst backdrop a name lands on, per viewport:
 *
 *   390x844    2x3   name 18px, needs 4.5:1  4.75:1   <- the tight one
 *   360x640    2x3   name 18px, needs 4.5:1  4.84:1
 *   2560x1080  3x2   name 28px, needs 3:1    4.82:1
 *   1920x1080  3x2   name 28px, needs 3:1    4.86:1
 *   1440x900   3x2   name 28px, needs 3:1    4.90:1
 *   1112x834   3x2   name 28px, needs 3:1    4.90:1
 *   834x1112   3x2   name 24px, needs 3:1    5.28:1
 *
 * A phone is the only width where the name is small enough for WCAG to ask 4.5
 * of it rather than 3, which is what makes it the binding case at this blur.
 * The top row is measured from its cleared padding down rather than from its
 * own edge — see CLEAR_HEADER. That clearance is not free: it lands those three
 * names on a brighter part of the picture and cost two hundredths of tint.
 * Neither is negotiable from here: the numbers above are what the tint is set
 * by, so a lighter pane needs a heavier blur or a darker photograph, not a
 * smaller number. See `.glass-tile` in globals.css for the curve.
 *
 * Three across and two down above `md`; two across and three down below it,
 * where three columns would leave each product name a four-word column an inch
 * wide. The mullions are two sets for the same reason, and each set is hidden
 * at the width the other one is drawn at.
 */
export function ProductGrid() {
  const rootRef = useRef<HTMLElement>(null);
  const copy = useCopy(PRODUCT_GRID, { ZH: PRODUCT_GRID_ZH, BM: PRODUCT_GRID_BM });

  const products = FEATURED.map((slug) =>
    PRODUCTS.find((product) => product.slug === slug),
  ).filter((product): product is (typeof PRODUCTS)[number] => Boolean(product));

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const verticals = gsap.utils.toArray<HTMLElement>("[data-rule='v']", root);
      const horizontals = gsap.utils.toArray<HTMLElement>("[data-rule='h']", root);
      const panes = gsap.utils.toArray<HTMLElement>("[data-pane]", root);
      const bodies = gsap.utils.toArray<HTMLElement>("[data-pane-body]", root);

      if (reduced) {
        gsap.set([...verticals, ...horizontals], { scaleX: 1, scaleY: 1 });
        gsap.set([...panes, ...bodies], { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.set(verticals, { scaleY: 0 });
      gsap.set(horizontals, { scaleX: 0 });
      // The panes fade rather than travel. They share their edges with each
      // other, so a pane that moves opens a seam of bare photograph along the
      // one it moved away from — the copy inside it rises instead, which reads
      // as the same arrival without breaking the field.
      gsap.set(panes, { autoAlpha: 0 });
      gsap.set(bodies, { autoAlpha: 0, y: 14 });

      const timeline = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 70%", once: true },
      });

      // Drawn the way the frame was built: the mullions first, top to bottom
      // and then across, and the glazing after them. `--ease-draw`'s GSAP
      // equivalent — a stroke that is watched over its whole length wants its
      // speed in the middle, not in the first fifth.
      timeline.to(
        verticals,
        { scaleY: 1, duration: 0.9, ease: "power2.inOut", stagger: 0.12 },
        0,
      );
      timeline.to(
        horizontals,
        { scaleX: 1, duration: 1.1, ease: "power1.inOut", stagger: 0.12 },
        0.35,
      );

      timeline.to(
        panes,
        { autoAlpha: 1, duration: 0.7, ease: "power2.out", stagger: 0.08 },
        0.45,
      );
      timeline.to(
        bodies,
        { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 },
        0.55,
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      aria-labelledby="product-grid-heading"
      /**
       * THE CURTAIN, AND THE RUNWAY THAT LETS THE NEXT ONE HAPPEN.
       *
       * `-mt-[110svh]` pulls this band up over the frame WhyMevo is holding
       * above it, and `sheet` is the lip of shadow that sells it as a panel
       * lifting over rather than a hard cut. Same pull-up, same class and the
       * same arithmetic as the curtain Background already draws over this
       * section — one gesture, used three times down the page.
       *
       * The 110 is one full screen plus 10svh, so the cover completes before
       * the pin above lets go rather than exactly with it. WhyMevo's runway is
       * 250svh holding a 100lvh frame, so that frame pins for 150 and this
       * section's top edge reaches the top of the screen at 140.
       *
       * The runway is unchanged at 250svh and is what Background is pulled up
       * over in turn: 100 for the frame, 40 of hold, 110 for the curtain. This
       * band is now both ends of a handover, which is why the two numbers have
       * to stay in step — shortening either one strands the curtain on the
       * other side of it.
       *
       * `motion-reduce:mt-0` puts it back in flow with the pins: none of this
       * exists when the frames do not stick.
       */
      className="sheet relative -mt-[110svh] h-[250svh] motion-reduce:mt-0 motion-reduce:h-auto"
    >
      {/* `lvh`, where the runway around it is `svh`, for the reason the two
          sections either side of this one give at length: the runway is a
          length in the scroll chain and has to hold still, but this frame has
          to COVER, and a box sized to the viewport-with-chrome leaves a strip
          of page showing along the bottom the moment the URL bar slides away.

          `overflow-hidden` belongs here and not on the section. On an ancestor
          of a `sticky` element it would make that ancestor the scrollport, and
          a scrollport that does not scroll is a sticky element that never
          sticks — the band would simply scroll past and there would be nothing
          for the curtain to be drawn over. */}
      <div className="sticky top-0 flex h-[100lvh] w-full overflow-hidden bg-ink motion-reduce:static motion-reduce:h-auto motion-reduce:min-h-[86vh]">
        {/* Decorative, and behind glass at that: the picture carries no
            information the copy does not, so it takes an empty alt rather than a
            description that would have to be written twice over for the two
            languages. */}
        <Image
          src="/landing-product-bg.png"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          quality={78}
          className="object-cover object-center"
        />

        <h2 id="product-grid-heading" className="sr-only">
          {copy.heading}
        </h2>

        <div className="relative grid w-full grid-cols-2 grid-rows-3 md:grid-cols-3 md:grid-rows-2">
          {products.map((product, i) => (
            <Link
              key={product.slug}
              data-pane
              href={copy.href(product.slug)}
              aria-label={copy.aria(product.title)}
              className={`group glass-tile relative flex min-h-[7rem] flex-col items-start justify-between px-4 pb-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white sm:px-6 sm:pb-6 md:px-8 md:pb-8 lg:px-10 lg:pb-10 ${
                i < 2 ? CLEAR_HEADER : i === 2 ? PANE_TOP_THEN_CLEAR : PANE_TOP
              }`}
            >
              {/* The hover state: the pane fades from the window behind it to
                  the product in front of it. One wrapper carries both the
                  photograph and the tint over it and fades as a unit, so the
                  two can never be out of step and the type never sits on a bare
                  photograph for a frame.

                  That tint is `.glass-tile`'s own 0.58, and it is what makes
                  this safe without measuring twenty product shots. These are
                  catalogue photographs on near-white grounds; white text over a
                  pure white ground under 0.58 holds 4.65:1, which is above the
                  4.5 a phone asks for. Any product image that could ever be put
                  here is covered by the worst case rather than by the ones that
                  happen to be in the catalogue today.

                  A wrapper rather than a background on the pane, for the same
                  reason the white wash it replaces was one: `.glass-tile` is
                  unlayered and wins over any utility trying to change what it
                  paints.

                  Focus gets it too. A keyboard reader has the outline to tell
                  them where they are, but not the picture, and the picture is
                  the content. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[320ms] ease-[var(--ease-out)] group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <Image
                  src={product.images[0].src}
                  alt=""
                  fill
                  /* A third of the screen from `md` up, half of it below.
                     Nothing here is ever shown at full width. */
                  sizes="(min-width: 768px) 34vw, 50vw"
                  quality={70}
                  /* Six photographs that are only ever seen on hover, in a
                     band the reader has to scroll to. Loading them eagerly
                     would cost every reader six images to serve the ones who
                     point at a pane. */
                  loading="lazy"
                  className="object-cover"
                />
                <span className="absolute inset-0 bg-[rgb(16_18_21/0.58)]" />
              </span>

              {/* Name at the head, arrow at the foot, and the space between them
                  is the pane's own height — `justify-between` on the column, so
                  the two sit on the pane's opposite edges however tall it is. */}
              <span
                data-pane-body
                className="relative max-w-[15ch] text-[1.125rem] leading-[1.15] font-medium tracking-tight text-white sm:text-[1.25rem] md:text-2xl lg:text-[1.75rem]"
              >
                {product.title}
              </span>

              {/* The one mark that says the pane is a way through rather than a
                  caption. It leans the way it travels, and moves that way on
                  hover. `aria-hidden`: the link is already named above. */}
              <span
                data-pane-body
                aria-hidden
                className="relative mt-4 text-white transition-transform duration-[220ms] ease-[var(--ease-out)] group-hover:translate-x-1 group-hover:-translate-y-1 md:mt-6"
              >
                {/* Phosphor, as everywhere else on the site, and its `ssr` entry
                    so the mark is in the HTML rather than waiting on hydration.
                    `regular` at this size: `bold` reads as a button's chevron,
                    and this is a direction, not a control.

                    Full white, where it would rather be 75%. Against the
                    brightest pane the material leaves it at 4.34:1 at full
                    strength and 3.86:1 at 90%, and 3 is the bar for a mark
                    that carries meaning. Held at full strength anyway: the
                    tint under it is set by the name, and a name is what moves
                    if the photograph is ever changed. The size is what keeps
                    the arrow quiet instead. */}
                <ArrowUpRight size={24} weight="regular" />
              </span>
            </Link>
          ))}

          {/* The mullions, over the glazing and out of the way of it: the panes
              are links edge to edge, and a line across them would take the clicks
              that land on it.

              A zero-width box with a border rather than a 1px background box.
              A background hairline rounds up to two device pixels at 125% display
              scaling and reads thicker than everything around it; a border snaps
              to the pixel grid the way every other rule on this site does.

              Each is scaled from the end it is drawn from, and the axis that
              carries the hairline is never the axis that is scaled, so the line
              stays exactly as thin while it draws. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {/* Two across, three down: one mullion between the columns, two
                between the rows. */}
            <div
              data-rule="v"
              className="absolute top-0 left-1/2 h-full w-0 origin-top border-l border-[rgb(255_255_255/0.3)] md:hidden"
            />
            <div
              data-rule="h"
              className="absolute top-[33.3333%] left-0 h-0 w-full origin-left border-t border-[rgb(255_255_255/0.3)] md:hidden"
            />
            <div
              data-rule="h"
              className="absolute top-[66.6667%] left-0 h-0 w-full origin-left border-t border-[rgb(255_255_255/0.3)] md:hidden"
            />

            {/* Three across, two down: two mullions between the columns, one
                between the rows. */}
            <div
              data-rule="v"
              className="absolute top-0 left-[33.3333%] hidden h-full w-0 origin-top border-l border-[rgb(255_255_255/0.3)] md:block"
            />
            <div
              data-rule="v"
              className="absolute top-0 left-[66.6667%] hidden h-full w-0 origin-top border-l border-[rgb(255_255_255/0.3)] md:block"
            />
            <div
              data-rule="h"
              className="absolute top-1/2 left-0 hidden h-0 w-full origin-left border-t border-[rgb(255_255_255/0.3)] md:block"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
