"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { WHY_CHOOSE, WHY_CHOOSE_ZH, WHY_CHOOSE_BM } from "@/lib/content";
import { useCopy } from "@/lib/locale";

gsap.registerPlugin(ScrollTrigger);

/* Shared drawing conventions for the four marks below.

   One stroke weight for everything, scaled by the card rather than by the
   drawing: 1.1 in a 168-wide viewBox, shown at up to 220, lands at about 1.4
   device pixels - a shade above the site's own hairlines, which is right for a
   line that is the subject rather than a division between two things. Round
   caps and joins because every other line on the site is a border, and a butt
   cap on a diagonal reads as a chipped edge next to one.

   Two inks only. Blue is the thing the card is about; grey is the context it
   happens in, at the site's own `ink-3`. Dashed grey is the third state and it
   always means the same thing - where something WAS, or where it is going. */
const STROKE = {
  fill: "none",
  strokeWidth: 1.1,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** A closed arrowhead, drawn rather than marker-referenced: markers inherit
    their own stroke context and would need the same two inks declared twice. */
function Arrow({ x, y, back = false }: { x: number; y: number; back?: boolean }) {
  const d = back ? -1 : 1;
  return <path d={`M${x - 4 * d} ${y - 4} L${x} ${y} L${x - 4 * d} ${y + 4}`} {...STROKE} />;
}

/**
 * The four marks, in the order the claims arrive.
 *
 * These are drawings of the claim, not icons for it. A padlock or a handshake
 * would say "warranty" and "service" in the vocabulary of every other website;
 * a dimension line and a return arc say it in the vocabulary of the drawings
 * this company works from, which is the one the enquiry band and the product
 * band are already speaking.
 *
 * `aria-hidden` on every one of them: the claim is set as text directly
 * underneath, and a description here would say it a second time.
 */
const MARKS: ReactNode[] = [
  /* Manufacture. Billet, die, profile - the extrusion line left to right, which
     is the sentence "first local manufacturer" drawn. The chambers in the
     section at the right are what makes it aluminium rather than a bar. */
  <>
    <g className="text-ink-3" stroke="currentColor">
      <rect x="2" y="17" width="24" height="22" rx="2" {...STROKE} />
      <path d="M31 28 H55" {...STROKE} />
      <Arrow x={57} y={28} />
    </g>
    <g className="text-brand" stroke="currentColor">
      <rect x="64" y="10" width="20" height="36" rx="2" {...STROKE} />
      <rect x="70" y="21" width="8" height="14" rx="1" {...STROKE} />
      <path d="M89 28 H113" {...STROKE} />
      <Arrow x={115} y={28} />
      <path d="M124 12 H166 V44 H124 Z M124 22 H150 M150 12 V44 M150 34 H166" {...STROKE} />
    </g>
  </>,

  /* After-sales. The window goes out along the lower line and the service comes
     back over the top of it - one loop, closing on the same frame it started
     from, which is the whole of what "after-sales" means. */
  <>
    <g className="text-ink-3" stroke="currentColor">
      <rect x="2" y="14" width="40" height="30" rx="1.5" {...STROKE} />
      <path d="M22 14 V44 M31 25 V33" {...STROKE} />
      <path d="M50 40 H150" strokeDasharray="3 4" {...STROKE} />
      <Arrow x={152} y={40} />
    </g>
    <g className="text-brand" stroke="currentColor">
      <path d="M150 22 C150 6, 60 6, 52 20" {...STROKE} />
      <Arrow x={50} y={22} back />
    </g>
  </>,

  /* Try before you buy. A casement on its hinge, drawn open, with the closed
     position dashed behind it and the swing arced between them - the standard
     elevation symbol, and the one the enquiry band already uses. The apex of
     the swing marks the hinge, which is the part of the convention that has to
     be right. */
  <>
    <g className="text-ink-3" stroke="currentColor">
      <rect x="2" y="8" width="52" height="40" rx="1.5" {...STROKE} />
      <path d="M62 8 L106 8 L106 48 L62 48" strokeDasharray="3 4" {...STROKE} />
    </g>
    <g className="text-brand" stroke="currentColor">
      <path d="M62 8 L106 18 L106 38 L62 48 Z" {...STROKE} />
      <path d="M116 14 A 22 22 0 0 1 116 42" strokeDasharray="3 4" {...STROKE} />
      <Arrow x={116} y={42} back />
    </g>
  </>,

  /* Warranty. A dimension line: terminators at both ends, the span ticked off
     between them, arrows turned inward the way a measured length is written on
     a drawing. It is duration drawn as extent, which is the one thing a
     fifteen-year term actually is. */
  <>
    <g className="text-ink-3" stroke="currentColor">
      <path d="M4 12 V44 M164 12 V44" {...STROKE} />
      <path d="M30 24 V32 M56 24 V32 M82 24 V32 M108 24 V32 M134 24 V32" {...STROKE} />
    </g>
    <g className="text-brand" stroke="currentColor">
      <path d="M4 28 H164" {...STROKE} />
      <Arrow x={22} y={28} back />
      <Arrow x={146} y={28} />
    </g>
  </>,
];

/**
 * Why Choose MEVO Malaysia, laid out to the reference the client supplied.
 *
 * THE LAYOUT IS THE BRIEF. Heading across the upper right, a short standfirst
 * alone in the left column beneath it, and four cards stepping down and to the
 * left across a three-column field - the top pair in columns two and three, the
 * bottom pair in columns one and two. The last cell is left open and carries
 * the wash, which is what stops the staircase reading as a grid with a corner
 * missing. Each card is a drawn mark, a rule, and the claim.
 *
 * WHAT THAT IS INSTEAD OF. This was a photograph behind frosted panes, which is
 * the composition ProductGrid uses immediately below it, and then a ruled
 * register, which read as a table of contents. The cards are the version that
 * gives each claim its own object on the page - and the staircase is what stops
 * four objects of the same size reading as a spreadsheet.
 *
 * THE MARKS ARE DRAWINGS, NOT ICONS. See the note above MARKS.
 *
 * The wash is the reference's own gradient, in this site's blue rather than its
 * peach, and at a fraction of its strength. It is the only soft edge in the
 * section and it sits in the one cell with nothing in it.
 *
 * IT IS ALSO A CURTAIN, AND IT CARRIES ONE. The home page pulls its whole stack
 * up 200svh over the pinned hero, so the first section in that sheet has to
 * cover the hero through 100svh of rise: hence an opaque frame the full height
 * of the viewport. Underneath it is a 250svh runway - exactly ProductGrid's -
 * which pins this frame long enough for ProductGrid to be pulled up 110svh and
 * drawn over it. See the note on the runway below.
 *
 * The copy is `parts[0]` and `tagline` of WHY_CHOOSE rather than anything new,
 * so the four claims have one source and all three languages already carry them
 * translated. Nothing was written for the cards: the reference sets a hook and a
 * paragraph under each of its titles, and there is no such copy for these four
 * claims. Inventing it would be inventing what the company promises, so a card
 * carries its mark and its claim and stops there.
 */
export function WhyMevo() {
  const rootRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const whyChoose = useCopy(WHY_CHOOSE, { ZH: WHY_CHOOSE_ZH, BM: WHY_CHOOSE_BM });
  const part = whyChoose.parts[0];
  const [commitment, promise] = whyChoose.tagline;
  /* Read by index against `part.items`: the note under a claim belongs to that
     claim, and the two lists are declared beside each other in content.ts for
     exactly that reason. */
  const { lede, notes } = whyChoose.home;

  /* Where each panel sits in the three-column field from `lg` up, straight off
     the drawing: the top pair in columns two and three, the bottom pair in
     columns one and two. Held as data rather than as a conditional inside the
     class string, because the staircase IS the layout and its shape should be
     readable in one place. Below `lg` these do nothing and the panels
     auto-place. */
  const PLACES = [
    "lg:col-start-2 lg:row-start-1",
    "lg:col-start-3 lg:row-start-1",
    "lg:col-start-1 lg:row-start-2",
    "lg:col-start-2 lg:row-start-2",
  ];

  /**
   * The frame's own height, written back as a variable so it can foot-pin.
   *
   * WHY IT CANNOT JUST BE 100lvh. Four panels each carrying a drawing, a claim
   * and a note do not fit one screen on every device: a 360x640 phone came up
   * 49px short per panel and a 1024x600 desktop window 19px - measured across
   * thirteen viewports in three languages, not guessed - and `overflow-hidden`
   * on the frame means short is not short, it is CUT.
   *
   * So the frame is `min-h-[100lvh]` rather than `h-[100lvh]`: exactly a screen
   * wherever the content fits, and taller where it does not. A taller frame
   * pinned at `top: 0` would hold with its own foot below the fold and the last
   * two panels would never be reachable, so it pins by the foot instead - the
   * same `min(0px, 100lvh - height)` Stats and the /our-story frame use. The
   * only way to express that is a measured height, because CSS cannot ask an
   * element how tall it is.
   *
   * THE CURTAIN SURVIVES IT. The runway is 250svh and the frame pins from
   * `height - 100svh` until 150svh, so it holds for `250 - height`; ProductGrid
   * is pulled up 110 and reaches the top of the screen at 140. Any frame up to
   * 240svh tall still has the pin under it when the cover completes, and the
   * tallest measured here is nearer 120.
   *
   * Observed rather than measured once: the panels reflow with the URL bar and
   * with a rotation, and a stale height leaves the pin either short of the foot
   * or past it.
   */
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () =>
      frame.style.setProperty("--frame-h", `${Math.round(frame.offsetHeight)}px`);

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const heading = root.querySelector<HTMLElement>("[data-heading]");
      const ledes = gsap.utils.toArray<HTMLElement>("[data-lede]", root);
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", root);
      const notesEls = gsap.utils.toArray<HTMLElement>("[data-note]", root);
      const rules = gsap.utils.toArray<HTMLElement>("[data-rule]", root);
      const marks = gsap.utils.toArray<HTMLElement>("[data-mark]", root);

      if (reduced) {
        gsap.set([heading, ...ledes, ...cards, ...marks, ...notesEls], { autoAlpha: 1, y: 0 });
        gsap.set(rules, { scaleX: 1 });
        return;
      }

      gsap.set([heading, ...ledes], { autoAlpha: 0, y: 20 });
      gsap.set(cards, { autoAlpha: 0, y: 26 });
      gsap.set(marks, { autoAlpha: 0 });
      gsap.set(notesEls, { autoAlpha: 0, y: 8 });
      // Scaled on the axis it runs along, never on the one carrying its
      // hairline, so it stays exactly as thin the whole way across.
      gsap.set(rules, { scaleX: 0 });

      /**
       * The section assembles while it rises over the hero, not once it has
       * arrived.
       *
       * `top bottom` to `top top` is exactly the 100svh of rise: the trigger
       * opens when this section's top edge reaches the bottom of the screen and
       * closes when it reaches the top, which is the moment the frame pins. So
       * the last card lands as the movement stops, and the reader holds on a
       * finished page rather than watching one build after it has settled.
       *
       * That range is also the only one available. The frame pins for 150svh,
       * but ProductGrid's curtain starts climbing it at 40svh - anything
       * scrubbed against the pin would still be arriving while being covered.
       */
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top bottom",
          end: "top top",
          // Enough to take the jitter out of a trackpad without the cards
          // still arriving after the scroll has stopped.
          scrub: 0.5,
        },
      });

      timeline.to(heading, { autoAlpha: 1, y: 0, duration: 0.24, ease: "power1.out" }, 0.08);
      timeline.to(
        ledes,
        { autoAlpha: 1, y: 0, duration: 0.24, stagger: 0.06, ease: "power1.out" },
        0.18,
      );

      // One step per card, in the order they step down the field, so the four
      // arrive along the diagonal rather than as two rows. The mark is drawn
      // after its own card has landed - a card that arrives with its drawing
      // already on it reads as an image, and these are meant to read as sheets
      // with something drawn on them.
      cards.forEach((card, i) => {
        const at = 0.34 + i * 0.15;
        timeline.to(card, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, at);
        timeline.to(rules[i], { scaleX: 1, duration: 0.24, ease: "none" }, at + 0.06);
        timeline.to(marks[i], { autoAlpha: 1, duration: 0.24, ease: "power1.out" }, at + 0.1);
        timeline.to(notesEls[i], { autoAlpha: 1, y: 0, duration: 0.24, ease: "power1.out" }, at + 0.13);
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      aria-labelledby="why-mevo-heading"
      /**
       * 250svh, which is ProductGrid's runway to the svh - the two are the same
       * shape because they do the same job for the section after them.
       *
       * It breaks down as 100 for the frame, 40 of hold, and the 110 the
       * curtain above it is pulled up by. The frame therefore pins for 150svh;
       * ProductGrid's top edge, pulled up 110, reaches the top of the screen at
       * 140. Ten svh of slack, so the cover completes before the pin lets go
       * rather than exactly with it - the same margin every other handover on
       * this page is built on.
       */
      className="relative h-[250svh] motion-reduce:h-auto"
    >
      {/*
        `lvh` in the frame's own measures where the runway is `svh`, for the
        reason the two sections either side of this one give at length: a runway
        is a length in the scroll chain and has to hold still, but a frame has
        to COVER, and a box sized to the viewport-with-chrome leaves a strip of
        the pinned hero showing along the bottom the moment the URL bar slides
        away.

        `overflow-hidden` belongs on the frame and not on the section: on an
        ancestor of a sticky element it would make that ancestor the scrollport,
        and a scrollport that does not scroll is a sticky element that never
        sticks.

        `min-h` rather than `h`, and a foot-pin rather than `top-0`: see the
        note on the measuring effect above for why, and for why the curtain
        below is unaffected by it.

        THE FRAME IS THE FLEX COLUMN, not the padded box inside it. That box
        used to carry `h-full`, which worked while the frame was exactly a
        screen; against a frame that is now `min-h` with an auto height, a
        percentage height has nothing to resolve against and collapses to the
        content. The panels came out 250px tall with 185px of dead screen under
        them. Putting the column on the frame and giving the box `flex-1` makes
        the chain real at every link: the frame is at least a screen, the box
        takes all of it, and the grid inside takes what the heading leaves.
      */}
      <div
        ref={frameRef}
        className="sticky flex min-h-[100lvh] w-full flex-col overflow-hidden bg-bg motion-reduce:static motion-reduce:min-h-0"
        style={{ top: "min(0px, calc(100lvh - var(--frame-h, 100lvh)))" }}
      >
        {/* The glow, and it is the designer's own asset rather than a CSS
            gradient standing in for it: a 374px disc of #033492 at 20 per cent,
            blurred with a 250 standard deviation, which is not a curve any set
            of radial-gradient stops reproduces exactly. It carries a blurred
            black outline as well, which is where the grey in it comes from. 727
            bytes of SVG, so there is nothing to be gained by approximating it.

            Placed by its centre, off the frame: the drawing puts that centre at
            67.7 per cent of the frame's width and 59.5 per cent of its height,
            with the painted square almost exactly one frame-width across.
            Stretched rather than covered, matching the asset's own
            preserveAspectRatio="none". */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-[59.5%] left-[67.7%] aspect-square w-[99.8%] -translate-x-1/2 -translate-y-1/2 bg-[url(/why-mevo-glow.svg)] bg-[length:100%_100%] bg-no-repeat"
        />

        {/* THE FRAME IS A COLUMN AND THE GRID TAKES WHAT IS LEFT. That is what
            makes the four panels the same height without any of them being told
            a height: `flex-1` gives the grid the screen minus the heading, and
            two `1fr` rows split it in half. The drawing's own proportion —
            520x420 panels in a 1752x1194 frame — falls out of that arithmetic
            rather than being written down, so it holds at any viewport instead
            of only at the one it was drawn on.

            THE SIDE PADDING IS THE HOME PAGE'S, NOT THE DRAWING'S, and this
            band is not capped. Measured across the stack: Hero, ProductGrid,
            Background and Stats are all full-bleed at `px-6 md:px-8 lg:px-10`,
            so their content starts 40px from the edge of the screen at any
            width. This band was capped at 1440 with `lg:px-12`, which put it
            8px in from its neighbours at 1440 and 288px in at 1920 — against 40
            for the band directly above it and 40 for the band that is drawn
            over it. A curtain crossing between two different left margins is
            the one place that gap is impossible not to see.

            The drawing is 1752 wide with 84px margins, which is close to a
            capped composition, but the page it lives on is not one: the first
            five bands run to the edge and only the closing sheet — Projects,
            the enquiry band, the footer — is held to 1440. This is the second
            of those five.

            The top padding is the drawing's own 92 of 1194 with a floor under
            it: 7.7svh is 69px on a 900px screen and the fixed header island is
            80px tall, so on anything short it is the floor that applies — and
            that floor is 7.5rem rather than the 5.5 the rest of the site clears
            the island with. Two reasons: what sits against it here is a 59px
            heading whose cap line starts inside its own leading, so at 5.5rem
            the two came within 15px and that is inside the island's cast
            shadow; and the heading wants air above it and very little below,
            which is the balance the margins now carry between them. */}
        <div className="relative flex w-full flex-1 flex-col px-6 pt-[max(7.5rem,10svh)] pb-[max(1rem,5svh)] md:px-8 lg:px-10 lg:pb-[max(1.25rem,7.7svh)] motion-reduce:h-auto">
          <h2
            id="why-mevo-heading"
            data-heading
            /* Top left, and the largest thing in the section: 72px against the
               drawing's 1752, which is 4.11vw. It opens the section where the
               eye starts rather than sitting across the page from it. */
            className="mb-[max(0.75rem,2.4svh)] max-w-[24ch] text-[clamp(1.75rem,4.11vw,4.5rem)] leading-[1.05] font-medium tracking-tighter text-balance text-ink lg:mb-[max(1rem,3svh)]"
          >
            {part.title}
          </h2>

          {/* Three columns, two rows, and the panels step down and to the left
              across them: the top pair in columns two and three, the bottom
              pair in columns one and two. The standfirst holds the cell the top
              row leaves open at the left, and the bottom right is left to the
              glow — the two open corners sit on the same diagonal as the four
              panels, which is what stops the staircase reading as a grid with a
              corner missing.

              12px between the columns and 10px between the rows, off the
              drawing. That is a hairline's worth: the four read as one panel
              divided into quarters rather than as four separate cards, which is
              the same thing the mullions do in the product band below.

              Below `lg` the staircase has nowhere to step, so it collapses —
              two across on a tablet, and on a phone one column of four, where
              each panel turns on its side and sets its drawing beside the text
              instead of above it.

              `minmax(min-content,1fr)` rather than `minmax(0,1fr)`: the rows
              share the screen equally wherever there is enough of it, and a row
              is never squeezed below the panel inside it. That is the half of
              the fit the foot-pin does not do on its own - the frame grows, and
              this is what makes the rows grow with it. */}
          <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_repeat(4,minmax(min-content,1fr))] gap-2.5 sm:grid-cols-2 sm:grid-rows-[auto_minmax(min-content,1fr)_minmax(min-content,1fr)] lg:grid-cols-3 lg:grid-rows-2 lg:gap-x-3 lg:gap-y-2.5 motion-reduce:min-h-0 motion-reduce:flex-none">
            {/* The standfirst, in the cell the panels leave open. Two
                paragraphs, as drawn: what the company sells and who does the
                work, then what that is for. `ink-2` on the page ground is
                5.60:1 and the promise lifted to full ink is 16.9:1, so both
                clear AA for body copy with the quieter one still well inside
                it. */}
            <div className="sm:col-span-2 lg:col-span-1 lg:col-start-1 lg:row-start-1 lg:self-start">
              <p
                data-lede
                className="max-w-[42ch] text-[clamp(0.8125rem,1.7svh,1rem)] leading-[1.45] text-ink-2 lg:max-w-[34ch] lg:leading-[1.5]"
              >
                {lede}
              </p>
              <p
                data-lede
                className="mt-[max(0.375rem,1.2svh)] max-w-[42ch] text-[clamp(0.8125rem,1.7svh,1rem)] leading-[1.45] text-ink-2 lg:max-w-[34ch] lg:leading-[1.5]"
              >
                {commitment} <span className="text-ink">{promise}</span>
              </p>
            </div>

            {part.items.map((item, i) => (
              <article
                key={item}
                data-card
                className={`flex h-full flex-row items-center gap-3 border border-line bg-white p-[max(0.625rem,1.4svh)] sm:flex-col sm:items-stretch sm:justify-between sm:gap-0 lg:p-[max(1rem,2.6svh)] ${PLACES[i]}`}
                /* Flat, square and unshadowed, as drawn. The radius was 10px,
                   then 4, and the drawing has none: at any radius at all a
                   panel this size reads as a tile, and these are sheets with
                   something drawn on them.

                   The drawing puts #f2f2f2 panels on white. This is the same
                   step in tone taken the other way — white panels on the site's
                   own #f4f5f6 — because a pure white ground was ruled out once
                   already on /our-story, and every other light section on this
                   site is that grey. The hairline is what gives a panel its edge
                   at a step this small; swap the two colours and it can come
                   off.

                   `h-full` so the panel fills the cell the grid gives it, which
                   is what makes all four exactly the same height. */
              >
                <svg
                  data-mark
                  aria-hidden
                  role="presentation"
                  viewBox="0 0 168 56"
                  /* Beside the text on a phone and above it from `sm` up. Held
                     to its own ratio either way, so the stroke stays
                     proportional to the sheet it is drawn on. */
                  className="h-auto w-10 shrink-0 sm:w-full sm:max-w-[min(200px,20svh)]"
                >
                  {MARKS[i]}
                </svg>

                <div className="min-w-0">
                  {/* The rule between the drawing and the claim, and it is the
                      one that draws itself. Zero-height with a border rather
                      than a 1px background box: a background hairline rounds up
                      to two device pixels at 125% display scaling and reads
                      thicker than every other rule on the site. It has nothing
                      to divide on a phone, where the drawing is alongside the
                      text rather than over it. */}
                  <span
                    aria-hidden
                    data-rule
                    className="mt-[max(0.625rem,1.8svh)] hidden h-0 w-full origin-left border-t border-line sm:block"
                  />
                  <p className="text-[clamp(0.8125rem,1.7svh,0.9375rem)] leading-[1.2] font-medium tracking-tight text-balance text-ink sm:mt-[max(0.5rem,1.5svh)] lg:text-[clamp(0.9375rem,2.1svh,1.125rem)]">
                    {item}
                  </p>
                  {/* The note. Every one of these restates a fact the site
                      already states somewhere else — see WHY_CHOOSE.home in
                      content.ts, where each line names its source. */}
                  <p
                    data-note
                    className="mt-[max(0.25rem,0.7svh)] text-[clamp(0.6875rem,1.3svh,0.8125rem)] leading-[1.4] text-ink-2 lg:text-[clamp(0.75rem,1.6svh,0.875rem)]"
                  >
                    {notes[i]}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
