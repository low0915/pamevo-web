"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siWhatsapp } from "simple-icons";

import { ENQUIRY, ENQUIRY_ZH, ENQUIRY_BM, WHATSAPP } from "@/lib/content";
import { hasEnquiryBand, localePath, useCopy, useLocale } from "@/lib/locale";
import { Z } from "@/lib/z";

gsap.registerPlugin(ScrollTrigger);

/**
 * WHY THESE ALPHAS AND NOT OTHER ONES
 *
 * Everything in this band sits on #033392, the one saturated colour on the
 * site, and white over it is the only ink. So every level of the hierarchy is
 * an alpha, and each was computed rather than eyeballed. A dark field is where
 * that slips: white at any alpha looks legible next to the blue long before it
 * measures legible, so the numbers below are measured.
 *
 * Blended over #033392 (relative luminance 0.0446) and measured against it:
 *
 *   white        13.5:1   heading and button labels
 *   white/85      8.4:1   the paragraph
 *   white/70      6.2:1   the mono mark on the dimension line
 *   white/40      3.0:1   the drawn frame and the mullions
 *   white/25      2.0:1   the inner offset line inside the frame
 *   white/6       ~1.1:1  the graph ground
 *
 * The three that carry text clear 4.5:1, which is the bar for body copy, and
 * they clear it including the 11px mono — that is what rules out white/55,
 * which lands at 4.37:1 and is the value this kind of label usually gets given.
 *
 * white/40 is not a rounded-up guess either: 3.0:1 is exactly the threshold
 * WCAG 1.4.11 sets for a graphic you need to be able to make out, and the frame
 * is the drawing. The two below it are deliberately under that bar because they
 * are texture — if the graph paper were legible enough to read as lines it
 * would be competing with the drawing sitting on it.
 */
const INK = {
  mono: "text-white/70",
  lede: "text-white/85",
  frame: "rgb(255 255 255 / 0.4)",
  faint: "rgb(255 255 255 / 0.25)",
};

/**
 * The one mono recipe, and it is not this file's invention.
 *
 * ProductDetail, ProductSpecs, ContactBody and /privacy all set technical text
 * as 12px Geist Mono, uppercase, on wide tracking. The mark on the dimension
 * line is the same kind of text, so it is set the same way rather than in a
 * fifth variant that is nearly it. `--font-mono` resolves to Geist Mono
 * followed by the Chinese subset, so the ZH mark falls through to HarmonyOS
 * per character and the Latin word beside it stays in Geist.
 */
const MONO = "font-mono text-[0.6875rem] tracking-[0.18em] uppercase sm:text-xs";

/** Graph paper, at two scales: a 16px minor grid with a major line every fifth
    one, which is how ruled drafting paper is actually divided. Masked to an
    ellipse so it fades out into the field rather than running to the band's
    edges — a grid with a hard edge reads as a tiled image, and with the outer
    border gone the mask is the only thing giving the ground a shape. */
const GRAPH_MASK =
  "radial-gradient(ellipse 78% 68% at 50% 45%, #000 30%, transparent 100%)";

const GRAPH = {
  backgroundImage: [
    "linear-gradient(to right, rgb(255 255 255 / 0.06) 1px, transparent 1px)",
    "linear-gradient(to bottom, rgb(255 255 255 / 0.06) 1px, transparent 1px)",
    "linear-gradient(to right, rgb(255 255 255 / 0.1) 1px, transparent 1px)",
    "linear-gradient(to bottom, rgb(255 255 255 / 0.1) 1px, transparent 1px)",
  ].join(","),
  backgroundSize: "16px 16px, 16px 16px, 80px 80px, 80px 80px",
  maskImage: GRAPH_MASK,
  WebkitMaskImage: GRAPH_MASK,
};

