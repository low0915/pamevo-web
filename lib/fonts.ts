import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

/**
 * The typefaces, extracted here so both root layouts can share one declaration.
 *
 * next/font has to be called at module scope — it is a build-time transform,
 * not a runtime call — so these cannot live inside a component. Declaring them
 * twice, once per root layout, would build two copies of the subset and emit
 * two sets of @font-face rules for the same files.
 */

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
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
 * `preload: false` was load-bearing when one URL served both languages: next/font
 * preloads by default, which would have made every English visitor - almost all
 * of them - fetch a font they would never render a glyph from. It still is, for
 * a subtler reason now that /zh is its own route: this module is imported by
 * both root layouts, so a preload here would be emitted on the English pages
 * too. The Chinese pages fetch it on first paint instead, one round trip that
 * only the readers who need it pay for.
 *
 * `weight` is a range, not a value: the subset keeps a live 400-500 weight
 * axis, which is what the ZH copy renders at (`font-medium` on the hero tagline
 * and the Services titles, 400 for body). `adjustFontFallback` is off because
 * Next computes those metrics against Arial, which tells it nothing about Han.
 */
export const harmonySC = localFont({
  src: "../app/fonts/harmonyos-sans-sc-subset.woff2",
  variable: "--font-harmony-sc",
  weight: "400 500",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

/** Every font variable, for the <html> className. */
export const FONT_VARIABLES = `${geistSans.variable} ${geistMono.variable} ${harmonySC.variable}`;
