import { Hero } from "@/components/sections/Hero";
import { WhyMevo } from "@/components/sections/WhyMevo";
import { DoorCollection } from "@/components/sections/DoorCollection";
import { Stats } from "@/components/sections/Stats";
import { Testimonials } from "@/components/sections/Testimonials";
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
        The hero is a plain full-screen slider in normal flow now, so the sheet
        starts directly below it rather than being pulled up over a pinned
        runway. `bg-bg` is still required: several sections are transparent.
        `flow-root` stops the first section's top margin collapsing out of the
        sheet, and unlike `overflow-hidden` it does not break the sticky
        heading inside the Background section.
      */}
      <div
        className="relative flow-root bg-bg shadow-[0_-16px_40px_-28px_rgb(16_18_21/0.14)]"
        style={{ zIndex: Z.raised }}
      >
        {/* THE CURTAIN IS SWITCHED OFF for now: HOME_CURTAIN in lib/curtain.ts.
            Set it back to `true` to restore everything described below. */}
        {/* The band the sheet opens on. WhyMevo holds a runway of its own as well, which it did not
            before: 250svh around a 100lvh sticky frame, so ProductGrid can be
            pulled up 110svh and drawn over it the way Background is drawn over
            ProductGrid and Stats over Background. That makes the whole page one
            unbroken chain of curtains from the hero down — every section from
            here on rides over a frame that is still pinned.

            The two runways are the same 250svh on purpose: this pair is the
            only place on the page where one section is both ends of a handover,
            and matching them is what keeps that legible. */}
        {/* Product first: the door collection opens the sheet and the product
            grid follows it, so the first two things on the page are what is
            sold, and Why Choose comes after as the reason to buy it here. The
            door collection heads the chain (no pull-up, runway only); WhyMevo
            and ProductGrid are both pulled up 110svh over a pinned frame and
            both hold the same 250svh runway, so either order keeps the chain,
            and Stats now rides over WhyMevo's frame. */}
        <DoorCollection />
        {/* The six-product grid is hidden for now. To bring it back, import
            ProductGrid and render <ProductGrid /> here again; WhyMevo now
            rides over the door collection's runway instead. */}
        <WhyMevo />
        {/* WhyChoose stood here and Services stood between Stats and Projects.
            Background stood between ProductGrid and Stats. All three are out of
            the home page; all three still exist, and Background is still the
            whole of /our-profile, where it renders its `standalone` branch.

            THE CURTAIN CHAIN SURVIVED THE CUT, and it is worth writing down
            why, because it is the thing a change like this quietly breaks.
            Every section below the hero is pulled up over the one above it and
            has to land on a frame that is still pinned; take a link out and the
            next curtain lands on whatever it now finds.

            Stats pulls up 110svh. It landed on WhyChoose, then on Background,
            and now on ProductGrid — whose runway is 250svh holding a 100lvh
            sticky frame, so that frame is pinned for 150svh and Stats' top edge
            reaches the top of the screen at 140. Ten svh of slack: the same
            margin it had over Background's much longer 370svh runway, and the
            same one every other handover on this page is built on.

            Losing Background cost the page 370svh of runway and nothing else.
            The band it used to ride over is the same band Stats rides over now,
            and ProductGrid's own 250svh was already sized to be ridden over —
            it is what Background itself was landing on.

            Projects pulls up `svc-curtain` and used to land on Services. It now
            lands on Stats, which is what that class was written against in the
            first place: `.band-runway` is 240svh — 30 of hold, one screen of
            travel, 110 of pull-up — and the `- 4em` in the margin is Stats'
            own `mb-[4em]`. Services was borrowing the same arrangement.

            So nothing needed retuning. If a section is ever added back into
            this stack, the thing to check is that whatever sits above a curtain
            still holds a pinned frame for at least the 110svh it is pulled
            over. */}
        {/* Projects is hidden from the home page for now (and from the nav:
            /our-projects still exists). It was the curtain over Stats, so Stats
            is now the last band and is told so — see `last` in Stats.tsx. To
            bring it back: render <Projects /> here again and drop `last`. */}
        <Stats last />
        {/* The testimonials close the page, in plain flow after the stat
            band: no curtain, so Stats keeps its `last` runway and this
            section is only as tall as its own content. See Testimonials. */}
        <Testimonials />
      </div>
    </main>
  );
}
