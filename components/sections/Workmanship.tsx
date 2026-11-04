"use client";

import { useState, type ReactNode } from "react";
import { WORKMANSHIP } from "@/lib/content";
import { useCopy } from "@/lib/locale";
import { Reveal } from "@/components/ui/Reveal";

/* The drawing's palette: the one ink the site's other technical drawings use
   (see WhyMevo), at two weights, over a pale aluminium and a faintly tinted
   glass. The seals are the one solid black — EPDM is black, and it is the
   detail the eye should find without being told. */
const INK = "var(--brand)";
const METAL = "#f2f4f7";
const GLASS = "rgb(3 51 146 / 0.06)";
const RUBBER = "#15181c";
const HAIR = {
  stroke: INK,
  strokeWidth: 0.8,
  strokeLinejoin: "round",
} as const;
const LINE = {
  stroke: INK,
  strokeWidth: 1.4,
  strokeLinejoin: "round",
} as const;

/** Where each numbered marker sits, and where its leader line lands on the
    part it names. Same order as `components` in the copy. */
const MARKERS: { at: [number, number]; to: [number, number] }[] = [
  { at: [440, 500], to: [380, 500] }, // 1 profile chambers
  { at: [500, 292], to: [462, 343] }, // 2 handle
  { at: [250, 584], to: [250, 527] }, // 3 thermal break strip
  { at: [140, 222], to: [206, 268] }, // 4 glazing seal
  { at: [58, 400], to: [112, 400] }, // 5 the sightline
];

/**
 * MEVO Workmanship: the client's copy on the left, and on the right a
 * cross-section of a thermally broken window with the five components marked
 * on it. Pointing at a component in the list, or at its number on the drawing,
 * picks it out — everything else on the drawing falls back.
 *
 * The section is schematic, not a production drawing of any one MEVO system:
 * it shows the arrangement every system in the range shares — an aluminium
 * chamber outside and another inside, joined only by polyamide strips, with
 * the glass held in seals and the sash closing on more of them. Proportions are
 * chosen for legibility. The figures beside each component are real, and come
 * from the catalogue; see WORKMANSHIP in lib/content.ts.
 *
 * `scroll-mt-24` so the hero's button, which links here, lands the heading
 * clear of the header island.
 */
