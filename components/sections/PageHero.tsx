import Image from "next/image";
import { ArrowDown } from "@phosphor-icons/react/dist/ssr";
import { Scrim } from "@/components/sections/Hero";

/**
 * A full-screen opening for an inner page, in the home hero's language: media
 * as the background under the same light scrim and the same light grade, the
 * text set left on the site gutter, and the same button. One slide rather than
 * a slider, so there are no controls and nothing moves. Partial height, where
 * the home hero is full screen: see the note on the section.
 *
 * It carries the page's `h1`, which PageBanner did before it on /services, and
 * Background's own heading did on /our-profile.
 *
 * The headline takes lines rather than a string: it is set one to a line, and
 * where the lines break is part of the copy, not something to leave to the
 * width of the window.
 *
 * /contact opens on ContactHero instead: the same look, as a two-slide slider.
 *
 * BELOW `md` IT FOLLOWS THE SLIDER'S PHONE LAYOUT: the copy sits at the foot
 * rather than the middle, the white rises from the foot so the top of the
 * photograph reads clear (`Scrim mobile="foot"`), the rows are set close and
 * the button is the smaller 40px pill. `pb-12` rather than the slider's
 * `pb-28`, since there are no slide controls here to clear.
 */
export function PageHero({
  eyebrow,
  headline,
  body,
  cta,
  image,
}: {
  eyebrow: string;
  headline: string[];
  body: string;
  /** An in-page fragment, so the button reads as "further down", not away. */
  cta?: { label: string; href: string };
  image: { src: string; alt: string; position?: string };
}) {
  return (
    /* Partial height: 85svh, where the home hero is the full screen. An inner
       page opens on its hero and the reader came for what is under it, so the
       top of the next section shows below the fold. The floor keeps the text
       clear of the header island on a short laptop. */
    <section className="relative h-[85svh] min-h-[600px] w-full overflow-hidden bg-surface">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="100vw"
        preload
        className="graded-hero object-cover"
        style={image.position ? { objectPosition: image.position } : undefined}
      />
      <Scrim mobile="foot" />

      <div className="absolute inset-0 flex items-end pb-12 md:items-center md:pb-0">
        <div className="w-full px-6 text-center md:px-8 md:text-left lg:px-10">
          <p className="mb-3 text-sm font-medium tracking-[0.2em] text-ink-2 uppercase md:mb-8 md:text-base">
            {eyebrow}
          </p>
          <h1 className="text-[clamp(1.875rem,3.5vw,5rem)] leading-[1] font-medium tracking-tighter text-ink">
            {/* The space keeps the lines apart as words for anything that
                reads the heading as text — a screen reader, a search result —
                where block spans alone would run "Engineering.Exceptional". */}
            {headline.map((line, i) => (
              <span key={line} className="block">
                {line}
                {i < headline.length - 1 && " "}
              </span>
            ))}
          </h1>
          <p className="mx-auto mt-3 max-w-[52ch] text-base leading-relaxed text-ink md:mx-0 md:mt-6 md:text-lg">
            {body}
          </p>
          {cta && (
            <div className="mt-5 flex justify-center md:mt-8 md:justify-start">
              <a
                href={cta.href}
                className="group inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium md:h-12 md:px-7 md:text-base tracking-tight text-bg transition-transform duration-[160ms] ease-out hover:-translate-y-0.5 active:translate-y-0"
              >
                {cta.label}
                <ArrowDown
                  className="size-4 md:size-[18px] transition-transform duration-200 ease-out group-hover:translate-y-0.5"
                />
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
