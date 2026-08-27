import type { NextConfig } from "next";

import { LEGACY_REDIRECTS } from "./lib/legacy-urls";

/** React's dev overlay compiles with `eval` and Turbopack hot-reloads over a
    websocket. Neither exists in the production bundle, so both allowances are
    scoped to dev rather than shipped. */
const isDev = process.env.NODE_ENV === "development";

/**
 * The site is fully static and same-origin: no third-party scripts, no XHR, no
 * embeds. Every directive is therefore `'self'` unless a comment says why not.
 */
const CSP = [
  "default-src 'self'",
  // Next inlines the hydration payload (`self.__next_f.push(...)`) directly in
  // the HTML. Removing 'unsafe-inline' means nonces, and nonces mean rendering
  // every request dynamically.
  //
  // The site does now take user input, at /contact. That input is never
  // rendered back to any page — it is validated in app/api/contact/route.ts and
  // sent as the plain-text body of an email — so there is still no injection
  // sink here for 'unsafe-inline' to widen. If a submission ever becomes
  // visible on the site, this trade needs revisiting.
  //
  // The cookie plugin needs nothing here: it is bundled first-party and calls
  // nowhere. A tracker would — when one is added, allowlist its host here and
  // on connect-src and img-src (GA4: https://www.googletagmanager.com,
  // https://*.google-analytics.com). Note that allowlisting is not the gate.
  // The gate is `<script type="text/plain" data-category="...">` plus the
  // plugin's opt-in mode; CSP only decides whether the script may load once
  // consent has already let it off the leash.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // 15 `style={{}}` props render as style attributes, which style-src-attr
  // rejects without this.
  "style-src 'self' 'unsafe-inline'",
  // `.grain` paints an inline data: SVG — see app/globals.css.
  "img-src 'self' data: blob:",
  // next/font self-hosts Geist; nothing is fetched from fonts.googleapis.com.
  "font-src 'self'",
  // public/hero-video.mp4, played by the hero.
  "media-src 'self'",
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    /**
     * Required as of Next 16, and it defaults to `[75]` ALONE.
     *
     * This is not a tuning knob, it is a bug fix. The codebase already passes
     * `quality` per image — 78 on the catalogue hero, 60 on the row thumbnails,
     * 50 on the variant strip — and without this list every one of them was
     * being silently coerced to the nearest allowed value, which is 75. The
     * per-image tuning had been doing nothing at all.
     *
     * Every value here is one an Image in this repo actually asks for. Adding a
     * new `quality` prop means adding it here too, or it snaps to a neighbour.
     */
    qualities: [50, 60, 70, 75, 78, 80],

    /**
     * AVIF first, WebP behind it. The default in this version is WebP alone.
     * AVIF is roughly 20% smaller and roughly 50% slower to encode; on a
     * catalogue of stills that are encoded once and then cached, that trade is
     * obviously worth taking. Order matters — the first entry matching the
     * request's Accept header wins.
     */
    formats: ["image/avif", "image/webp"],

    /**
     * 31 days, where the default is 4 hours.
     *
     * Nothing in public/ changes between deploys and the filenames are stable,
     * so re-deriving them six times a day buys nothing. It costs something,
     * too: several sources are multi-megabyte (stats-extrusion.png is 8.3 MB of
     * photographic content in a PNG container), and the first request at each
     * size pays for sharp to decode the original. Caching for a month means
     * that is paid once rather than on a loop.
     */
    minimumCacheTTL: 2678400,
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          // frame-ancestors already covers this for modern browsers; kept for
          // the ones that only understand the legacy header.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  /** The WordPress URLs this build inherits. See lib/legacy-urls.ts. */
  async redirects() {
    return LEGACY_REDIRECTS;
  },
};

export default nextConfig;
