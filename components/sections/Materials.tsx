"use client";

import { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import {
  MATERIALS,
  MATERIALS_ZH,
  MATERIALS_BM,
  type MaterialSample,
} from "@/lib/content";
import { localePath, useCopy, useLocale } from "@/lib/locale";
import { PRODUCTS } from "@/lib/products";
import { Reveal } from "@/components/ui/Reveal";

/**
 * MEVO Global Strategic Partners: a material library, the way a showroom
 * keeps one — pick a category, then a sample, and see it large.
 *
 * Three tabs (glass, aluminium finishes, hardware), each a list of samples.
 * The large view shows the chosen sample: a photograph for glass and hardware,
 * and for a finish a drawn aluminium profile in that colour, since a finish is
 * a colour on a section rather than a scene. Beside it, the sample's name, a
 * line on it, and the catalogue product it can be seen on.
 *
 * Every sample flagged `placeholder` in the copy is tagged as one on screen, so
 * a stand-in cannot reach launch unnoticed. See MATERIALS in lib/content.ts.
 *
 * Capped at 1440 on the catalogue's own gutters, because it closes the same
 * page and should line up with the band above it; white, where the catalogue
 * is on the page ground, so it reads as its own chapter.
 *
 * `scroll-mt-24` so the banner's link and the nav item, which both land here,
 * leave the heading clear of the header island.
 */
export function Materials() {
  const copy = useCopy(MATERIALS, { ZH: MATERIALS_ZH, BM: MATERIALS_BM });
  const { locale } = useLocale();
  const [tab, setTab] = useState(0);
  /** The chosen sample in each tab, so switching tabs and back keeps it. */
  const [picked, setPicked] = useState<number[]>(() => copy.tabs.map(() => 0));
  const ids = useId();

  const current = copy.tabs[tab];
  const sample = current.samples[picked[tab]];
  const product = sample.product
    ? PRODUCTS.find((p) => p.slug === sample.product)
    : undefined;

  const partners = copy.tabs.find((t) => t.key === "hardware")?.samples ?? [];

  const pick = (i: number) =>
    setPicked((all) => all.map((value, t) => (t === tab ? i : value)));

  return (
    <section
      id={copy.id}
      aria-labelledby={`${ids}-heading`}
      className="scroll-mt-24 bg-surface px-4 py-20 md:px-8 md:py-24 lg:px-12 lg:py-28"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <Reveal>
            <p className="text-xs font-medium tracking-[0.2em] text-ink-2 uppercase md:text-sm">
              {copy.eyebrow}
            </p>
            <h2
              id={`${ids}-heading`}
              className="mt-4 max-w-[22ch] text-3xl leading-[1.1] font-medium tracking-tighter text-ink md:text-4xl lg:text-5xl"
            >
              {copy.heading}
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            {copy.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 max-w-[60ch] text-base leading-relaxed text-ink-2 first:mt-0">
                {paragraph}
              </p>
            ))}
          </Reveal>
        </div>

        {/* The partners, as one quiet line: names set as text until the client
            supplies logos they have the right to use. */}
        <Reveal delay={0.1}>
          <p className="mt-10 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-y border-line py-4 text-sm">
            <span className="text-xs font-medium tracking-[0.18em] text-ink-2 uppercase">
              {copy.partnersLabel}
            </span>
            {partners.map((p) => (
              <span key={p.name} className="font-medium tracking-[0.08em] text-ink uppercase">
                {p.name}
              </span>
            ))}
          </p>
        </Reveal>

        {/* The tabs. Scroll sideways on a phone rather than wrapping, so the
            row stays one line however the labels are translated. */}
        <div
          role="tablist"
          aria-label={copy.eyebrow}
          className="mt-10 -mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {copy.tabs.map((t, i) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`${ids}-tab-${i}`}
              aria-selected={tab === i}
              aria-controls={`${ids}-panel`}
              onClick={() => setTab(i)}
              className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium tracking-tight transition-colors duration-200 ${
                tab === i
                  ? "border-ink bg-ink text-bg"
                  : "border-line text-ink hover:border-ink/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`${ids}-panel`}
          aria-labelledby={`${ids}-tab-${tab}`}
          /* `minmax(0, …)` at every width, including the one-column phone
             layout: the sample row inside scrolls sideways, and a plain grid
             track would grow to fit it and push the panel off the screen. */
          className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12"
        >
          {/* The large view. Keyed on the sample, so a change fades the new one
              in rather than swapping it in place. */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-2 lg:aspect-auto lg:min-h-[30rem]">
            <div key={`${tab}-${picked[tab]}`} className="materials-in absolute inset-0">
              {sample.swatch ? (
                <FinishView colour={sample.swatch} />
              ) : sample.image ? (
                <Image
                  src={sample.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  quality={75}
                  className="object-cover"
                />
              ) : null}
            </div>
          </div>

          <div className="flex flex-col">
            {/* The samples. Finishes show as colour chips; glass and hardware
                as a plain list, since a name is what tells them apart. */}
            <ul
              aria-label={current.label}
              className={
                current.key === "finishes"
                  ? "flex flex-wrap gap-3"
                  : "flex gap-2 overflow-x-auto [scrollbar-width:none] lg:flex-col lg:gap-0 lg:overflow-visible lg:border-t lg:border-line [&::-webkit-scrollbar]:hidden"
              }
            >
              {current.samples.map((s, i) => (
                <li key={s.name} className="shrink-0">
                  <SampleButton
                    sample={s}
                    on={picked[tab] === i}
                    swatch={current.key === "finishes"}
                    onPick={() => pick(i)}
                  />
                </li>
              ))}
            </ul>

            <div key={`${tab}-${picked[tab]}`} className="materials-in mt-8">
              <p className="flex flex-wrap items-center gap-3 text-2xl leading-snug font-medium tracking-tight text-ink">
                {sample.name}
                {sample.placeholder && (
                  <span className="rounded-full bg-[#fff4d6] px-2.5 py-0.5 text-xs font-medium tracking-wide text-[#7a5600]">
                    {copy.placeholderTag}
                  </span>
                )}
              </p>
              <p className="mt-3 max-w-[48ch] text-base leading-relaxed text-ink-2">{sample.body}</p>
              {product && (
                <Link
                  href={localePath(`/our-products#${product.slug}`, locale)}
                  className="group mt-5 inline-flex items-center gap-2 text-sm font-medium text-ink"
                >
                  <span className="text-ink-2">{copy.seenIn}</span>
                  <span className="underline decoration-line underline-offset-4 transition-colors group-hover:decoration-ink">
                    {product.title}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start gap-6 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xl leading-snug font-medium tracking-tight text-ink md:text-2xl">
            {copy.closing}
          </p>
          <Link
            href={localePath(copy.cta.href, locale)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-base font-medium tracking-tight text-bg transition-transform duration-[160ms] ease-out hover:-translate-y-0.5 active:translate-y-0 md:w-auto"
          >
            {copy.cta.label}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <style>{`
        .materials-in { animation: materials-in 320ms var(--ease-out) both; }
        @keyframes materials-in { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .materials-in { animation: none; } }
      `}</style>
    </section>
  );
}

function SampleButton({
  sample,
  on,
  swatch,
  onPick,
}: {
  sample: MaterialSample;
  on: boolean;
  swatch: boolean;
  onPick: () => void;
}) {
  if (swatch) {
    return (
      <button
        type="button"
        aria-pressed={on}
        aria-label={sample.name}
        title={sample.name}
        onClick={onPick}
        className={`block size-12 rounded-full p-1 transition-shadow duration-200 ${
          on ? "ring-2 ring-ink" : "ring-1 ring-line hover:ring-ink/40"
        }`}
      >
        <span
          className="block size-full rounded-full"
          style={{
            background: `linear-gradient(135deg, rgb(255 255 255 / 0.35), transparent 55%), ${sample.swatch}`,
          }}
        />
      </button>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onPick}
      className={`flex w-full items-center justify-between gap-4 rounded-full border px-4 py-2 text-left text-sm font-medium transition-colors duration-200 lg:rounded-none lg:border-0 lg:border-b lg:border-line lg:px-0 lg:py-4 lg:text-base ${
        on
          ? "border-ink text-ink lg:border-line"
          : "border-line text-ink-2 hover:text-ink"
      }`}
    >
      <span className="whitespace-nowrap">{sample.name}</span>
      <span
        aria-hidden
        className={`hidden size-2 rounded-full bg-ink transition-opacity lg:block ${on ? "opacity-100" : "opacity-0"}`}
      />
    </button>
  );
}

/**
 * A finish, shown on the thing it finishes: an aluminium profile in section,
 * filled with the chosen colour, with a sheen across it so it reads as metal
 * rather than flat paint. Drawn rather than photographed, so every finish is
 * shown on the same piece and can be compared like for like.
 */
function FinishView({ colour }: { colour: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 640 480" className="h-full w-full" aria-hidden preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`${id}-ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2f4f6" />
          <stop offset="1" stopColor="#e2e6ea" />
        </linearGradient>
      </defs>
      <rect width="640" height="480" fill={`url(#${id}-ground)`} />
      {/* The profile: an outer chamber and an inner one joined by a slot, a
          glazing lip on top, a fixing leg below. One even-odd path, so the
          chambers are holes in the metal rather than shapes laid on it. */}
      <g transform="translate(150 70)">
        <ellipse cx="170" cy="352" rx="190" ry="14" fill="#000" opacity="0.08" />
        <path
          fillRule="evenodd"
          fill={colour}
          d="M0 40 H140 V0 H170 V40 H340 V300 H220 V340 H190 V300 H0 Z
             M24 64 V276 H130 V64 Z
             M154 64 V276 H176 V64 Z
             M200 64 V170 H316 V64 Z
             M200 194 V276 H316 V194 Z"
        />
        <path
          fillRule="evenodd"
          fill={`url(#${id}-sheen)`}
          d="M0 40 H140 V0 H170 V40 H340 V300 H220 V340 H190 V300 H0 Z
             M24 64 V276 H130 V64 Z
             M154 64 V276 H176 V64 Z
             M200 64 V170 H316 V64 Z
             M200 194 V276 H316 V194 Z"
        />
      </g>
    </svg>
  );
}
