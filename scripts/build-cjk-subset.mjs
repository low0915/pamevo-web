/**
 * Cuts HarmonyOS Sans SC down to the Chinese characters this site actually
 * sets, and writes it out as a WOFF2 for next/font/local to pick up.
 *
 * Why this exists: the font Huawei ships is a 20 MB variable font carrying
 * 29,824 glyphs across a 40-900 weight axis. The site's Chinese copy uses under
 * 400 of them at two weights. Shipping the whole thing would mean a 20 MB
 * download the first time any Chinese text renders.
 *
 * The character list is not maintained by hand. It is read out of the copy
 * files themselves every build, so adding Chinese to lib/content.ts is all
 * anyone has to do - the glyphs follow. That is the whole point of generating
 * this rather than committing a subset someone has to remember to refresh.
 *
 * The source TTF lives outside public/ because everything in public/ is served:
 * it is build input, not an asset, and redistributing the font on its own is
 * something its licence does not allow. See app/privacy for the attribution
 * the licence does require.
 *
 * Run by `predev` and `prebuild`; no-ops when the output is already newer than
 * everything it is built from.
 */

import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import subsetFont from "subset-font";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const SOURCE = join(ROOT, "assets/fonts/HarmonyOS_Sans_SC.ttf");
const OUTPUT = join(ROOT, "app/fonts/harmonyos-sans-sc-subset.woff2");

/** Every file that can contain Chinese copy. Both are scanned whole rather than
    parsed: a regex over the source catches the strings wherever they sit in it,
    and cannot be broken by moving an export around. */
const COPY = ["lib/content.ts", "lib/products.ts"].map((p) => join(ROOT, p));

/**
 * CJK ideographs, CJK punctuation (。、《》), and the fullwidth forms (，：).
 * Latin inside a Chinese sentence - "MEVO MALAYSIA" - is deliberately not here:
 * Geist covers it and comes first in the stack, so it stays in Geist.
 */
const CJK = /[　-〿一-鿿＀-￯]/gu;

/**
 * Characters the CJK ranges above do not catch but the copy still needs, for
 * two different reasons.
 *
 * The first three Geist *does* have, and would therefore win: an em dash
 * between Geist's Latin metrics and HarmonyOS's Han ones is visibly the wrong
 * width mid-sentence. Forced in so the stack has something to fall to - see the
 * note in app/globals.css.
 *
 * `≥` is the opposite case. Geist has no glyph for it at all, so every
 * "≥700 Pa" in the performance specs has been dropping to the reader's OS font,
 * on the English page as much as the Chinese one. Carrying it here is what
 * gives it a real glyph on both.
 */
const SHARED = ["—", "…", "·", "≥"];

/** The two weights the Chinese text renders at: `font-medium` on the hero
    tagline and the Services titles, 400 for every body paragraph. Everything
    outside that range is dropped, which is most of the 11 MB `gvar` table. */
const WEIGHT = { min: 400, max: 500 };

async function mtime(path) {
  try {
    return (await stat(path)).mtimeMs;
  } catch {
    return null;
  }
}

/**
 * Skip the work when nothing it depends on has moved since the last run.
 *
 * This file counts as an input. The character ranges and the weight range are
 * decided here, so editing it changes the output as surely as editing the copy
 * does - and without this, a subset built by the previous version of the script
 * would look up to date and be silently kept.
 */
async function isFresh() {
  const out = await mtime(OUTPUT);
  if (out === null) return false;
  const self = fileURLToPath(import.meta.url);
  const inputs = await Promise.all([SOURCE, self, ...COPY].map(mtime));
  return inputs.every((t) => t !== null && t < out);
}

async function main() {
  if (await isFresh()) {
    console.log("cjk-subset: up to date, skipping");
    return;
  }

  const sources = await Promise.all(COPY.map((p) => readFile(p, "utf8")));
  const found = new Set(sources.join("").match(CJK) ?? []);
  for (const c of SHARED) found.add(c);

  if (found.size === 0) {
    console.log("cjk-subset: no Chinese copy found, nothing to build");
    return;
  }

  // Sorted so the same copy always produces byte-identical output, which keeps
  // the hash next/font puts in the filename stable across rebuilds.
  const text = [...found].sort().join("");

  const font = await readFile(SOURCE);
  const subset = await subsetFont(font, text, {
    targetFormat: "woff2",
    variationAxes: { wght: WEIGHT },
  });

  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, subset);

  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
  console.log(
    `cjk-subset: ${found.size} glyphs, wght ${WEIGHT.min}-${WEIGHT.max}, ` +
      `${kb(font.length)} -> ${kb(subset.length)}`,
  );
}

main().catch((error) => {
  console.error("cjk-subset: failed\n", error);
  process.exit(1);
});
