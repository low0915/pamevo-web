import Image from "next/image";
import { siWhatsapp } from "simple-icons";
import { PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import {
  FOOTER,
  SALES_TEAM,
  SALES_TEAM_ZH,
  SALES_TEAM_BM,
  WHATSAPP,
  type SalesMember,
} from "@/lib/content";
import type { Locale } from "@/lib/paths";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The sales team, on Our Sales Team (/directors-profile): the introduction and
 * the company's WhatsApp and Call buttons on the left, pinned on desktop, and
 * the team as a small org chart on the right in the client's order (2, 1, 1,
 * 2), joined by connector lines. Each card is a portrait with the name and
 * role beneath it; no hover state and no per-person contact yet.
 *
 * A server component, so the copy arrives through `locale`.
 */
export function SalesTeam({ locale = "EN" }: { locale?: Locale }) {
  const TRANSLATIONS: Record<Locale, Partial<typeof SALES_TEAM>> = {
    EN: {},
    BM: SALES_TEAM_BM,
    ZH: SALES_TEAM_ZH,
  };
  const copy = { ...SALES_TEAM, ...TRANSLATIONS[locale] };

  return (
    <section
      id="sales-team"
      aria-labelledby="sales-team-heading"
      className="border-t border-line bg-surface px-6 pt-20 pb-20 md:px-8 md:pt-24 md:pb-24 lg:px-10 lg:pt-28 lg:pb-28"
    >
      {/* Two columns from `lg`: the introduction on the left, pinned while the
          chart scrolls past it, and the chart on the right. Stacked below
          `lg`. Splitting the width is what stops the chart, which is only two
          portraits wide at its widest, from floating in an empty page. */}
      <div className="mx-auto max-w-[1440px] lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <p className="text-xs font-medium tracking-[0.2em] text-ink-2 uppercase md:text-sm">
              {copy.eyebrow}
            </p>
            <h2
              id="sales-team-heading"
              className="mt-4 max-w-[24ch] text-[clamp(1.75rem,3.4vw,3rem)] leading-[1.05] font-medium tracking-tighter text-balance text-ink"
            >
              {copy.heading}
            </h2>
            <p className="mt-5 max-w-[60ch] text-[1.0625rem] leading-[1.5] text-ink-2 md:mt-6">
              {copy.lede}
            </p>
            {/* The whole team at once: the company's WhatsApp and phone, the
                same ones every card falls back to until members have their
                own numbers. */}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={WHATSAPP.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium tracking-tight text-bg transition-transform duration-[160ms] ease-out active:scale-[0.97]"
              >
                <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
                  <path d={siWhatsapp.path} />
                </svg>
                {copy.whatsapp}
              </a>
              <a
                href={FOOTER.phoneHref}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[rgb(16_18_21/0.2)] px-5 text-sm font-medium tracking-tight text-ink transition-transform duration-[160ms] ease-out active:scale-[0.97]"
              >
                <PhoneIcon size={16} weight="bold" aria-hidden />
                {copy.call}
              </a>
            </div>
          </Reveal>
        </div>

        {/* One centred row per entry in `rows` (2, 1, 1, 2), in the client's
            order, joined by org-chart connectors: a bracket where two meet one,
            a straight line between two singles. */}
        <div className="mt-14 md:mt-16 lg:mt-0">
          {copy.rows.map((count, r) => {
            const start = copy.rows.slice(0, r).reduce((a, b) => a + b, 0);
            const next = copy.rows[r + 1];
            return (
              <div key={r}>
                <ul className="flex justify-center gap-4 md:gap-6">
                  {copy.members.slice(start, start + count).map((member) => (
                    <Member key={member.name} member={member} />
                  ))}
                </ul>
                {next ? <Connector from={count} to={next} /> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * The line between two rows of the chart. Drawn with borders rather than an
 * SVG so it follows the cards' widths at every breakpoint: a bracket spans
 * from the centre of one card to the centre of its neighbour, which is one
 * card width plus the gap - the same arithmetic as the row above it.
 *
 *   2 -> 1   a U under the pair, then a stem down to the single
 *   1 -> 1   a straight stem
 *   1 -> 2   a stem, then an upturned U over the pair
 */
const BRACKET =
  "mx-auto h-5 w-[min(calc(50%+0.5rem),15rem)] border-[rgb(16_18_21/0.18)] md:w-[15.5rem] lg:w-[16.5rem]";
const STEM = "mx-auto h-5 w-px bg-[rgb(16_18_21/0.18)]";

function Connector({ from, to }: { from: number; to: number }) {
  return (
    <div aria-hidden className="py-3">
      {from === 2 ? <div className={`${BRACKET} border-x border-b`} /> : <div className={STEM} />}
      {to === 2 ? <div className={`${BRACKET} border-x border-t`} /> : <div className={STEM} />}
    </div>
  );
}

function Member({ member }: { member: SalesMember }) {
  /* A plain card: portrait, name, role. No hover state and no per-person
     contact buttons for now; the section's own WhatsApp and Call buttons
     reach the team. `whatsapp` / `phone` on SalesMember are kept for when
     individual numbers are supplied. */
  return (
    <li className="w-[calc(50%-0.5rem)] max-w-56 md:w-56 lg:w-60">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        {member.photo ? (
          <Image
            src={member.photo}
            alt=""
            fill
            sizes="(min-width: 1024px) 240px, (min-width: 768px) 224px, 50vw"
            className="object-cover"
          />
        ) : (
          <Silhouette />
        )}
      </div>
      <p className="mt-3 text-center text-base leading-tight font-medium tracking-tight text-ink md:text-lg">
        {member.name}
      </p>
      <p className="mt-1 text-center text-sm leading-snug text-ink-2">{member.role}</p>
    </li>
  );
}

/** Until a portrait arrives: a head and shoulders, quietly, in the ink. */
function Silhouette() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 h-full w-full"
    >
      <rect width="400" height="500" fill="#e3e6ea" />
      <circle cx="200" cy="200" r="78" fill="#cfd4da" />
      <path d="M50 500c0-95 67-170 150-170s150 75 150 170z" fill="#cfd4da" />
    </svg>
  );
}
