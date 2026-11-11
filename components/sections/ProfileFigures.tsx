import { PROFILE_FIGURES, PROFILE_FIGURES_ZH, PROFILE_FIGURES_BM } from "@/lib/content";
import type { Locale } from "@/lib/paths";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The trust band on /our-profile: the Malaysian group behind PA Projects, in
 * four figures, between the story of the company and what it is for.
 *
 * Ruled like the home page's stat band - a rule over each figure, the figure,
 * its label, a line - so the two read as the same voice. Four across from
 * `lg`, two from `sm`, one on a phone.
 *
 * A server component, so the copy arrives through `locale` rather than the
 * locale context, the same rule VisionMission follows on this page.
 *
 * No photograph yet. The one planned for it, P.A. Group's HQ, is waiting on
 * the client: see the note on PROFILE_FIGURES in lib/content.ts.
 */
export function ProfileFigures({ locale = "EN" }: { locale?: Locale }) {
  const TRANSLATIONS: Record<Locale, Partial<typeof PROFILE_FIGURES>> = {
    EN: {},
    BM: PROFILE_FIGURES_BM,
    ZH: PROFILE_FIGURES_ZH,
  };
  const copy = { ...PROFILE_FIGURES, ...TRANSLATIONS[locale] };

  return (
    <section
      aria-labelledby="profile-figures-heading"
      className="bg-surface px-6 py-20 md:px-8 md:py-24 lg:px-10 lg:py-28"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <Reveal>
          <p className="text-xs font-medium tracking-[0.2em] text-ink-2 uppercase md:text-sm">
            {copy.eyebrow}
          </p>
          <h2
            id="profile-figures-heading"
            className="mt-4 max-w-[24ch] text-[clamp(1.75rem,3.4vw,3rem)] leading-[1.05] font-medium tracking-tighter text-balance text-ink"
          >
            {copy.heading}
          </h2>
          <p className="mt-5 max-w-[60ch] text-[1.0625rem] leading-[1.5] text-ink-2 md:mt-6">
            {copy.lede}
          </p>
        </Reveal>

        <dl className="mt-14 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:gap-y-12 md:mt-16 lg:grid-cols-4">
          {copy.figures.map((figure, i) => (
            /* The Reveal is the group itself: a <dl> may hold <div> groups,
               but only one level of them. */
            <Reveal key={figure.label} delay={0.05 * i} className="flex flex-col border-t border-ink pt-6">
              {/* The figure is the term, the label what it counts: a
                  description list reads "2006 - listed on Bursa Malaysia"
                  the way the eye does. */}
              <dt className="order-2 mt-2 text-lg leading-snug font-medium tracking-tight text-ink md:text-xl">
                {figure.label}
              </dt>
              <dd className="order-1 text-[clamp(2.5rem,4.2vw,4rem)] leading-none font-normal tracking-[-0.02em] text-ink tabular-nums">
                {figure.value}
              </dd>
              <dd className="order-3 mt-3 max-w-[34ch] text-base leading-relaxed text-ink-2">
                {figure.body}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
