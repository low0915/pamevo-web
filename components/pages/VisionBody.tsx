import Image from "next/image";

import { VISION, VISION_ZH, VISION_BM } from "@/lib/content";
import type { Locale } from "@/lib/paths";
import { PageBanner } from "@/components/sections/PageBanner";
import { Reveal } from "@/components/ui/Reveal";

/**
 * /vision-mission, /bm/vision-mission and /zh/vision-mission.
 *
 * A server component, so the copy arrives as a prop rather than through the
 * locale context — context is a client mechanism and this page renders on the
 * server, which is the whole point of routing the languages separately.
 * ContactBody and ProductsIntro take the same shape.
 *
 * The composition is the site's existing page vocabulary rather than a new one:
 * the shared `PageBanner` at the head, which /our-products and /contact both
 * open on, and then two editorial rows on the page's own ground. Nothing here
 * is invented — the mono label, the `Reveal` sequence and the 1440 box with its
 * gutters are all lifted from sections that already exist.
 *
 * TWO ROWS, MIRRORED. The picture leads on the first and follows on the second,
 * which is one line of `order` and is the difference between a page that reads
 * as a pair of statements and one that reads as the same row printed twice.
 *
 * The banner takes no `figure`. PageBanner treats that as a complete
 * composition rather than a broken one — the ground strip stays and the empty
 * half reads as deliberate — and the only cut-outs on the site are a window
 * corner and the showroom, neither of which is what these two statements are
 * about.
 */
export function VisionBody({ locale = "EN" }: { locale?: Locale }) {
  /* Keyed off a table rather than a chain of ternaries, so a language added to
     `Locale` and missed here is a type error rather than an English page under
     a translated heading. That was a real bug on /our-products once. */
  const TRANSLATIONS: Record<Locale, Partial<typeof VISION>> = {
    EN: {},
    BM: VISION_BM,
    ZH: VISION_ZH,
  };
  const copy = { ...VISION, ...TRANSLATIONS[locale] };

  return (
    <main className="flex-1">
      <PageBanner
        heading={copy.banner.heading}
        subheading={copy.banner.lede}
        /* The showroom and the window-corner cut-out, which is /contact's
           banner exactly. It was the brushed-aluminium texture and no figure;
           the pages now open the same way as each other on purpose, so the
           difference between them is the words rather than the picture.

           The second number in `position` is the one that moves the showroom up
           or down inside the band — 0% is the top of the photograph, 100% the
           bottom. See BannerOverlay in PageBanner. */
        overlay={{ src: "/pa mevo_up.png", position: "50% 15%" }}
        /* Portrait where the extrusions on /our-products are landscape, so it
           takes neither of that one's framing settings: centred rather than
           pushed right, because the figure box deliberately runs past the
           band's edge and a narrow subject pushed into that corner is clipped
           instead of bleeding off it; and not mirrored, because unlike the
           extrusions it already faces the way the band wants. */
        figure={{
          src: "/Camada 1.png",
          position: "55% 50%",
          scale: 1.1,
          offsetY: "5%",
        }}
      />

      <section className="px-4 pt-20 pb-24 md:px-8 md:pt-24 md:pb-32 lg:px-12">
        <div className="mx-auto w-full max-w-[1440px]">
          {/* Carried for structure and not shown: the two blocks below print
              "Vision" and "Mission" themselves, and a visible heading here
              would be the page saying the same thing a third time after the
              banner has already said it. */}
          <h2 className="sr-only">{copy.heading}</h2>

          {/* The only thing separating the two statements, now that the
              `MetalRule` that used to divide them is gone.

              It went 32/48 first, which was the rule's own margins added
              together — the line removed and the rows left exactly where they
              stood. That turned out to be too much air once there was nothing
              drawn in it: a gap that reads as deliberate under a rule reads as
              a missing section without one. 20/28 is 80px and 112px, against
              rows about 440px tall, so the pair still reads as two rows and no
              longer as two sections. */}
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
      </section>
    </main>
  );
}