/**
 * The elevation's proportions, and the one number the copy has to agree with.
 *
 * The mullions stand at 15% and 85%, which leaves two narrow fixed lights and a
 * wide centre pane — the arrangement a three-part aluminium window is actually
 * built in, and the reason the copy has somewhere to sit.
 *
 * COPY_PANE is what holds the text off the mullions, and it is 18% rather than
 * 15% so it clears the glass line instead of touching it. It is also the
 * constraint that sets the heading's cap below: at the 1440 container the
 * centre pane is about 930px and the copy box about 876px, and the longer
 * heading line at 48px needs roughly 700px of that. Change one of these three
 * and check the other two — a heading that wraps to three lines here is a third
 * of the band's height, and the band is meant to be short.
 */
const MULLION_LEFT = "15%";
const MULLION_RIGHT = "85%";
const COPY_PANE = "lg:px-[18%]";

/**
 * The closing band: an enquiry, set inside a drawing of the thing being sold.
 *
 * Mounted once in Shell, beside the header and the footer, so it is the same
 * band on every route in all three languages rather than a section pasted into
 * each page. That is what "the same on every page" has to mean structurally — a
 * shared component, not a shared design that drifts.
 *
 * WHY A DRAWING, AND WHY THIS BLUE
 * --------------------------------
 * #033392 is already the site's one saturated field, used by PageBanner at the
 * head of /our-products and /contact. It is also, as it happens, a cyanotype
 * blue, so the band costs no new colour: the page opens on the brand field and
 * closes on it.
 *
 * What is drawn on it is a window in elevation — outer frame, two mullions, the
 * side lights carrying the standard casement opening symbols — and the copy
 * sits in the centre pane, in the glass. The composition is the argument. A
 * stock photograph of a building would say the company sells windows; a
 * correctly drawn elevation with the right symbols on it says someone here
 * specifies them.
 *
 * The band is deliberately short. It carried a title block under the elevation
 * — three profile dimensions and the phone, email and showroom — and it is
 * gone: the footer sits immediately below and already prints the number, the
 * email and the address, so the block was the same page repeating itself in
 * two consecutive bands, and it made the drawing tall enough to need scrolling
 * past. What is left is one drawing and one thing to do.
 *
 * NOT ON /contact
 * ---------------
 * The band exists to send a reader to /contact, and on /contact it would be a
 * link to the page being read, directly above the footer, under a form asking
 * for the same thing. Suppressed by pathname rather than by a prop, because
 * Shell renders `children` opaquely and cannot know which route is inside it.
 * `enPath` first, so /bm/contact and /zh/contact are covered by the one
 * comparison — matching a literal "/contact" would have left the band on both
 * translated contact pages, which is exactly the sort of thing nobody notices
 * for months.
 */
