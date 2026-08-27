import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Grain } from "@/components/ui/Grain";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { CookieConsent } from "@/components/site/CookieConsent";
import { LocaleSync } from "@/lib/locale";
import { SEO, SITE } from "@/lib/content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Chinese. Geist is Latin-only, so without this every CJK character falls
 * through to whatever the reader's OS supplies - YaHei on Windows, PingFang on
 * Apple - and the ZH page looks different on every platform.
 *
 * The file is built by scripts/build-cjk-subset.mjs, not committed: 78 KB cut
 * from Huawei's 20 MB original, holding only the characters the copy sets. See
 * that script, and app/privacy for the attribution its licence asks for.
 *
 * `preload: false` is the load-bearing option here. next/font preloads by
 * default, which would make every English visitor - almost all of them - fetch
 * a font they will never render a glyph from. Left off, the browser downloads
 * it lazily, the first time Chinese text actually appears on screen.
 *
 * `weight` is a range, not a value: the subset keeps a live 400-500 weight
 * axis, which is what the ZH copy renders at (`font-medium` on the hero tagline
 * and the Services titles, 400 for body). `adjustFontFallback` is off because
 * Next computes those metrics against Arial, which tells it nothing about Han.
 */
const harmonySC = localFont({
  src: "./fonts/harmonyos-sans-sc-subset.woff2",
  variable: "--font-harmony-sc",
  weight: "400 500",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

/**
 * Root metadata: FLAT KEYS ONLY.
 *
 * Note what is deliberately absent — `openGraph`, `twitter` and `alternates`.
 * Next merges metadata shallowly, replacing nested keys wholesale rather than
 * field by field, so defaulting any of them here would hand every page that
 * does not restate them the home page's values. For `alternates` that means
 * canonicalising the whole site onto "/". Each page builds its own through
 * `pageMetadata()` in lib/seo.ts, which is where that reasoning is written out.
 *
 * `icons` is absent too, and for a different reason: it used to point at
 * /logo.png, which is the 2220x174 co-branded wordmark and renders as a smear
 * at 16px. Dropping the key lets Next's file conventions take over —
 * app/favicon.ico, and app/icon.png / app/apple-icon.png once a square mark
 * exists — which cannot go stale the way a hand-written path can.
 */
export const metadata: Metadata = {
  /** Every relative canonical and og:image below resolves against this. Without
      it they resolve against localhost in production, silently. */
  metadataBase: new URL(SITE.url),
  title: {
    default: SEO.home.title,
    /** Sub-pages set only their own half of the title; this appends the brand
        so no page can ship without it. */
    template: SEO.titleTemplate,
  },
  description: SEO.home.description,
  applicationName: SITE.name,
  publisher: SITE.legalName,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      /* Let Google use a full-size image and an untruncated snippet. Without
         these it may choose a thumbnail, which for a product catalogue that
         lives on its photography is the wrong default. */
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  /* The showroom's phone number is already a real <a href="tel:">; leaving
     detection on lets iOS Safari re-style arbitrary digit runs — the SSM
     company number, the spec figures — as if they were phone numbers too. */
  formatDetection: { telephone: false, address: false },
};

/** themeColor is deprecated inside `metadata` as of Next 14; this is where it
    goes now. The value is the brand ground, so the mobile browser chrome
    matches the page rather than flashing white against it. */
export const viewport: Viewport = {
  themeColor: "#f4f5f6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${harmonySC.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Set during parse, not at hydration: the browser restores a reload's
            scroll position on the load event, which is far too early for a
            React effect to have turned restoration off. The page is scrubbed,
            so a restored position is a reader dropped into the middle of a
            sequence they never saw begin. */}
        <script
          dangerouslySetInnerHTML={{
            __html: 'history.scrollRestoration = "manual";',
          }}
        />
        <SmoothScroll />
        {/* The locale toggle swaps copy in place rather than routing, so the
            language lives in a client-side store rather than in the URL. This
            is the one thing that has to be mounted for it: it puts the chosen
            language on <html lang>. `lang="en"` above is the value the server
            renders, and the value every first paint starts from. */}
        <LocaleSync />
        <Header />
        {children}
        <Footer />
        <Grain />
        {/* Last, and in the root layout rather than a page: the plugin sweeps
            the document once for gated scripts and for the footer's
            preferences button, so anything it must find has to be mounted by
            the time this runs, and has to stay mounted. */}
        <CookieConsent />
      </body>
    </html>
  );
}