export function Workmanship() {
  const copy = useCopy(WORKMANSHIP, {}).section;
  const [active, setActive] = useState<number | null>(null);

  /** A part's opacity: everything at full until one is picked, then only it. */
  const dim = (n: number) => (active === null || active === n ? 1 : 0.22);

  return (
    <section
      id={copy.id}
      aria-labelledby="workmanship-heading"
      className="relative scroll-mt-24 bg-bg py-20 md:py-24 lg:py-28"
    >
      {/* Three blocks: the intro, the drawing and the list. On a phone they
          stack in that order (the left column's wrapper is `contents` there,
          so `order` places the drawing between its two children), so the
          heading the hero's button scrolls to comes first and the drawing
          sits right above the list that drives it.

          From `lg` the left column is one block: the heading and description
          held at the top of the screen, and the list scrolling up under them,
          beside the drawing held on the right. Only the list moves. */}
      <div className="grid w-full gap-10 px-6 md:px-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-x-16 lg:px-10">
        <div className="contents lg:col-start-1 lg:row-start-1 lg:block">
          {/* Held from the very top of the screen (the padding pulls its
            background up over the section's own), so a list item passing
            under it never shows above it. The fade under it lets the items
            go under rather than be cut. */}
          <div className="order-1 lg:sticky lg:top-0 lg:z-10 lg:-mt-28 lg:bg-bg lg:pt-28 lg:pb-8">
            <Reveal>
              <h2
                id="workmanship-heading"
                className="max-w-[18ch] text-3xl leading-[1.1] font-medium tracking-tighter text-ink md:text-4xl lg:text-5xl"
              >
                {copy.heading}
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              {copy.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-5 max-w-[72ch] text-base leading-relaxed text-ink-2"
                >
                  {paragraph}
                </p>
              ))}
            </Reveal>

            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-full hidden h-10 bg-gradient-to-b from-bg to-transparent lg:block"
            />
          </div>

          <div className="order-3 lg:pb-[12svh]">
            <Reveal delay={0.1}>
              <h3 className="mt-2 lg:mt-4 text-xl leading-snug font-medium tracking-tight text-ink md:text-2xl">
                {copy.subheading}
              </h3>
              <p className="mt-3 text-base text-ink-2">{copy.lead}</p>
            </Reveal>

            <ol
              className="mt-8 border-t border-line"
              onMouseLeave={() => setActive(null)}
            >
              {copy.components.map((component, i) => (
                <li key={component.title} className="border-b border-line">
                  {/* A button, so the drawing can be driven from the keyboard
                      and by a tap, not only by a hovering mouse. */}
                  <button
                    type="button"
                    aria-pressed={active === i}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    /* Sets rather than toggles: a click arrives just after the
                       focus that already picked this one, and a toggle would
                       undo it. Moving off the list is what clears it. */
                    onClick={() => setActive(i)}
                    className={`grid w-full grid-cols-[2.5rem_1fr] gap-x-3 py-5 text-left transition-opacity duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                      active === null || active === i
                        ? "opacity-100"
                        : "opacity-50"
                    }`}
                  >
                    <Badge n={i + 1} on={active === i} />
                    <span>
                      <span className="block text-lg leading-snug font-medium tracking-tight text-ink">
                        {component.title}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-ink-2 md:text-base">
                        {component.body}
                      </span>
                      <span className="mt-3 inline-block rounded-full border border-ink/15 px-3 py-1 text-xs font-medium tracking-wide text-ink tabular-nums">
                        {component.spec}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* The drawing. Held in view beside the list on a wide screen, so the
            part a reader points at is always on screen; between the intro and
            the list on a phone. */}
        <div className="order-2 lg:col-start-2 lg:row-start-1">
          <div className="lg:sticky lg:top-28">
            <figure className="rounded-2xl border border-line bg-white p-4 sm:p-6 md:p-8">
              <svg
                viewBox="0 0 540 610"
                role="img"
                aria-label={copy.figureLabel}
                /* Capped to the screen, so the whole drawing, every number
                   included, stays in view while it is held beside the list. */
                className="mx-auto h-auto max-h-[calc(100svh-13rem)] w-full"
              >
                <defs>
                  {/* Polyamide, hatched the way a section drawing marks a
                      material that is not the metal around it. */}
                  <pattern
                    id="wm-hatch"
                    width="5"
                    height="5"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                  >
                    <rect width="5" height="5" fill="#fff" />
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="5"
                      stroke={INK}
                      strokeWidth="1.2"
                    />
                  </pattern>
                </defs>

                <text
                  x="30"
                  y="40"
                  className="fill-ink-2 text-[13px] font-medium tracking-[0.18em] uppercase"
                >
                  {copy.exterior}
                </text>
                <text
                  x="510"
                  y="40"
                  textAnchor="end"
                  className="fill-ink-2 text-[13px] font-medium tracking-[0.18em] uppercase"
                >
                  {copy.interior}
                </text>

                {/* The glass: two panes and the spacer between them, running up
                    out of the drawing. Context rather than a numbered part. */}
                <g
                  opacity={active === null ? 1 : 0.4}
                  className="transition-opacity duration-300"
                >
                  <rect
                    x="214"
                    y="60"
                    width="8"
                    height="240"
                    fill={GLASS}
                    {...HAIR}
                  />
                  <rect
                    x="278"
                    y="60"
                    width="8"
                    height="240"
                    fill={GLASS}
                    {...HAIR}
                  />
                  <rect
                    x="222"
                    y="272"
                    width="56"
                    height="28"
                    fill={METAL}
                    {...HAIR}
                  />
                  {[234, 250, 266].map((x) => (
                    <circle key={x} cx={x} cy="286" r="1.6" fill={INK} />
                  ))}
                  <line
                    x1="214"
                    y1="60"
                    x2="286"
                    y2="60"
                    {...HAIR}
                    strokeDasharray="3 4"
                  />
                </g>

                {/* 1 — the aluminium: sash above, frame below, each an outer
                    and an inner chamber with its own internal walls. */}
                <Part opacity={dim(0)}>
                  {/* Sash, exterior and interior halves, with the glazing lip
                      and bead that hold the glass. */}
                  <rect
                    x="150"
                    y="300"
                    width="86"
                    height="100"
                    fill={METAL}
                    {...LINE}
                  />
                  <line x1="193" y1="300" x2="193" y2="400" {...HAIR} />
                  <rect
                    x="190"
                    y="258"
                    width="16"
                    height="42"
                    fill={METAL}
                    {...LINE}
                  />
                  <rect
                    x="264"
                    y="300"
                    width="96"
                    height="100"
                    fill={METAL}
                    {...LINE}
                  />
                  <line x1="312" y1="300" x2="312" y2="400" {...HAIR} />
                  <line x1="264" y1="350" x2="360" y2="350" {...HAIR} />
                  <rect
                    x="294"
                    y="258"
                    width="16"
                    height="42"
                    fill={METAL}
                    {...LINE}
                  />
                  {/* Frame. */}
                  <rect
                    x="130"
                    y="420"
                    width="106"
                    height="120"
                    fill={METAL}
                    {...LINE}
                  />
                  <line x1="183" y1="420" x2="183" y2="540" {...HAIR} />
                  <line x1="130" y1="480" x2="236" y2="480" {...HAIR} />
                  <rect
                    x="264"
                    y="420"
                    width="116"
                    height="120"
                    fill={METAL}
                    {...LINE}
                  />
                  <line x1="322" y1="420" x2="322" y2="540" {...HAIR} />
                  <line x1="264" y1="480" x2="380" y2="480" {...HAIR} />
                </Part>

                {/* 2 — hardware: the handle on the room side, and the locking
                    roller that reaches from the sash into a keeper in the frame. */}
                <Part opacity={dim(1)}>
                  <rect
                    x="360"
                    y="328"
                    width="14"
                    height="44"
                    rx="4"
                    fill="#fff"
                    {...LINE}
                  />
                  <rect
                    x="372"
                    y="343"
                    width="96"
                    height="14"
                    rx="7"
                    fill="#fff"
                    {...LINE}
                  />
                  <rect
                    x="330"
                    y="400"
                    width="18"
                    height="10"
                    fill="#fff"
                    {...HAIR}
                  />
                  <circle cx="339" cy="414" r="6" fill="#fff" {...LINE} />
                  <rect
                    x="328"
                    y="420"
                    width="22"
                    height="8"
                    fill="#fff"
                    {...HAIR}
                  />
                </Part>

                {/* 3 — the thermal break: polyamide strips, the only thing
                    joining the outside aluminium to the inside, in sash and
                    frame alike. */}
                <Part opacity={dim(2)}>
                  <rect
                    x="236"
                    y="310"
                    width="28"
                    height="12"
                    fill="url(#wm-hatch)"
                    {...LINE}
                  />
                  <rect
                    x="236"
                    y="378"
                    width="28"
                    height="12"
                    fill="url(#wm-hatch)"
                    {...LINE}
                  />
                  <rect
                    x="236"
                    y="432"
                    width="28"
                    height="14"
                    fill="url(#wm-hatch)"
                    {...LINE}
                  />
                  <rect
                    x="236"
                    y="513"
                    width="28"
                    height="14"
                    fill="url(#wm-hatch)"
                    {...LINE}
                  />
                </Part>

                {/* 4 — the seals: one either side of the glass, and three
                    between sash and frame, outside, centre and inside. */}
                <Part opacity={dim(3)}>
                  <rect
                    x="206"
                    y="266"
                    width="8"
                    height="18"
                    rx="3"
                    fill={RUBBER}
                  />
                  <rect
                    x="286"
                    y="266"
                    width="8"
                    height="18"
                    rx="3"
                    fill={RUBBER}
                  />
                  <rect
                    x="150"
                    y="402"
                    width="18"
                    height="16"
                    rx="5"
                    fill={RUBBER}
                  />
                  <rect
                    x="238"
                    y="402"
                    width="24"
                    height="16"
                    rx="5"
                    fill={RUBBER}
                  />
                  <rect
                    x="352"
                    y="402"
                    width="16"
                    height="16"
                    rx="5"
                    fill={RUBBER}
                  />
                </Part>

                {/* 5 — design: the sightline, the depth of aluminium seen from
                    outside, kept as narrow as the structure allows. */}
                <Part opacity={dim(4)}>
                  <line x1="112" y1="258" x2="112" y2="540" {...LINE} />
                  <line x1="104" y1="258" x2="120" y2="258" {...LINE} />
                  <line x1="104" y1="540" x2="120" y2="540" {...LINE} />
                  <line
                    x1="120"
                    y1="258"
                    x2="190"
                    y2="258"
                    {...HAIR}
                    strokeDasharray="3 4"
                  />
                  <line
                    x1="120"
                    y1="540"
                    x2="130"
                    y2="540"
                    {...HAIR}
                    strokeDasharray="3 4"
                  />
                </Part>

                {/* The numbers, over everything, with leader lines to their
                    parts. They drive the drawing too. */}
                {MARKERS.map(({ at, to }, i) => {
                  const on = active === i;
                  return (
                    <g
                      key={i}
                      onMouseEnter={() => setActive(i)}
                      onMouseLeave={() => setActive(null)}
                      onClick={() => setActive(i)}
                      className="cursor-pointer"
                      opacity={dim(i)}
                    >
                      <line
                        x1={at[0]}
                        y1={at[1]}
                        x2={to[0]}
                        y2={to[1]}
                        {...HAIR}
                      />
                      <circle cx={to[0]} cy={to[1]} r="2.5" fill={INK} />
                      <circle
                        cx={at[0]}
                        cy={at[1]}
                        r="14"
                        fill={on ? INK : "#fff"}
                        stroke={INK}
                        strokeWidth="1.4"
                        className="transition-[fill] duration-200"
                      />
                      <text
                        x={at[0]}
                        y={at[1] + 4.5}
                        textAnchor="middle"
                        className="text-[13px] font-medium tabular-nums"
                        fill={on ? "#fff" : INK}
                      >
                        {i + 1}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

function Part({ opacity, children }: { opacity: number; children: ReactNode }) {
  return (
    <g opacity={opacity} className="transition-opacity duration-300">
      {children}
    </g>
  );
}

/** The list's number, matched to the drawing's marker. */
function Badge({ n, on }: { n: number; on: boolean }) {
  return (
    <span
      aria-hidden
      className={`mt-0.5 flex size-7 items-center justify-center rounded-full border border-[var(--brand)] text-xs font-medium tabular-nums transition-colors duration-200 ${
        on ? "bg-[var(--brand)] text-white" : "text-[var(--brand)]"
      }`}
    >
      {n}
    </span>
  );
}
