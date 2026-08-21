import type { NextConfig } from "next";

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
  // every request dynamically — a bad trade for a brochure site with no user
  // input and no injection sinks.
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
};

export default nextConfig;
