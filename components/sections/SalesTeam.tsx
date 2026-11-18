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
 * the company's WhatsApp and Call buttons centred across the top, and the team
 * as two small org charts beneath, side by side on desktop, one per manager with their
 * direct reports beneath, joined by connector lines. Each card is a portrait with the name and
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
      {/* The introduction centred across the top, then the two charts side by
          side from `lg`: the first manager's team on the left, the second's on
          the right. Stacked below `lg`. */}
      <div className="mx-auto max-w-[1440px]">
        <div className="text-center">
          <Reveal>
            <p className="text-xs font-medium tracking-[0.2em] text-ink-2 uppercase md:text-sm">
              {copy.eyebrow}
            </p>
            <h2
              id="sales-team-heading"
              className="mx-auto mt-4 max-w-[24ch] text-[clamp(1.75rem,3.4vw,3rem)] leading-[1.05] font-medium tracking-tighter text-balance text-ink"
            >
              {copy.heading}
            </h2>
            <p className="mx-auto mt-5 max-w-[60ch] text-[1.0625rem] leading-[1.5] text-pretty text-ink-2 md:mt-6">
              {copy.lede}
            </p>
            {/* The whole team at once: the company's WhatsApp and phone, the
                same ones every card falls back to until members have their
                own numbers. */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
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

        {/* One small chart per manager, in the client's order: the manager
            alone and centred, joined by an org-chart connector to the row of
            people who report to them. Two columns from `lg`, left then right. */}
        <div className="mt-14 space-y-16 md:mt-16 md:space-y-20 lg:mt-20 lg:grid lg:grid-cols-2 lg:gap-12 lg:space-y-0">
          {copy.teams.map((team) => (
            <div key={team.lead.name}>
              <ul className="flex justify-center gap-4">
                <Member member={team.lead} />
              </ul>
              <Connector to={team.reports.length} />
              <ul className="flex justify-center gap-4">
                {team.reports.map((member) => (
                  <Member key={member.name} member={member} size={team.reports.length === 3 ? "third" : "half"} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * The line from a manager down to their reports. Drawn with borders rather
 * than an SVG so it follows the cards' widths at every breakpoint: a bracket
 * spans from the centre of the first report to the centre of the last, which
 * is (n - 1) card widths plus (n - 1) gaps - the same arithmetic as the row
 * beneath it.
 *
 *   1 -> 1   a straight stem
 *   1 -> 2   a stem, then an upturned U over the pair
 *   1 -> 3   a stem, then an upturned U over the three with a tick to the middle
 */
const LINE = "border-[rgb(16_18_21/0.18)]";
const STEM = "mx-auto h-5 w-px bg-[rgb(16_18_21/0.18)]";
/* Fluid at every width (the cards are a share of their column, capped at
   14rem, with a 1rem gap), because from `lg` each chart only has half the
   page and three fixed-width cards would not fit in it. */
const BRACKET: Record<number, string> = {
  2: "w-[min(calc(50%+0.5rem),15rem)]",
  3: "w-[min(calc(66.667%+0.667rem),30rem)]",
};

function Connector({ to }: { to: number }) {
  return (
    <div aria-hidden className="py-3">
      <div className={STEM} />
      {BRACKET[to] ? (
        <div className={`relative mx-auto h-5 border-x border-t ${LINE} ${BRACKET[to]}`}>
          {to === 3 ? <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[rgb(16_18_21/0.18)]" /> : null}
        </div>
      ) : (
        <div className={STEM} />
      )}
    </div>
  );
}

/** Card widths: a pair, as before, or three abreast under one manager. */
const MEMBER_WIDTH = {
  half: "w-[calc(50%-0.5rem)] max-w-56",
  third: "w-[calc((100%-2rem)/3)] max-w-56",
};

function Member({ member, size = "half" }: { member: SalesMember; size?: keyof typeof MEMBER_WIDTH }) {
  /* A plain card: portrait, name, role. No hover state and no per-person
     contact buttons for now; the section's own WhatsApp and Call buttons
     reach the team. `whatsapp` / `phone` on SalesMember are kept for when
     individual numbers are supplied. */
  return (
    <li className={MEMBER_WIDTH[size]}>
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        {member.photo ? (
          <Image
            src={member.photo}
            alt=""
            fill
            sizes="(min-width: 768px) 224px, 50vw"
            className="object-cover object-[50%_20%]"
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
