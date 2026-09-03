// Fails the build if a picture the code asks for will not be in the deploy.
//
// This has gone wrong twice, both times identically. A file in public/ is added
// to .gitignore BECAUSE nothing references it — there is a list of them, ~18MB
// of media kept locally in case a section wants it later. Later a section does
// want it, the reference is added, and the ignore list is never revisited.
//
// Nothing catches it. The file is on disk, so `next build` is happy and the page
// is perfect locally. `git status` says nothing either, because an ignored file
// is not untracked — it is invisible. The first anyone knows is a 404 in
// production: /contact's banner, and then the Vision half of /vision-mission.
//
// So the check is: every `/something.ext` path in the source — quoted, or inside
// a CSS url() — must exist in public/ AND be a file git will actually carry.
//
// Runs from `prebuild`, so it fails before the build rather than after the
// deploy. Where git is unavailable — a build from a tarball rather than a clone
// — it degrades to the existence check and says so, rather than failing on the
// absence of a tool it only uses as an oracle.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const SKIP = new Set(["node_modules", ".next", ".git", "backups", "out", "build"]);
const SOURCE = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".css"]);
// The delimiters include parentheses as well as quotes, and that is not
// cosmetic: a path inside a CSS `url(...)` — including a Tailwind arbitrary
// value like `bg-[url(/some-file.svg)]` — has parens either side of it, not
// quotes, so a quote-only pattern walks straight past it. This check missed
// exactly that on the home page's Why Choose band, which is the third time this
// class of bug has reached a build.
const ASSET = /["'`(](\/[^"'`)\s]+\.(?:png|jpg|jpeg|webp|avif|gif|svg|mp4|webm|woff2?))["'`)]/g;

/* This file, which is the one file in the tree that writes asset paths without
   meaning them: the comment above ASSET has to show the shape it is matching,
   and the moment the pattern learned about url() it started reporting its own
   example as a missing file. A checker should not audit its own
   documentation. */
const SELF = join(ROOT, "scripts", "check-assets.mjs");

function sources(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) sources(full, out);
    else if (full !== SELF && SOURCE.has(extname(entry))) out.push(full);
  }
  return out;
}

/** Runs git and says whether it succeeded, rather than throwing. */
function git(...args) {
  try {
    execFileSync("git", args, { stdio: ["ignore", "ignore", "ignore"] });
    return true;
  } catch {
    return false;
  }
}

// asset path -> the set of source files that ask for it
const referenced = new Map();
for (const file of sources(ROOT)) {
  for (const [, asset] of readFileSync(file, "utf8").matchAll(ASSET)) {
    if (!referenced.has(asset)) referenced.set(asset, new Set());
    referenced.get(asset).add(file.slice(ROOT.length + 1));
  }
}

const haveGit = git("rev-parse", "--is-inside-work-tree");
const broken = [];

for (const [asset, from] of referenced) {
  // Generated in this same prebuild step by build-cjk-subset.mjs, and
  // deliberately never committed — see .gitignore.
  if (asset.endsWith(".woff2")) continue;

  const inRepo = `public${asset}`;
  if (!existsSync(join(ROOT, inRepo))) {
    broken.push({ asset, from, why: "not in public/" });
    continue;
  }
  if (!haveGit) continue;
  if (git("ls-files", "--error-unmatch", inRepo)) continue;

  broken.push({
    asset,
    from,
    why: git("check-ignore", "-q", inRepo)
      ? "on disk but IGNORED by .gitignore, so it is not in the commit"
      : "on disk but never committed",
  });
}

if (broken.length) {
  console.error("\nAssets referenced in the source that will 404 in production:\n");
  for (const { asset, from, why } of broken) {
    console.error(`  ${asset}`);
    console.error(`     ${why}`);
    console.error(`     used by ${[...from].join(", ")}\n`);
  }
  console.error("Un-ignore it in .gitignore and commit it, or stop referencing it.\n");
  process.exit(1);
}

console.log(
  `check-assets: ${referenced.size} referenced assets, all present${
    haveGit ? " and committed" : " (git unavailable — existence checked only)"
  }`,
);