export function EnquiryBand() {
  const rootRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const { locale } = useLocale();
  const copy = useCopy(ENQUIRY, { ZH: ENQUIRY_ZH, BM: ENQUIRY_BM });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      const copyBlocks = gsap.utils.toArray<HTMLElement>("[data-copy]", root);
      const across = gsap.utils.toArray<HTMLElement>(
        "[data-draw='across']",
        root,
      );
      const down = gsap.utils.toArray<HTMLElement>("[data-draw='down']", root);
      const symbols = gsap.utils.toArray<HTMLElement>(
        "[data-draw='symbol']",
        root,
      );
      const notes = gsap.utils.toArray<HTMLElement>("[data-draw='note']", root);

      // Reduced motion gets the finished sheet. Not a shortened version of the
      // sequence — a drawing assembling itself is the whole effect, and there
      // is no gentle version of it.
      if (reduced) {
        gsap.set([...copyBlocks, ...notes], { autoAlpha: 1, y: 0 });
        gsap.set([...across, ...symbols], { scaleX: 1 });
        gsap.set(down, { scaleY: 1 });
        return;
      }

      gsap.set(copyBlocks, { autoAlpha: 0, y: 18 });
      gsap.set(notes, { autoAlpha: 0, y: 8 });
      gsap.set(across, { scaleX: 0 });
      gsap.set(down, { scaleY: 0 });
      gsap.set(symbols, { scaleX: 0 });

      const timeline = gsap.timeline({
        // 78% rather than the 68% Stats uses. This band is the last thing on
        // the page with the footer directly under it, so by the time its top
        // edge is two thirds up the viewport the reader has reached the end of
        // the document and stopped; starting earlier gives the sequence
        // somewhere to run while they are still arriving.
        scrollTrigger: { trigger: root, start: "top 78%", once: true },
      });

      // The copy first and the drawing after it, which is the order PageBanner
      // settled on for the same reason: a trace that had to finish before the
      // heading appeared would be seconds of blue with nothing to read in it.
      // This way the band is legible almost at once and the sheet draws itself
      // in behind the words.
      timeline.to(copyBlocks, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.09,
        ease: "power3.out",
      });

      // Then one hand: the dimension line out from the title, the frame down
      // and across, the mullions after it, and the opening symbols struck out
      // from their hinges last — the order the lines would actually be laid
      // down in.
      timeline.to(
        across,
        { scaleX: 1, duration: 1.1, stagger: 0.08, ease: "power2.inOut" },
        0.15,
      );
      timeline.to(
        down,
        { scaleY: 1, duration: 0.95, stagger: 0.09, ease: "power2.inOut" },
        0.3,
      );
      timeline.to(
        symbols,
        { scaleX: 1, duration: 0.7, stagger: 0.12, ease: "power2.out" },
        0.9,
      );
      timeline.to(
        notes,
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" },
        1,
      );
    }, root);

    return () => ctx.revert();
  }, []);

  // See the note on the component. After the hooks and never before them: an
  // early return above `useEffect` changes how many hooks run between one route
  // and the next, which React treats as a different component.
  if (!hasEnquiryBand(pathname)) return null;

  return (
    <section
      ref={rootRef}
      /* No curtain of its own any more, and no `sheet`.

         This band lifting while the footer stayed put was the thing that read
         wrong: half of what closes the page moved and the other half did not.
         Both now sit inside components/site/ClosingSheet.tsx, which carries the
         overlap, the shadow and the travel for the pair. This is just the band
         again.

         `relative` and `Z.raised` stay for the home page, which pulls its whole
         stack up over a pinned hero inside a raised sheet — an unraised sibling
         after it is painted under that sheet and vanishes. */
      className="relative overflow-hidden bg-brand px-4 py-10 md:px-8 md:py-12 lg:px-12 lg:py-16"
      style={{ zIndex: Z.raised }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={GRAPH}
      />

      {/* There WAS a second border out here, framing the whole band like a
          drawing sheet with the elevation inside it. Two nested rectangles is
          one too many: at a glance the outer one read as the window and the
          real drawing read as a panel inside it, which is the opposite of what
          the band is for. The elevation is the only frame now, and the graph
          ground carries the sheet on its own. */}
      <div className="relative mx-auto w-full max-w-[1440px]">
        {/* The dimension line, with the drawing's title set into the break in
            it. The two halves grow outward from the mark rather than both
            running left to right, so the name is placed and the line is
            measured off it. */}
        <div aria-hidden className="flex items-center gap-3 sm:gap-5">
          <span
            className="h-3 w-px shrink-0"
            style={{ background: INK.frame }}
          />
          <span
            data-draw="across"
            className="h-px flex-1 origin-right"
            style={{ background: INK.frame }}
          />
          <span
            data-draw="note"
            className={`${MONO} ${INK.mono} shrink-0 text-center`}
          >
            {copy.systemMark}
          </span>
          <span
            data-draw="across"
            className="h-px flex-1 origin-left"
            style={{ background: INK.frame }}
          />
          <span
            className="h-3 w-px shrink-0"
            style={{ background: INK.frame }}
          />
        </div>

        {/* The elevation. Everything drawn on it is an absolutely positioned
            rule at a percentage, which is how PageBanner draws its hairlines
            and why both survive being resized: nothing here is pinned to a
            pixel except the 1px thickness itself, which is held rather than
            scaled so it never lands on a fraction of a device pixel and greys
            out. The box's height comes from the copy inside it. */}
        <div className="relative mt-5 sm:mt-6">
          <div aria-hidden className="absolute inset-0">
            {/* Outer frame, drawn as four rules rather than as a border so each
                can be traced from the end a hand would start it. */}
            <span
              data-draw="across"
              className="absolute inset-x-0 top-0 h-px origin-left"
              style={{ background: INK.frame }}
            />
            <span
              data-draw="across"
              className="absolute inset-x-0 bottom-0 h-px origin-right"
              style={{ background: INK.frame }}
            />
            <span
              data-draw="down"
              className="absolute inset-y-0 left-0 w-px origin-top"
              style={{ background: INK.frame }}
            />
            <span
              data-draw="down"
              className="absolute inset-y-0 right-0 w-px origin-top"
              style={{ background: INK.frame }}
            />

            {/* The second line inside the first: an aluminium frame has depth
                and one line cannot show it. Inset in absolute pixels rather
                than a percentage, because a profile is sixty-odd millimetres
                deep whatever size the opening is — a percentage would have it
                grow with the window, which is precisely what a frame does
                not do. */}
            <span
              data-draw="across"
              className="absolute top-[9px] right-[9px] left-[9px] h-px origin-left"
              style={{ background: INK.faint }}
            />
            <span
              data-draw="across"
              className="absolute right-[9px] bottom-[9px] left-[9px] h-px origin-right"
              style={{ background: INK.faint }}
            />
            <span
              data-draw="down"
              className="absolute top-[9px] bottom-[9px] left-[9px] w-px origin-top"
              style={{ background: INK.faint }}
            />
            <span
              data-draw="down"
              className="absolute top-[9px] right-[9px] bottom-[9px] w-px origin-top"
              style={{ background: INK.faint }}
            />

            {/* The mullions, and with them the side lights. Below `lg` they are
                gone and the elevation is a single pane: at 15% of a phone the
                lights are 50px slivers, which is not a window, and the centre
                pane left over would be too narrow to set a heading in. A
                one-pane window is still a window. */}
            <span
              data-draw="down"
              className="absolute inset-y-0 hidden w-px origin-top lg:block"
              style={{ left: MULLION_LEFT, background: INK.frame }}
            />
            <span
              data-draw="down"
              className="absolute inset-y-0 hidden w-px origin-top lg:block"
              style={{ left: MULLION_RIGHT, background: INK.frame }}
            />

            {/* The casement opening symbols, one per side light.

                This is the detail that either lands or gives the whole band
                away, and it was drawn backwards the first time.

                THE APEX MARKS THE HINGE. It sits at mid-height on the hinged
                stile and the two legs run to the corners of the opposite one,
                dashed for an outward-opening sash — the convention Schueco,
                Reynaers and most European system drawings use, and the one a
                Malaysian specifier will read it by. Both lights are hung off
                the outer jambs, which is how a three-part window with a fixed
                centre is normally made, so both apexes point outward and the
                handles meet at the mullions.

                It first pointed the other way, which said the side lights were
                hinged on the mullions and swung open from the jambs. Nobody
                builds that. If the client draws the other convention — apex on
                the opening edge, which some North American offices use — this
                is the one place to change it.

                Written out twice rather than mirrored with a transform,
                because a mirror would reverse the dash phase too and the pair
                would stop reading as a pair.

                `preserveAspectRatio="none"` lets each symbol fill a pane of
                whatever proportion, and `vectorEffect` keeps the stroke a
                hairline while it does. Traced by scaling the wrapper out from
                the hinge rather than by a dash offset: these lines are already
                dashed, and an offset animation on a dashed stroke fights the
                pattern it is drawn with. */}
            <div
              data-draw="symbol"
              className="absolute top-[14%] bottom-[14%] left-[2%] hidden w-[11%] origin-left lg:block"
            >
              <svg
                viewBox="0 0 100 200"
                preserveAspectRatio="none"
                className="h-full w-full"
                fill="none"
                stroke={INK.frame}
                strokeWidth="1"
                strokeDasharray="6 5"
              >
                <path d="M0 100 L100 0" vectorEffect="non-scaling-stroke" />
                <path d="M0 100 L100 200" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            <div
              data-draw="symbol"
              className="absolute top-[14%] right-[2%] bottom-[14%] hidden w-[11%] origin-right lg:block"
            >
              <svg
                viewBox="0 0 100 200"
                preserveAspectRatio="none"
                className="h-full w-full"
                fill="none"
                stroke={INK.frame}
                strokeWidth="1"
                strokeDasharray="6 5"
              >
                <path d="M100 100 L0 0" vectorEffect="non-scaling-stroke" />
                <path d="M100 100 L0 200" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          </div>

          {/* The copy, in the glass. `COPY_PANE` is what holds it off the
              mullions — read the note there before changing either. */}
          <div
            className={`relative px-4 py-9 text-center sm:px-8 sm:py-11 lg:py-14 ${COPY_PANE}`}
          >
            {/* Two lines because it is two strings, not because a width is
                holding it to two. Each is its own block, so the break falls
                between the sentences on a phone, on a laptop and in all three
                languages — see ENQUIRY in lib/content.ts.

                Which guarantees WHERE the break is, not how many there are: a
                sentence too long for its line still wraps inside its own block,
                and at a 1.75rem floor it did — on a 360px phone, in English and
                in Malay. Hence the 1.625rem floor here, and hence both English
                sentences being 27 characters. Measured in a browser at 360,
                390, 430 and 768, not estimated from character counts, because
                the estimate is what said 1.75rem was fine.

                `h2`, not `h1`. This renders inside every page, each of which
                already has one, and it is the closing note rather than what the
                page is about. Capped at 3rem for the same reason: PageBanner's
                h1 runs to 120px and nothing here should be shouting over it. */}
            <h2
              data-copy
              className="mx-auto text-[clamp(1.625rem,2.6vw,3rem)] leading-[1.06] font-medium tracking-tighter text-balance text-white"
            >
              {copy.heading.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>

            <p
              data-copy
              /* 52ch, and the lede is written to fill about two of them. See
                 ENQUIRY in lib/content.ts — the measure and the length of the
                 sentence are one decision made in two files. */
              className={`mx-auto mt-4 max-w-[52ch] text-base leading-relaxed text-pretty ${INK.lede}`}
            >
              {copy.lede}
            </p>

            <div
              data-copy
              className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              {/* Ink on white: 19.4:1, and the one solid element on the field.
                  `localePath` rather than a bare "/contact" — from /bm this has
                  to reach /bm/contact, or the band drops the reader out of
                  their own language at the exact moment they act. */}
              <Link
                href={localePath("/contact", locale)}
                className="inline-flex w-full items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-medium text-ink transition-[background-color,transform] duration-[160ms] ease-[var(--ease-out)] hover:bg-bg active:scale-[0.97] sm:w-auto"
              >
                {copy.primary}
              </Link>

              {/* The same link the header and the footer use, from WHATSAPP, so
                  there is one number on the site rather than three.

                  WhatsApp green, from `siWhatsapp.hex` so the colour and the
                  mark come from one place. Inline because Tailwind cannot
                  compile a class built from a runtime value.

                  INK on the green, where the header's copy of this button puts
                  a white mark on it. The difference is not an oversight: this
                  one carries a LABEL, and white on #25D366 measures 1.98:1
                  against a 4.5 bar — the ratio WhatsApp itself ships, fine for
                  a recognisable glyph and not for a line of type. Ink is 9.5:1.
                  It also pairs the two buttons, which are now both solid with
                  ink on them, one white and one green. */}
              <a
                href={WHATSAPP.url}
                target="_blank"
                rel="noreferrer"
                style={{ backgroundColor: `#${siWhatsapp.hex}` }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-ink transition-[filter,transform] duration-[160ms] ease-[var(--ease-out)] hover:brightness-95 active:scale-[0.97] sm:w-auto"
              >
                <svg
                  viewBox="0 0 24 24"
                  width={15}
                  height={15}
                  fill="currentColor"
                  aria-hidden
                >
                  <path d={siWhatsapp.path} />
                </svg>
                {copy.secondary}
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
