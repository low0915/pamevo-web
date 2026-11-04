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
 * The sales team, closing /our-profile: the title and description on the site
 * gutter, then the team as portraits laid edge to edge, with no gaps.
 *
 * The portraits carry no text until they are asked: hovering one (or giving
 * it focus, which is what a tap does on a touch screen) darkens it and brings
 * up the name, role, languages and the two ways to reach that person. The
 * reveal is opacity only, never `display`, so the details are in the page for
 * screen readers and search engines the whole time, and tabbing to a button
 * reveals the card it is on (`focus-within`).
 *
 * On a screen with no hover the name and role are always shown along the
 * foot of each portrait, so a phone reader knows a tap does something and
 * whom it is on; the tap adds the languages and buttons.
 *
 * Four across from `md`, two on a phone. A server component, so the copy
 * arrives through `locale`, as on the rest of this page.
 */
export function SalesTeam({ locale = "EN" }: { locale?: Locale }) {
  const TRANSLATIONS: Record<Locale, Partial<typeof SALES_TEAM>> = {
    EN: {},
    BM: SALES_TEAM_BM,
    ZH: SALES_TEAM_ZH,
  };
  const copy = { ...SALES_TEAM, ...TRANSLATIONS[locale] };

  return (
    <section aria-labelledby="sales-team-heading" className="border-t border-line bg-surface pt-20 md:pt-24 lg:pt-28">
      <div className="px-6 md:px-8 lg:px-10">
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
        </Reveal>
      </div>

      <ul className="mt-14 grid grid-cols-2 md:mt-16 md:grid-cols-4">
        {copy.members.map((member, i) => (
          <Member key={`${member.role}-${i}`} member={member} copy={copy} />
        ))}
      </ul>
    </section>
  );
}

function Member({
  member,
  copy,
}: {
  member: SalesMember;
  copy: typeof SALES_TEAM;
}) {
  return (
    <li
      /* Focusable, so a tap on a touch screen (which focuses it) reveals it
         the way a hover does with a mouse. */
      tabIndex={0}
      className="group relative aspect-[4/5] overflow-hidden bg-surface outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-inset"
    >
      {member.photo ? (
        <Image
          src={member.photo}
          alt=""
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-focus-within:scale-105 group-hover:scale-105 motion-reduce:transition-none"
        />
      ) : (
        <Silhouette />
      )}

      {/* The darkening, under the text. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/10 opacity-0 transition-opacity duration-300 ease-out group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-75 [@media(hover:none)]:group-focus-within:opacity-100"
      />

      <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-6">
        {/* Name and role: on hover with a mouse; always, on a touch screen. */}
        <div className="opacity-0 transition-[opacity,translate] duration-300 ease-out group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 md:translate-y-2 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
          <p className="text-lg leading-tight font-medium tracking-tight md:text-xl">
            {member.name}
          </p>
          <p className="mt-1 text-sm leading-snug text-white/80">{member.role}</p>
        </div>

        {/* Languages and the buttons: on hover or focus. On a touch screen they
            take no room until the tap, so the name sits on the foot. */}
        <div className="opacity-0 transition-opacity duration-300 ease-out group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:hidden [@media(hover:none)]:group-focus-within:block">
          <ul aria-label="Languages" className="mt-3 flex flex-wrap gap-1.5">
            {member.languages.map((language) => (
              <li
                key={language}
                className="rounded-full border border-white/40 px-2.5 py-0.5 text-xs font-medium tracking-wide"
              >
                {language}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={member.whatsapp ?? WHATSAPP.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium tracking-tight text-ink transition-transform duration-[160ms] ease-out active:scale-[0.97]"
            >
              <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
                <path d={siWhatsapp.path} />
              </svg>
              {copy.whatsapp}
            </a>
            <a
              href={member.phone ?? FOOTER.phoneHref}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/50 px-4 text-sm font-medium tracking-tight text-white transition-transform duration-[160ms] ease-out active:scale-[0.97]"
            >
              <PhoneIcon size={16} weight="bold" aria-hidden />
              {copy.call}
            </a>
          </div>
        </div>
      </div>
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
      className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-focus-within:scale-105 group-hover:scale-105 motion-reduce:transition-none"
    >
      <rect width="400" height="500" fill="#e3e6ea" />
      <circle cx="200" cy="200" r="78" fill="#cfd4da" />
      <path d="M50 500c0-95 67-170 150-170s150 75 150 170z" fill="#cfd4da" />
    </svg>
  );
}
