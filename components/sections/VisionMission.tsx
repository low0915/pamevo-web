import Image from "next/image";

import { VISION, VISION_ZH, VISION_BM } from "@/lib/content";
import type { Locale } from "@/lib/paths";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Vision and mission, as a section of the profile page.
 *
 * WHAT THIS WAS. A page of its own at /vision-mission, opening on the shared
 * `PageBanner` with its own `h1`. The page is gone — its subject belongs with
 * the company's own story rather than one click away from it — and everything
 * below that banner is this section, unchanged: the mono label, the `Reveal`
 * sequence, the mirrored rows and the 1440 box with its gutters.
 *
 * The banner did not survive the move and could not have. A page carries one
 * `h1`, the profile page's is the one Background prints at the top of it, and a
 * second full-bleed band with a second heading a screen further down would have
 * read as the start of a second page. What the banner said is still here: its
 * heading is this section's `h2` and its lede is the standfirst under it, which
 * is why `VISION.banner` is still the source for both.
 *
 * A server component, so the copy arrives as a prop rather than through the
 * locale context — context is a client mechanism and the profile page renders
 * on the server, which is the whole point of routing the languages separately.
 */
export function VisionMission({ locale = "EN" }: { locale?: Locale }) {
  /* Keyed off a table rather than a chain of ternaries, so a language added to
     `Locale` and missed here is a type error rather than an English section
     under a translated heading. That was a real bug on /our-products once. */
  const TRANSLATIONS: Record<Locale, Partial<typeof VISION>> = {
    EN: {},
    BM: VISION_BM,
    ZH: VISION_ZH,
  };
  const copy = { ...VISION, ...TRANSLATIONS[locale] };

  return (
    <section className="px-6 pt-20 pb-24 md:px-8 md:pt-24 md:pb-32 lg:px-10">
      <div className="mx-auto w-full max-w-[1440px]">
        {/* An `h2`, and visible where the page version's was `sr-only`. On its
            own page the banner had already said this and printing it again
            under the banner would have said it twice; here there is no banner,
            the section follows a chapter about something else, and a reader
            arriving at it needs telling what changed. */}
        <h2 className="max-w-[20ch] text-[clamp(1.75rem,3.4vw,3rem)] leading-[1.05] font-medium tracking-tighter text-balance text-ink">
          {copy.banner.heading}
        </h2>
        <p className="mt-5 max-w-[58ch] text-[1.0625rem] leading-[1.5] text-ink-2 md:mt-6">
          {copy.banner.lede}
        </p>

        {/* The gap between the two statements, and the only thing separating
            them now that the `MetalRule` that used to divide them is gone.

            It went 32/48 first, which was the rule's own margins added together
            — the line removed and the rows left exactly where they stood. That
            turned out to be too much air once there was nothing drawn in it: a
            gap that reads as deliberate under a rule reads as a missing section
            without one. 20/28 is 80px and 112px, against rows about 440px tall,
            so the pair still reads as two rows and no longer as two sections. */}
        <div className="mt-14 md:mt-20">
          {copy.blocks.map((block, i) => (
            <Reveal
              key={block.label}
              delay={i * 0.08}
              className={i > 0 ? "mt-20 md:mt-28" : ""}
            >
              <div className="grid items-center gap-8 md:gap-12 lg:grid-cols-2 lg:gap-16">
                {/* `order` at `lg` only. Below it the picture leads on both
                    rows, because a mirrored stack on a phone is just the same
                    stack — the alternation only exists once there are two
                    columns to alternate between. */}
                <div
                  className={`relative aspect-[3/2] w-full overflow-hidden rounded-[4px] ${
                    i % 2 ? "lg:order-2" : ""
                  }`}
                >
                  <Image
                    src={block.image.src}
                    alt={block.image.alt}
                    fill
                    /* Half the 1440 box from `lg`, full width below it. */
                    sizes="(min-width: 1024px) 44vw, 100vw"
                    quality={78}
                    className="object-cover object-center"
                  />
                </div>

                <div className={i % 2 ? "lg:order-1" : ""}>
                  {/* The same 12px mono, uppercase, on wide tracking that
                      ProductDetail, ProductSpecs, /privacy and the enquiry band
                      use for a label. `text-ink-3` is safe here where it would
                      not be on the header's glass: this sits on the page's own
                      near-white ground at 4.6:1, not over photography. */}
                  <p className="font-mono text-xs tracking-[0.18em] text-ink-3 uppercase">
                    {block.label}
                  </p>

                  {/* A statement, so it is set as one — display size rather
                      than body size, and capped at 26ch-ish by the column
                      itself rather than by a measure, since each is a single
                      sentence. `text-pretty` to keep a short last line off its
                      own row. */}
                  <p className="mt-5 text-[clamp(1.25rem,2.1vw,1.75rem)] leading-[1.35] tracking-tight text-pretty text-ink">
                    {block.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
