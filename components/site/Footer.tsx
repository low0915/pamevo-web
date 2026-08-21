import {
  siWhatsapp,
  siFacebook,
  siInstagram,
  siTiktok,
  siXiaohongshu,
} from "simple-icons";
import { FOOTER } from "@/lib/content";
import { Z } from "@/lib/z";
import { MetalRule } from "@/components/ui/MetalRule";

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
      className="relative border-t border-line bg-surface pt-20 pb-10 md:pt-24"
      style={{ zIndex: Z.raised }}
    >
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <p className="metal-text text-3xl font-medium tracking-tighter">
              {FOOTER.brand}
            </p>
            <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-ink-2">
              {FOOTER.blurb}
            </p>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-sm font-medium text-ink-3">
              {FOOTER.reachHeading}
            </h2>
            <ul className="mt-5 grid gap-2 text-base text-ink-2">
              <li>
                <a href="#" aria-disabled="true" className="hover:text-ink">
                  {FOOTER.phone}
                </a>
              </li>
              <li>
                <a href="#" aria-disabled="true" className="hover:text-ink">
                  {FOOTER.email}
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-sm font-medium text-ink-3">
              {FOOTER.brand}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-2">
              {FOOTER.company}
            </p>
            <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-ink-3">
              {FOOTER.address}
            </p>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-sm font-medium text-ink-3">
              {FOOTER.connectHeading}
            </h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {FOOTER.socials.map((name) => {
                const mark = MARKS[name as keyof typeof MARKS];
                return (
                  <li key={name}>
                    <a
                      href="#"
                      aria-disabled="true"
                      aria-label={name}
                      className="grid size-9 place-items-center rounded-full border border-line text-ink-2 transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97] hover:text-ink"
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

        <div className="mt-6 flex flex-col gap-3 text-sm text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>{FOOTER.copyright}</p>
          <a href="#" aria-disabled="true" className="hover:text-ink">
            {FOOTER.terms}
          </a>
        </div>
      </div>
    </footer>
  );
}
