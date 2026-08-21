import { PRODUCTS_PAGE } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The title block of /our-products.
 *
 * The top padding clears the fixed header island, which occupies the first 80px
 * of the viewport (top-4 plus h-16). Same clearance Background.tsx uses.
 *
 * The slogan is set in plain ink rather than .metal-text. The metal gradient's
 * mid stop is #7e858c, which on the #f4f5f6 ground measures about 2.6:1 and
 * fails even the 3:1 large-text threshold at this size. The gradient earns its
 * place on the hero wordmark and the stat numerals because those are enormous.
 */
export function ProductsIntro() {
  return (
    <section className="px-4 pt-32 pb-14 md:px-8 md:pt-40 md:pb-20 lg:px-12">
      <div className="mx-auto w-full max-w-[1440px]">
        <Reveal>
          <h1 className="text-6xl leading-[1.02] font-medium tracking-tighter text-ink md:text-7xl lg:text-[5rem]">
            {PRODUCTS_PAGE.heading}
          </h1>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mt-6 text-2xl font-medium tracking-tight text-ink md:text-3xl">
            {PRODUCTS_PAGE.slogan}
          </p>
        </Reveal>

        <Reveal delay={0.14}>
          <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-ink-2 md:text-lg">
            {PRODUCTS_PAGE.subheading}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
