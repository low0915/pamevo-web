import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { SITE } from "@/lib/content";

/**
 * The share card, for every route under this segment.
 *
 * The site shipped with no Open Graph image at all, which on this project is
 * not a cosmetic gap: the sales team's primary channel is WhatsApp, WhatsApp
 * reads og:image and essentially nothing else, and so every link anyone sent
 * rendered as a bare grey rectangle.
 *
 * Generated rather than designed, because there is no square or landscape brand
 * asset in public/ to crop — logo.png is a 2220x174 wordmark, which is a 12.7:1
 * strip. Composing it here means the card exists now and needs no designer;
 * replacing this file with a real photograph later changes nothing else.
 *
 * Rendered once at build. `readFile` rather than a fetch: this runs during the
 * build with no server to fetch from, and the CSP forbids off-origin loads
 * anyway.
 *
 * EVERY element below carries an explicit `display`, and every text node is a
 * single expression rather than an interpolation sitting beside literal text.
 * Satori — the renderer behind ImageResponse — implements only a subset of CSS
 * and throws rather than guessing: "Expected <div> to have explicit display ...
 * if it has more than one child node". `{expr} · literal` is two child nodes,
 * which is what broke this the first time. It fails the BUILD, not the request,
 * so a card that renders here cannot take the deploy down later.
 */
export const alt =
  "PA Projects — aluminium windows, doors and sunrooms, Shah Alam";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public", "logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          /* The brand ground, same value as --color-bg and the viewport
             themeColor, so the card sits in the same palette as the site. */
          background: "#f4f5f6",
          padding: "80px 88px",
        }}
      >
        {/* The wordmark is the co-branded P.A. Projects x MEVO lockup. At 12.7:1
            it wants the full width of the card and very little height. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={760} alt="" />

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 62,
              letterSpacing: "-0.03em",
              color: "#101215",
              lineHeight: 1.05,
            }}
          >
            {"Aluminium Windows & Doors"}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#5b6169",
              letterSpacing: "-0.01em",
            }}
          >
            {`${SITE.name} · Shah Alam, Selangor`}
          </div>
        </div>

        {/* A single precision rule along the foot — the same restrained metal
            language the page uses, and it stops the card reading as a slide. */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 6,
            background: "linear-gradient(90deg, #7e858c 0%, #c9ced3 55%, #f4f5f6 100%)",
          }}
        />
      </div>
    ),
    size,
  );
}
