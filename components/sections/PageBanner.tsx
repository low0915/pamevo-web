import type { CSSProperties } from "react";
import Image from "next/image";

import { Z } from "@/lib/z";

/**
 * The banner at the head of a page: a solid brand-blue field, the heading and
 * its paragraph set into the bottom-left corner, white hairlines dividing the
 * empty upper half, and — where a page has one — a cut-out laid diagonally
 * across the right so it crosses from the blue onto the page's own ground.
 *
 * Built from the Figma frame (node 82:12), a 1920x720 band. Every position
 * below is that frame's own geometry expressed as a fraction of the band, so
 * the composition scales with the viewport rather than being correct at one
 * width: the blue field ends at 1492/1920, the rule sits at 250/720, the figure
 * starts at 953/1920. Working in fractions rather than on a fixed canvas is
 * what makes the band responsive at all — from `md` up there is no second
 * desktop layout, only this one, resized.
 *
 * Shared rather than copied. /our-products and /contact are the same banner
 * with different words and a different overlay, and the geometry here is a
 * hundred-odd tuned fractions — two copies of that would agree on the day they
 * were written and never again.
 *
 * Height, and why it is not simply the frame's aspect ratio
 * ---------------------------------------------------------
 * `aspect-[1920/720]` alone gives a 384px band on a 1024px laptop, which is
 * not enough room for an 85px heading and the lines under it, and a 960px
 * band on a 2560px monitor, which is most of the screen. So the ratio is
 * fenced at both ends: under ~1280px the floor takes over and the band grows
 * squarer, over ~2030px the ceiling holds it at 760. Either way the vertical
 * fractions redistribute over the new height and the composition survives,
 * because nothing in it is pinned to a pixel.
 *
 * The figure is allowed out of the band at the foot, and the section clips one
 * axis rather than both to let it: `overflow-x-clip` instead of
 * `overflow-hidden`. The distinction is load-bearing. `hidden` clips both axes
 * and there is no way to ask for one - CSS blockifies the other axis to `auto`
 * the moment one is `hidden`, so `overflow-x: hidden; overflow-y: visible` is
 * not a thing that exists. `clip` does not blockify, so `overflow-x: clip` next
 * to a visible y is exactly the pair wanted here: the horizontal bleed, which
 * every figure has and which would otherwise put a scrollbar across the whole
 * page, is still cut off at the band's edge; the vertical spill is let out.
 *
 * The figure is `pointer-events-none` and `Z.raised` because of where it spills
 * TO. It lands on top of the section below, whose own content is wrapped in
 * motion elements - those carry transforms, a transform makes a stacking
 * context, and stacking contexts painted later in the document win against a
 * positioned element with no z-index of its own. The z-index puts the figure
 * back on top; the pointer-events keep a picture that now hangs over a form
 * from swallowing clicks meant for it.
 *
 * Stacking is otherwise the frame's own: field, overlay, ground, rules, figure,
 * copy. A figure is a transparent cut-out, so where it crosses the blue it shows the
 * subject alone rather than a plate around it — that crossing is the point of
 * the band, and it is why such a source has to stay a PNG with its alpha
 * intact. The copy sits above the figure rather than under it, so a long
 * translation runs over it instead of being clipped by it; at the designed
 * width the two do not touch, and since both scale together they never begin
 * to.
 *
 * Below `md` the field goes full width — there is no room to leave a margin —
 * the figure moves up into the empty half as a centred cut-out, and the rules
 * redraw on wider fractions so a phone gets three divisions instead of a grid
 * too fine to read. The floating glass header sits over the top of the band,
 * where the design leaves the blue empty; the mobile figure starts below it.
 */

/** 250/720: the crossing the rules are built around, used on three of them. */
const RULE_Y = "34.722%";

/**
 * How far the overlay is brought up, and how far down the band it carries.
 *
 * The two together are the whole dial - the strength decides how much of the
 * picture survives the blend, the mask decides how much of the band it survives
 * on - so they live next to each other rather than being buried in the class
 * list of the element they apply to.
 *
 * 0.55 was picked by rendering 0.22, 0.4, 0.55 and 0.75 and looking. Under 0.4
 * the overlay is a texture and the subject is not readable as a building; past
 * 0.6 the sky in the top corner starts to wash out and the field reads as a
 * photograph with a blue cast rather than as the site's one saturated colour.
 * 0.55 is where the building is plainly there and the blue is still the blue.
 *
 * The mask still clears the foot of the band. That is not a strength decision
 * and does not move with this one: the heading and its paragraph sit in that
 * last stretch and want flat field under them, whatever is happening above.
 */
