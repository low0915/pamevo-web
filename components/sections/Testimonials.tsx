import { Quotes } from "@phosphor-icons/react/dist/ssr";
import { TESTIMONIALS } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";

export function Testimonials() {
  return (
    <section className="sheet relative mb-[4em] bg-surface-2 py-24 md:py-36">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8 lg:px-12">
        <Reveal>
          <h2 className="text-4xl leading-[1.1] font-medium tracking-tighter text-ink capitalize md:text-5xl lg:text-6xl">
            {TESTIMONIALS.heading}
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="glass glass-rim relative mt-12 overflow-hidden rounded-[16px] p-10 md:mt-16 md:p-16">
            <Quotes
              size={40}
              weight="fill"
              aria-hidden
              className="text-[rgb(126_133_140/0.35)]"
            />
            <p className="mt-6 max-w-[24ch] text-3xl leading-tight font-medium tracking-tight text-ink md:text-4xl">
              {TESTIMONIALS.emptyState.line}
            </p>
            <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-ink-2">
              {TESTIMONIALS.emptyState.detail}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
