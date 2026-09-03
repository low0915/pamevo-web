import { Hero } from "@/components/sections/Hero";
import { WhyMevo } from "@/components/sections/WhyMevo";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { Background } from "@/components/sections/Background";
import { Stats } from "@/components/sections/Stats";
import { Projects } from "@/components/sections/Projects";
import { JsonLd } from "@/components/site/JsonLd";
import { homeGraph } from "@/lib/schema";
import type { Locale } from "@/lib/locale";
import { Z } from "@/lib/z";

/**
 * The home page body, shared by `/` and `/zh`.
 *
 * Every section here is a client component that reads the locale from context,
 * so the markup is identical in both languages and lives in one place. Only the
 * JSON-LD needs telling which locale it is describing, because it is built on
 * the server outside that context.
 */
export function HomeBody({ locale = "EN" }: { locale?: Locale }) {
  return (
    <main className="flex-1">
      {/* Organization + WebSite. The home page only: organisation markup
          repeated sitewide asserts the same entity once per URL. */}
      <JsonLd data={homeGraph(locale)} />

      <Hero />

      {/*
        The hero is pinned; everything below rides over it as one sheet.
        `bg-bg` is required, not decorative: several sections are transparent
        and would otherwise show the pinned hero through them.
        `flow-root` stops the first section's top margin collapsing out of the
        sheet, and unlike `overflow-hidden` it does not break the sticky
        heading inside the Background section.
      */}
      <div
        className="relative -mt-[200svh] flow-root bg-bg shadow-[0_-16px_40px_-28px_rgb(16_18_21/0.14)]"
        style={{ zIndex: Z.raised }}
      >
        {/* The band the sheet opens on, and so the one that covers the hero
            while it is still pinned. The sheet is pulled up 200svh and the hero
            holds until 400svh, which leaves 100svh of rise to cover — hence a
            frame the full height of the viewport, and an opaque one.

            WhyMevo now holds a runway of its own as well, which it did not
            before: 250svh around a 100lvh sticky frame, so ProductGrid can be
            pulled up 110svh and drawn over it the way Background is drawn over
            ProductGrid and Stats over Background. That makes the whole page one
            unbroken chain of curtains from the hero down — every section from
            here on rides over a frame that is still pinned.

            The two runways are the same 250svh on purpose: this pair is the
            only place on the page where one section is both ends of a handover,
            and matching them is what keeps that legible. */}
        <WhyMevo />
        <ProductGrid />
        <Background />
        {/* WhyChoose stood here and Services stood between Stats and Projects.
            Both are out of the home page.

            THE CURTAIN CHAIN SURVIVED THE CUT, and it is worth writing down
            why, because it is the thing a change like this quietly breaks.
            Every section below the hero is pulled up over the one above it and
            has to land on a frame that is still pinned; take a link out and the
            next curtain lands on whatever it now finds.

            Stats pulls up 110svh and used to land on WhyChoose. It now lands on
            Background, whose runway is 370svh holding a 100svh sticky frame —
            so the frame stays pinned for 270svh and the overlap starts at 260.
            Ten svh of slack, which is the same margin it had before and the
            same one the rest of the stack is built on.

            Projects pulls up `svc-curtain` and used to land on Services. It now
            lands on Stats, which is what that class was written against in the
            first place: `.band-runway` is 240svh — 30 of hold, one screen of
            travel, 110 of pull-up — and the `- 4em` in the margin is Stats'
            own `mb-[4em]`. Services was borrowing the same arrangement.

            So nothing needed retuning. If a section is ever added back into
            this stack, the thing to check is that whatever sits above a curtain
            still holds a pinned frame for at least the 110svh it is pulled
            over. */}
        <Stats />
        <Projects />
      </div>
    </main>
  );
}