const OVERLAY_STRENGTH = "0.55";
const OVERLAY_MASK =
  "linear-gradient(to bottom, #000 0%, rgb(0 0 0 / 0.62) 50%, transparent 88%)";

/* React's CSSProperties has no room for a custom property, and a bare
   `{ "--enter-delay": ... }` is not assignable to it. Widening rather than
   casting keeps the values type-checked. */
type Timed = CSSProperties & Record<`--${string}`, string>;

/**
 * The entry, on first paint. The band assembles from its largest mass inward:
 * the figure drifts in off the edge it bleeds over, the heading is uncovered
 * from its own baseline upward, and the paragraph rises under it. Each starts
 * before the one before it has landed, which is what makes it one movement
 * rather than three.
 *
 * The copy goes first and the rules follow, not the other way round. A trace
 * that had to finish before the heading appeared would be nearly three seconds
 * of blue with nothing to read in it; this way the band is legible in under a
 * second and the lines draw themselves in behind it as an accent.
 *
 * Read by `.enter-*` in globals.css.
 */
const ENTER: Record<string, Timed> = {
  figure: { "--enter-delay": "0ms", "--enter-duration": "1200ms" },
  heading: { "--enter-delay": "180ms", "--enter-duration": "1100ms" },
  paragraph: { "--enter-delay": "420ms", "--enter-duration": "900ms" },
};

/**
 * The trace, in the order the stroke changes direction: down, down, across,
 * down. Each line starts before the one before it has finished, so the
 * sequence reads as one continuous movement rather than as four turns being
 * taken; the horizontal is the slowest because it is the longest, and it keeps
 * roughly the pace of the drops either side of it.
 *
 * Deliberately unhurried - the whole stroke takes 2.9s, and it starts only
 * once the copy has settled. Nothing waits on it and nothing moves under it,
 * so its only job is to be watched if anyone happens to be looking; at the
 * speed it ran before it read as a transition, which is not the same thing.
 *
 * The durations here only mean what they say because the lines are on
 * `--ease-draw`. Under the site's `--ease-out` a line is 94% drawn a third of
 * the way through its duration, so making one of these numbers larger bought
 * a longer invisible tail rather than a slower stroke.
 *
 * Read by `.trace-down` / `.trace-across` in globals.css. Timings live here so
 * the order is legible next to the lines it orders.
 */
const TRACE: Record<string, Timed> = {
  firstDrop: { "--trace-delay": "500ms", "--trace-duration": "900ms" },
  secondDrop: { "--trace-delay": "700ms", "--trace-duration": "900ms" },
  sweep: { "--trace-delay": "1100ms", "--trace-duration": "1400ms" },
  lastDrop: { "--trace-delay": "1900ms", "--trace-duration": "1000ms" },
};

/**
 * The picture blended over the field, and where it sits inside the band.
 *
 * `position` is a plain CSS `object-position`, and it is the knob for framing
 * the overlay: the band is a wide, short letterbox and the source photographs
 * are not, so `object-cover` always crops one axis away. This says which part
 * of the picture survives that crop.
 *
 *   "50% 50%"  the middle - the default, and what both pages used to get
 *   "50% 0%"   the top of the picture; "50% 100%" the bottom
 *   "50% 30%"  a little above the middle - usually what a building wants,
 *              since the interesting half is the top half
 *   "20% 40%"  left of centre and slightly high
 *   "center top", "left bottom" - keywords work too
 *
 * The first number is horizontal, the second vertical, and smaller means
 * further left / further up. Only the axis being cropped does anything: at a
 * wide viewport the band crops vertically, so on a desktop the second number is
 * the one that moves it.
 *
 * Applied as an inline style rather than a Tailwind class ON PURPOSE. Tailwind
 * compiles the classes it can SEE in the source, so an arbitrary value arriving
 * as a prop (`className={position}`) produces no CSS at all and fails silently.
 */
export type BannerOverlay = {
  src: string;
  /** CSS `object-position`. Defaults to the middle of the picture. */
  position?: string;
};

/**
 * The cut-out that crosses the field onto the page ground. See `figure`.
 *
 * The two knobs exist because the figures are not the same SHAPE. The box they
 * sit in is the frame's own 1077x721, a wide landscape - so the extrusions,
 * which are landscape too, fill it exactly, while a portrait subject fits by
 * height and leaves the box wide of it. `object-right` is right for the first
 * and wrong for the second: the box deliberately runs 5.73% past the band's
 * edge so a landscape figure bleeds off it, and a narrow figure pushed into
 * that corner is simply clipped. Hence `position`.
 */
