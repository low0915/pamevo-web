import Image from "next/image";

import { PRODUCTS_PAGE, PRODUCTS_PAGE_ZH } from "@/lib/content";
import type { Locale } from "@/lib/paths";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The banner of /our-products: one word-mark of a heading over a full-bleed
 * photograph of the extrusions, on the same band /contact uses.
 *
 * The heading is the only copy. It is set as large as the band will take and
 * inverted where it crosses the picture, so the band reads as one image with a
 * title cut out of it rather than as a title with a picture behind it.
 *
 * How the inversion works, and why it is arranged this way
 * -------------------------------------------------------
 * `mix-blend-mode: difference` subtracts the layer from its backdrop, so white
 * type comes out as the photographic negative of whatever it crosses: near
 * black over the pale ground, near white over the dark aluminium. That is the
 * effect, and it is also why the heading needs no scrim - difference cannot
 * produce a low-contrast result, because the further the backdrop is from
 * white the further the result is from it too.
 *
 * The blend is on the `Reveal` wrapper rather than on the h1 inside it, and
 * that is not interchangeable. Reveal is a motion element and settles at
 * `transform: translateY(0px)` - a transform, even an identity one, makes an
 * element a stacking context, and a blend mode inside a stacking context
 * composites against that context instead of against the page. On the h1 the
 * type would blend with its own wrapper and nothing would appear to happen. On
 * the wrapper it blends with the section, which is where the picture is.
 *
 * Nothing between the wrapper and the section may isolate either: the section
 * is `position: relative` with no z-index, and the column below it likewise,
 * so both are transparent to the blend. Adding a z-index to either would
 * silently switch the effect off.
 *
 * The band is `min-h` rather than the fixed `h` /contact uses, so a long
 * heading on a narrow phone wraps instead of being clipped.
 */
export function ProductsIntro({ locale = "EN" }: { locale?: Locale }) {
  /* A server component, so the locale arrives as a prop rather than through
     the client-side context — the same rule ContactBody follows. */
  const copy = locale === "ZH" ? { ...PRODUCTS_PAGE, ...PRODUCTS_PAGE_ZH } : PRODUCTS_PAGE;

  return (
    <section className="relative flex min-h-[46svh] w-full items-end overflow-hidden md:min-h-[56svh]">
      {/* The ground. The photograph is a cut-out with transparent corners, so
          something has to sit behind it, and this is what shows through: white
          at the head, settling to grey at the foot. The direction is the point
          - it puts the lightest ground under the top of the band, where the
          crop opens onto empty space, and the weight at the bottom where the
          profiles are. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-surface via-bg to-[#d9dde1]"
      />

      <Image
        src="/aluminium profile-propduct.png"
        alt=""
        fill
        /* Was `priority`, deprecated as of Next 16. The LCP element here. */
        preload
        sizes="100vw"
        /* Y below 50% slides the crop down the frame: at 0% the image's own top
           edge sits on the band's, so everything moves down and the base of the
           stack runs off the bottom. 20% keeps the profiles substantial while
           opening a band of the grey ground above them. */
        className="object-cover object-[50%_20%]"
      />

      {/* A second, fainter grey over the picture, settling the band into the
          page at its foot. Kept light: it is the backdrop the heading inverts
          against, and weighting it too far would flatten the difference the
          blend is drawing on. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgb(217_221_225/0.22)] to-[rgb(217_221_225/0.55)]"
      />

      <div className="relative w-full px-4 pt-28 pb-8 md:px-8 md:pb-12 lg:px-12">
        <div className="mx-auto w-full max-w-[1440px]">
          {/* White, and inverted by the blend on the way down - so this is not
              the colour anyone sees. It is the value the difference is taken
              from. */}
          <Reveal className="mix-blend-difference">
            <h1 className="text-5xl leading-[0.95] font-medium tracking-tighter text-white sm:text-7xl md:text-8xl lg:text-[8.5rem] xl:text-[10rem]">
              {copy.heading}
            </h1>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
