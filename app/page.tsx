import { Hero } from "@/components/sections/Hero";
import { Background } from "@/components/sections/Background";
import { WhyChoose } from "@/components/sections/WhyChoose";
import { Stats } from "@/components/sections/Stats";
import { Services } from "@/components/sections/Services";
import { Projects } from "@/components/sections/Projects";
import { Z } from "@/lib/z";

export default function Home() {
  return (
    <main className="flex-1">
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
        className="relative -mt-[200dvh] flow-root bg-bg shadow-[0_-16px_40px_-28px_rgb(16_18_21/0.14)]"
        style={{ zIndex: Z.raised }}
      >
        <Background />
        <WhyChoose />
        <Stats />
        <Services />
        <Projects />
      </div>
    </main>
  );
}
