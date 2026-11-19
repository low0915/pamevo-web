import Image from "next/image";
import Link from "next/link";
import {
  siWhatsapp,
  siFacebook,
  siInstagram,
  siTiktok,
  siXiaohongshu,
} from "simple-icons";
import { FOOTER, LOGO_ALT } from "@/lib/content";
import { Z } from "@/lib/z";
import { MetalRule } from "@/components/ui/MetalRule";
import { FooterBlurb } from "./FooterBlurb";
import { FooterCatalogue } from "./FooterCatalogue";

/** Brand marks come from Simple Icons rather than being drawn by hand. */
const MARKS = {
  WhatsApp: siWhatsapp,
  Facebook: siFacebook,
  Instagram: siInstagram,
  TikTok: siTiktok,
  Xiaohongshu: siXiaohongshu,
} as const;

export function Footer() {
  return (
    <footer
      /* The gutters sit out here, on the footer itself, and the 1440 cap goes
         on the box inside them. That is the order every section on the site
         uses — see Projects, ProductCatalog, ProductsIntro, /contact and
         /privacy — and the order matters: capping first and padding inside the
         cap, which is what this did, measured the 1440 to the OUTSIDE of the
         gutters and left the footer's content 96px narrower than the section
         directly above it on any viewport past the cap. The border still spans
         the full width, because it is on the footer and not on this box. */
      className="relative border-t border-line bg-surface px-6 pt-20 pb-10 md:px-8 md:pt-24 lg:px-10"
      style={{ zIndex: Z.raised }}
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            {/* The lockup stands in for the wordmark here, at the same
                weight the metal-text title carried. Sized by height so the
                co-branded proportions hold at any column width. */}
            <Image
              src="/logo.png"
              alt={LOGO_ALT}
              width={2220}
              height={174}
              className="h-5 w-auto max-w-full md:h-6"
            />
            <FooterBlurb className="mt-5 max-w-[42ch] text-base leading-relaxed text-ink-2" />
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-sm font-medium text-ink-3">
              {FOOTER.reachHeading}
            </h2>
            <ul className="mt-4 grid text-base text-ink-2 lg:mt-5 lg:gap-2">
              <li>
                <a href={FOOTER.phoneHref} className="inline-block py-2 hover:text-ink lg:py-0">
                  {FOOTER.phone}
                </a>
              </li>
              <li>
                <a href={FOOTER.emailHref} className="inline-block py-2 hover:text-ink lg:py-0">
                  {FOOTER.email}
                </a>
              </li>
              <li>
                <FooterCatalogue className="inline-block py-2 hover:text-ink lg:py-0" />
              </li>
            </ul>
            {/* The registered name and the showroom address, under the
                phone and email. */}
            <p className="mt-5 text-base leading-relaxed text-ink-2">
              {FOOTER.company}
            </p>
            <p className="mt-3 max-w-[38ch] text-base leading-relaxed text-ink-3">
              {FOOTER.address}
            </p>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-sm font-medium text-ink-3">
              {FOOTER.mapHeading}
            </h2>
            {/* The showroom on Google Maps, in the column the address used to
                fill. Lazy, so it is only fetched when the footer is near the
                screen. */}
            <iframe
              src={FOOTER.mapEmbed}
              title={FOOTER.mapTitle}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="mt-5 aspect-[4/3] w-full rounded-[4px] border border-line"
            />
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-sm font-medium text-ink-3">
              {FOOTER.connectHeading}
            </h2>
            {/* One row of five below `lg`, where the column is the full width
                of the screen or half of it and all five fit at 44px. Three to a
                row from `lg`, where this is the narrowest of four columns:
                WhatsApp, Facebook, Instagram over TikTok and Xiaohongshu. */}
            <ul className="mt-5 flex gap-2 lg:grid lg:w-max lg:grid-cols-3">
              {FOOTER.socials.map(({ name, url }) => {
                const mark = MARKS[name as keyof typeof MARKS];
                return (
                  <li key={name}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={name}
                      className="grid size-11 place-items-center rounded-full border border-line lg:size-9 text-ink-2 transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97] hover:text-ink"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width={15}
                        height={15}
                        fill="currentColor"
                        aria-hidden
                      >
                        <path d={mark.path} />
                      </svg>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <MetalRule className="mt-16 w-full" />

        <div className="mt-6 flex flex-col gap-1 text-sm sm:gap-3 text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>{FOOTER.copyright}</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="py-2 hover:text-ink lg:py-0">
              {FOOTER.privacy}
            </Link>

            {/* Bound by the cookie plugin, which sweeps the document for this
                attribute once, when it starts. That works because the footer
                lives in the root layout and never unmounts — the same button
                inside a page would go quiet after a client navigation. */}
            <button
              type="button"
              data-cc="show-preferencesModal"
              className="py-2 transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97] hover:text-ink lg:py-0"
            >
              {FOOTER.cookiePreferences}
            </button>

            {/* "Terms and Conditions" used to sit here as an href="#" that went
                nowhere. A visible link that cannot be followed is worse than no
                link: it advertises a document the site does not have, and it is
                one more crawlable dead end. Put it back when the page exists. */}
          </div>
        </div>
      </div>
    </footer>
  );
}