export type BannerFigure = {
  /** A PNG with its alpha intact — see the note on stacking above. */
  src: string;
  /**
   * CSS `object-position` inside the figure box, from `md` up. Below that
   * every figure is centred — see the note at the element.
   *
   * `"right center"` for a figure meant to bleed off the right edge, which is
   * what the frame draws. `"center"` for a figure narrower than its box, which
   * would otherwise be cropped by the band's edge rather than bleeding past it.
   */
  position?: string;
  /**
   * Nudge the figure down (or up, negative) from where the box puts it.
   *
   * Any CSS length: `"5%"`, `"32px"`. A percentage resolves against the figure
   * box's own height, so it holds its proportion as the band resizes, which a
   * pixel value does not.
   *
   * This exists because `position` cannot do it. `object-position` only has
   * somewhere to move the picture on the axis with slack left over, and for a
   * figure fitted by height there is none — the vertical is the axis that
   * ran out. So the vertical half of `position` is inert for a portrait figure,
   * and this is the knob that actually moves it.
   */
  offsetY?: string;
  /**
   * Scale the figure up or down from where `object-contain` lands it.
   *
   * `contain` fits the picture to whichever axis runs out first, which is the
   * only sane default but leaves a portrait subject smaller in this landscape
   * box than it often wants to be. 1.1 is ten per cent larger, 0.9 smaller.
   * The figure grows about its own centre and the band clips it, so pushing
   * this far past 1 trades size for bleeding off an edge.
   */
  scale?: number;
  /**
   * Flip horizontally.
   *
   * Not a style choice so much as a fact about the source: the extrusions run
   * bottom-left to top-right and the band wants the opposite, so that one is
   * mirrored to lead down into the heading rather than away from it. A figure
   * already facing the right way must not be — mirroring a window would put
   * its opening on the wrong side.
   */
  mirrored?: boolean;
  /** Overrides the responsive `sizes` hint. Rarely needed. */
  sizes?: string;
};

