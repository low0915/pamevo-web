import type { Metadata } from "next";

import { FOOTER, PRIVACY, SEO } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { Reveal } from "@/components/ui/Reveal";

/** Title, description, canonical and the social cards, from one entry. See
    lib/seo.ts for why the nested keys cannot be defaulted in the layout. */
export const metadata: Metadata = pageMetadata(SEO.privacy);

/** Wider than the ~65ch a body column usually wants: this is a reference
    document read in sections rather than start to finish, and the narrower
    measure left the page looking like a column adrift in the 1440 container. */
const PARAGRAPH = "mt-4 max-w-[92ch] text-base leading-relaxed text-ink-2";

/** A section's body is a run of these: prose, a bulleted set, or a labelled
    sub-section. See PRIVACY in lib/content.ts. */
type Block = string | { list: string[] } | { title: string; body: string };

function Block({ block }: { block: Block }) {
  if (typeof block === "string") return <p className={PARAGRAPH}>{block}</p>;

  if ("list" in block) {
    return (
      <ul className={`${PARAGRAPH} list-disc space-y-2 pl-4 marker:text-ink-3`}>
        {block.list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-base font-medium tracking-tight text-ink">
        {block.title}
      </h3>
      <p className={PARAGRAPH}>{block.body}</p>
    </div>
  );
}

/**
 * Privacy and cookies.
 *
 * The copy is the client's, held in PRIVACY; this file is only its layout. The
 * cookie notice links at #cookies, so that section carries the id and the
 * scroll margin that keeps it clear of the fixed header.
 *
 * Contact details come from FOOTER rather than from PRIVACY, so the number and
 * address here are the same strings the footer prints.
 *
 * Layout follows ProductsIntro: the top padding clears the header island, which
 * occupies the first 80px of the viewport. The root layout renders children
 * bare, so each page owns its own <main>.
 */
export default function PrivacyPage() {
  return (
    <main className="flex-1">
      <section className="px-4 pt-32 pb-24 md:px-8 md:pt-40 md:pb-32 lg:px-12">
        <div className="mx-auto w-full max-w-[1440px]">
          <Reveal>
            <h1 className="text-5xl leading-[1.04] font-medium tracking-tighter text-ink md:text-6xl lg:text-7xl">
              {PRIVACY.heading}
            </h1>
          </Reveal>

          <Reveal delay={0.06}>
            <p className="mt-6 font-mono text-xs tracking-[0.18em] text-ink-3 uppercase">
              {PRIVACY.updated}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-8">
              {PRIVACY.intro.map((paragraph) => (
                <p key={paragraph} className={PARAGRAPH}>
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>

          {PRIVACY.sections.map((section) => (
            <Reveal key={section.id} delay={0.06}>
              <section id={section.id} className="mt-12 scroll-mt-28 md:mt-16">
                <h2 className="text-xl font-medium tracking-tight text-ink md:text-2xl">
                  {section.heading}
                </h2>
                {section.body.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </section>
            </Reveal>
          ))}

          <Reveal delay={0.06}>
            <section
              id="contact-us"
              className="mt-12 scroll-mt-28 md:mt-16"
            >
              <h2 className="text-xl font-medium tracking-tight text-ink md:text-2xl">
                {PRIVACY.contact.heading}
              </h2>
              <p className={PARAGRAPH}>{PRIVACY.contact.intro}</p>

              <div className="mt-6 max-w-[92ch] rounded-[16px] border border-line bg-surface p-6 md:p-8">
                <p className="text-base font-medium tracking-tight text-ink">
                  {PRIVACY.contact.name}
                </p>
                <dl className="mt-4 grid gap-2 text-base leading-relaxed text-ink-2">
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-ink-3">Email:</dt>
                    <dd>
                      <a href={FOOTER.emailHref} className="hover:text-ink">
                        {FOOTER.email}
                      </a>
                    </dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-ink-3">Phone:</dt>
                    <dd>
                      <a href={FOOTER.phoneHref} className="hover:text-ink">
                        {FOOTER.phone}
                      </a>
                    </dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-ink-3">Address:</dt>
                    <dd className="max-w-[64ch]">{FOOTER.address}</dd>
                  </div>
                </dl>
              </div>
            </section>
          </Reveal>

          {/* Set quieter than the policy above it, and behind a rule: this is a
              credit the font licences ask for, not a clause anyone came here to
              read. See PRIVACY.colophon. */}
          <Reveal delay={0.06}>
            <section
              id="typefaces"
              className="mt-16 scroll-mt-28 border-t border-line pt-8 md:mt-20"
            >
              <h2 className="font-mono text-xs tracking-[0.18em] text-ink-3 uppercase">
                {PRIVACY.colophon.heading}
              </h2>
              {PRIVACY.colophon.body.map((line) => (
                <p
                  key={line}
                  className="mt-3 max-w-[92ch] text-sm leading-relaxed text-ink-3"
                >
                  {line}
                </p>
              ))}
            </section>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