export function PageBanner({
  heading,
  subheading,
  overlay,
  figure,
  fullBleed = false,
  link,
}: {
  heading: string;
  subheading: string;
  /** The picture over the field, and optionally how it is framed. */
  overlay: BannerOverlay;
  /**
   * The cut-out on the right, or nothing.
   *
   * Omitted, the band is field, rules and copy — which is a complete
   * composition, not a broken one: by default the ground strip stays, so the
   * blue still ends where the frame ends it, and the space the figure would
   * occupy reads as deliberate emptiness rather than as a gap. Pass `fullBleed`
   * to close that space instead.
   */
  figure?: BannerFigure;
  /**
   * Run the blue to both edges, and the rules with it.
   *
   * THE BARE STRIP EXISTS FOR THE FIGURE, so a band with no figure does not
   * always want it. In the frame the field stops at 1492/1920 and the last
   * 22.292% is page ground — that is what the cut-out is photographed against,
   * which is how the picture crosses from the blue onto the page with no
   * visible edge. Drop the figure and that strip is a bare margin at the end of
   * a blue band, with nothing left to explain it.
   *
   * The horizontal rule is capped for the same reason: it stops at 86% so the
   * stroke clears the figure rather than running under it. With the figure gone
   * the cap has nothing to clear, so it extends too — still short of the edge,
   * because a rule that touches the band's edge reads as a border rather than
   * as a drawn line.
   *
   * Opt-in rather than derived from `figure` being absent: /directors-profile
   * also omits the figure and is designed around the strip staying. This is a
   * composition choice, not a consequence.
   */
  fullBleed?: boolean;
  /** An optional link under the paragraph, to a section further down the
      page — /our-products uses it for the material library. */
  link?: { label: string; href: string };
}) {
  return (
    <section className="relative w-full overflow-x-clip bg-brand">
      <div className="relative min-h-[36rem] md:min-h-[30rem] md:aspect-[1920/720] md:max-h-[47.5rem]">
        {/* The overlay over the field, faint, and gone before it reaches the
            copy.

            Painted FIRST, before the ground strip below it, and that order is
            what confines it to the blue: the strip covers the right 22.292% of
            the band, so the overlay survives only where the field does. It is
            also before the rules and the figure, both of which want to sit on
            top of it rather than be tinted by it.

            `soft-light` rather than plain opacity. Laid over #033392 at any
            opacity, an ordinary photograph desaturates it - the blue goes
            chalky and the band loses the one saturated colour on the site.
            Blending modulates the field's luminance instead and leaves the hue
            alone, so what comes through reads as light falling across the blue
            rather than as a picture behind it. It is also what lets each page
            bring its own overlay without anyone having to tune an opacity per
            image: the mode reacts to the picture's luminance, not its colour.

            Strength and reach are `OVERLAY_STRENGTH` and `OVERLAY_MASK` above.
            Both spellings of the mask property: iOS Safari still wants the
            prefix. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-soft-light"
          style={{
            opacity: OVERLAY_STRENGTH,
            maskImage: OVERLAY_MASK,
            WebkitMaskImage: OVERLAY_MASK,
          }}
        >
          <Image
            src={overlay.src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: overlay.position ?? "50% 50%" }}
          />
        </div>

        {/* The ground the field is cut out of. Not decoration: the strip past
            1492/1920 is bare in the frame, and it is what the figure was
            photographed on, so the right-hand end of the picture has no visible
            edge. Drawn as an inset over the blue rather than as the section's
            own background, so the blue needs no second element.

            `bg-bg`, not the frame's white. The sections below set no ground of
            their own and so show the body's, and a strip of pure white ending
            on #f4f5f6 put a seam across the foot of the band for no reason -
            the two are close enough to read as a mistake rather than as an
            edge. Matching it lets the strip run into the page instead. A figure
            is a cut-out on transparency, so it takes the change without a
            halo. */}
        {fullBleed ? null : (
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 hidden w-[22.292%] bg-bg md:block"
          />
        )}

        {/* The rules: white hairlines dividing the empty upper half, and the
            only drawing on the band — without them the top two thirds read as
            a blue rectangle. 2px in the frame, and held at 2px rather than
            scaled with the band, because a fractional hairline straddles a
            device pixel and greys out. */}
        <div aria-hidden className="absolute inset-0">
          {/* Across. The frame stops it at 1297/1920, short of the field's own
              edge; it runs further than that here so the stroke carries past
              the figure rather than ending under it. Framed, it stays short of
              the full width — against the bare ground strip on the right a rule
              that reached the edge would read as a border rather than as a
              drawn line.

              FULL-BLEED IT RUNS THE WHOLE WAY, and the reasoning above does not
              survive the change: with the strip gone there is no ground for the
              line to stop against, so a cap just leaves it hanging in blue a
              few percent short of the edge, which reads as unfinished rather
              than as restraint. It was tried at 94% and looked exactly like
              that. Edge to edge the band has a drawn line across it; there is
              no border to be mistaken for, because both ends run off the
              screen. */}
          <div
            className={
              "trace-across absolute left-0 h-[2px] bg-white " +
              (fullBleed ? "w-full" : "w-[90%] md:w-[86%]")
            }
            style={{ top: RULE_Y, ...TRACE.sweep }}
          />
          {/* Down, from the top edge to the crossing: 288 and 741 of 1920. */}
          <div
            className="trace-down absolute top-0 left-[30%] h-[34.722%] w-[2px] bg-white md:left-[15%]"
            style={TRACE.firstDrop}
          />
          <div
            className="trace-down absolute top-0 left-[64%] h-[34.722%] w-[2px] bg-white md:left-[38.594%]"
            style={TRACE.secondDrop}
          />
          {/* Down, from the crossing to the foot: 1212 of 1920. Desktop only.
              It runs through the lower half, which on a phone is where the
              copy is - there is no width left for the rule to fall beside the
              heading rather than through it. */}
          <div
            className={
              "trace-down absolute bottom-0 hidden w-[2px] bg-white md:block " +
              /* 1212/1920 of the band in the frame, which is 81.2% of the
                 field's own 1492. Full-bleed the field IS the band, so the
                 drop keeps its place within the blue rather than its place
                 within the frame — otherwise it slides left of where the
                 composition puts it and leaves a wide empty end. */
              (fullBleed ? "left-[60%]" : "left-[63.125%]")
            }
            style={{ top: RULE_Y, ...TRACE.lastDrop }}
          />
        </div>

        {/* The figure. Mirrored, as in the frame: the source runs bottom-left
            to top-right and the band wants it the other way, so it leads down
            into the heading instead of away from it. A transform, not a second
            flipped file.

            `object-contain`, where a photograph in a band would normally be
            `cover`: this is a cut-out, and cropping it would slice the subject
            in half mid-frame. At the designed proportions the box is the
            extrusions' own 1077x721 and contain fills it exactly; away from
            them the figure shrinks inside the box instead of distorting.

            Mirroring and framing are per-figure and explained on
            `BannerFigure` — they depend on the shape and the facing of the
            picture, which is not something this component can know. */}
        {figure && (
          <div
            className="enter-drift pointer-events-none absolute top-[14%] left-[-4%] h-[38%] w-[108%] md:top-0 md:left-[49.635%] md:h-[100.14%] md:w-[56.094%]"
            style={{ ...ENTER.figure, zIndex: Z.raised }}
          >
            <Image
              src={figure.src}
              alt=""
              fill
              /* Was `priority`, deprecated as of Next 16. The LCP element on
                 any page that has one. */
              preload
              sizes={figure.sizes ?? "(min-width: 768px) 56vw, 108vw"}
              /* The framing applies from `md` up only, and below that every
                 figure is centred. On a phone the band is a different shape -
                 the figure sits in the empty upper half rather than bleeding
                 off a side - so there is no edge to hold it against, and a
                 figure pushed to one there is simply cut in half by it.

                 Handed over as a custom property rather than as a class:
                 Tailwind compiles the classes it can SEE, so a class built
                 from a prop produces no CSS. The class below is a fixed
                 string; only the value inside the variable moves. */
              className="object-contain object-center md:[object-position:var(--figure-position)]"
              style={
                {
                  "--figure-position": figure.position ?? "center",
                  /* Inline rather than `scale-x-[-1]` / `scale-110` classes:
                     the two compose into ONE transform, and as separate
                     Tailwind utilities the second would overwrite the first
                     rather than combine with it. Order does not matter here -
                     a mirror and a uniform scale commute - but both have to be
                     in the same declaration. */
                  transform:
                    [
                      figure.mirrored ? "scaleX(-1)" : null,
                      /* Before the scale, and that ordering is the point:
                         transforms apply right to left, so a translate written
                         to the LEFT of the scale is applied after it, in the
                         band's own pixels. Written to the right it would be
                         multiplied by the scale, and `offsetY` would quietly
                         mean something different at every `scale`. */
                      figure.offsetY ? `translateY(${figure.offsetY})` : null,
                      figure.scale && figure.scale !== 1
                        ? `scale(${figure.scale})`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" ") || undefined,
                } as Timed
              }
            />
          </div>
        )}

        {/* The copy, in the bottom-left corner. Anchored to the foot of the
            band rather than hung off the rule above it, so the pair keeps the
            frame's 61/720 of air underneath whatever height the band settles
            at.

            Pinned to both edges rather than left to shrink to fit its contents,
            and that is not cosmetic. Shrink-to-fit makes the box as wide as its
            widest line, and the two fractions inside are then measured against
            THAT - so the paragraph's designed 1053/1920 measure would come out
            a different width on every page, decided by how long that page's
            heading happened to be. Measured before pinning: 1026px of paragraph
            on /our-products, 793 on /contact, 421 on /zh/contact, for one
            unchanged rule. Against a fixed box all three are the frame's. */}
        <div className="absolute right-0 bottom-[8.472%] left-0 px-6 md:left-[1.823%] md:px-0">
          {/* 6.25vw: 120px where the band is 1920 wide. The frame sets it at
              160, which crowded the figure and left the paragraph looking like
              a caption under a poster; a quarter off gives the pair back its
              proportion and opens the blue between the heading and the rule
              above it.

              Fenced at both ends: the floor keeps the heading legible on a
              phone, where 6.25vw would be 24px, and the ceiling stops it
              growing past 120 on an ultrawide, where the band has already
              stopped growing taller.

              The width cap is what lets a sentence be a heading here. `Our
              Products` needs none, but /contact opens on a clause, and at
              6.25vw an unbounded line would run past the field's own edge and
              out under the figure. 62% keeps it inside the blue at every width
              and lets it wrap into the empty half above, which the band has
              room for. */}
          <h1
            className="enter-unmask text-[clamp(2.25rem,6.25vw,7.5rem)] leading-[0.95] font-normal tracking-tight text-balance text-white md:max-w-[62%]"
            style={ENTER.heading}
          >
            {heading}
          </h1>
          {/* 1053/1920 wide, from the heading's left edge plus the 13px of
              optical inset the frame gives it — the heading is set to the left
              of its own sidebearing, the paragraph is not. */}
          <p
            className="enter-rise mt-3 max-w-[34rem] text-base leading-relaxed text-pretty text-white md:ml-[0.677%] md:w-[54.844%] md:max-w-none"
            style={ENTER.paragraph}
          >
            {subheading}
          </p>
          {link && (
            <a
              href={link.href}
              className="enter-rise group mt-6 inline-flex items-center gap-2 text-sm font-medium text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white md:ml-[0.677%]"
              style={ENTER.paragraph}
            >
              {link.label}
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-y-0.5">
                ↓
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
