import { HOME_CURTAIN } from "./curtain";

/**
 * The two languages, and the URL shape of each.
 *
 * LOCALES lives here rather than in content.ts because content.ts needs
 * `zhPath` to build the Chinese nav, and paths.ts needing LOCALES back would
 * make that a cycle. content.ts re-exports it, so every existing import of
 * `LOCALES` from "@/lib/content" keeps working.
 */
export const LOCALES = ["EN", "BM", "ZH"] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * What `<html lang>` is for each locale.
 *
 * ZH is Simplified — the same subtag the product specs already carry in
 * ProductCatalog. BM is `ms`, which is Malay's own ISO code, and deliberately
 * not `bm`: `bm` is Bambara. The site calls the language BM because that is
 * what Malaysians call it — Bahasa Melayu — and that is the label on the
 * switch and the segment in the URL, but the tag a crawler reads has to be the
 * one the standard defines.
 */
export const HTML_LANG: Record<Locale, string> = {
  EN: "en",
  BM: "ms",
  ZH: "zh-Hans",
};

/**
 * The URL each language's pages hang under. English is the site root and has
 * no prefix, which is what makes it the default and the `x-default`.
 *
 * Every path helper below is derived from this table rather than written per
 * language, so a fourth locale is a line here and a route group, not a sweep
 * through the file.
 */
export const LOCALE_PREFIX: Record<Locale, string> = {
  EN: "",
  BM: "/bm",
  ZH: "/zh",
};

/**
 * The URL shape of the two languages, in a module with NO "use client".
 *
 * These are pure string functions and both sides need them: lib/seo.ts builds
 * hreflang on the server, the header toggle resolves its link on the client.
 * They lived in lib/locale.tsx until that file's "use client" made them
 * unreachable from `generateMetadata` — a client module's exports are not
 * ordinary functions to the server, they are references to code that ships to
 * the browser, and calling one during a build fails outright.
 *
 * lib/locale.tsx re-exports everything here, so client components can keep
 * importing from the one place.
 */

/**
 * The paths that exist in EVERY language, English on the left.
 *
 * /privacy is deliberately absent. It is a PDPA notice with no translation,
 * and giving it a /zh or /bm URL would publish a translated page of English
 * legal copy, which is worse than not offering one. It therefore gets no
 * hreflang either.
 *
 * This list is all-or-nothing by design: a path here is claimed to exist in
 * three languages, and the hreflang built from it says so. A page that exists
 * in two of the three would need its own shape here rather than a third
 * entry — better to build the missing one than to describe the gap.
 */
export const PAIRED_PATHS = [
  "/",
  "/contact",
  "/our-products",
  "/our-profile",
  "/directors-profile",
  "/services",
  "/our-projects",
] as const;

export function isPaired(enPathname: string) {
  return (PAIRED_PATHS as readonly string[]).includes(enPathname);
}

/**
 * An EN path in another language. `/` becomes the bare prefix, everything else
 * is prefixed; English is returned untouched, having no prefix to add.
 */
export function localePath(path: string, locale: Locale) {
  const prefix = LOCALE_PREFIX[locale];
  if (!prefix) return path;
  return path === "/" ? prefix : `${prefix}${path}`;
}

/** The ZH URL for an EN path. Kept as its own name because content.ts builds
    the Chinese nav with it and reads better for it. */
export function zhPath(path: string) {
  return localePath(path, "ZH");
}

/** The BM URL for an EN path. */
export function bmPath(path: string) {
  return localePath(path, "BM");
}

/**
 * Whether a pathname is the home page, in any language.
 *
 * `/` and `/zh` are one page rendered twice, and several things are true of it
 * and of nothing else on the site - it is the only page with scrubbed sections,
 * and so the only one the autoplay in components/ui/SmoothScroll.tsx has any
 * business running on. Comparing against `"/"` alone silently excludes every
 * translated half of the site, which is the kind of bug that only shows up for
 * readers nobody tests as.
 */
export function isHome(pathname: string) {
  return enPath(pathname) === "/";
}

/**
 * Whether a page closes with the enquiry band — and so with the curtain.
 *
 * One predicate for two things that must agree. The band takes itself off
 * /contact, where it would be a link to the page being read, sitting above the
 * footer under a form asking for the same thing. The curtain has to come off
 * with it: the sheet that rides up over the held page IS the band plus the
 * footer, and on /contact that is a footer on its own — half the height, unable
 * to cover the screen, drawing a curtain over a form for no reason.
 *
 * They were separate checks for one revision and that is exactly how these
 * drift: put the band back on /contact and the curtain returns with it, from
 * this line, rather than from someone remembering.
 *
 * `enPath` first, so /bm/contact and /zh/contact are covered by the one
 * comparison — matching the literal "/contact" would leave both translated
 * contact pages behaving differently from the English one.
 */
export function hasEnquiryBand(pathname: string) {
  return enPath(pathname) !== "/contact";
}

/**
 * Whether a page closes with the CURTAIN — the sheet drawn up over a held page.
 *
 * Two conditions, and both have to hold.
 *
 * The band, because the sheet that rides up IS the enquiry band plus the
 * footer. On /contact the band takes itself off, leaving a footer on its own -
 * half the height, unable to cover the screen, drawing a curtain over a form
 * for no reason. See `hasEnquiryBand`.
 *
 * And the home page, because the curtain is now the home page's alone. It is
 * one continuous chain there: the hero pins, every band rides over the one
 * above it, and the closing sheet is the last link in that chain rather than a
 * flourish bolted to the end. Everywhere else the page simply ends, and the
 * closing sheet was the only curtain left on those routes - a single overlap
 * with nothing before it to belong to, which reads as the footer coming loose
 * rather than as the page closing.
 *
 * ONE PREDICATE FOR BOTH HALVES OF THE EFFECT, which is the same rule
 * `hasEnquiryBand` was written for and for the same reason. A curtain needs a
 * pull-up AND something pinned underneath it; those live in two different
 * components (ClosingSheet and PageHold), and when they were separate checks
 * they drifted. Either both read this or the page gets half a curtain: a sheet
 * with nothing held under it, or a page pinned by its foot with nothing coming
 * up to cover it - a dead screen the reader scrolls against.
 */
export function hasClosingCurtain(pathname: string) {
  return HOME_CURTAIN && isHome(pathname) && hasEnquiryBand(pathname);
}

/**
 * Whether a nav link points at the page being read.
 *
 * A PREFIX match rather than an equality one, which is the whole point of it
 * having a name. There are twenty product pages under /our-products, and on
 * every one of them an exact match marks nothing at all — the reader is three
 * levels into the catalogue and the nav says they are nowhere.
 *
 * The boundary is a slash, so /our-products marks /our-products/dm106... and
 * not /our-products-archive.
 *
 * The home page is matched exactly, because every path begins with a slash and
 * a prefix match would mark it on every page of the site. Nothing in NAV points
 * at home today — the logo does that — but this is exactly the kind of rule
 * that is added later and quietly wrong.
 */
export function isCurrentPath(pathname: string, href: string) {
  if (enPath(href) === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Whether a nav ITEM — not just one href — points at the page being read.
 *
 * An item with a dropdown is current when the reader is on the item's own page
 * OR on any page its children lead to. Our Products has always marked itself on
 * /our-products because its children are only ever fragments of that same page,
 * so `isCurrentPath` on the parent href was enough. Our Profile breaks that
 * assumption: one of its children, Director's Profile, is a separate route, and
 * without this the parent would go unmarked while a reader sat on that page —
 * leaving it with no nav indication at all, which is exactly what it had as a
 * top-level item before it moved into the dropdown.
 *
 * Child hrefs are stripped of their fragment first: a fragment is a position on
 * a page, not a page, and `isCurrentPath` matches paths. Works in every locale
 * because the hrefs handed in are already localised — see NAV_ZH / NAV_BM.
 */
export function isNavItemCurrent(
  pathname: string,
  item: { href?: string; children?: { href?: string }[] },
) {
  const targets = [item.href, ...(item.children ?? []).map((c) => c.href)]
    .filter((href): href is string => Boolean(href))
    .map((href) => href.split("#")[0]);
  return targets.some((target) => isCurrentPath(pathname, target));
}

/** The EN path for any URL, whatever language it is in. Inverse of
    `localePath`, and the one function every other one here goes through. */
export function enPath(pathname: string) {
  for (const locale of LOCALES) {
    const prefix = LOCALE_PREFIX[locale];
    if (!prefix) continue;
    if (pathname === prefix) return "/";
    if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  }
  return pathname;
}

/**
 * Where the language toggle should point from wherever the reader is.
 *
 * Falls back to the other language's home page rather than 404ing when the
 * current page has no counterpart — which today means /privacy, and tomorrow
 * means any page added in one language before the other.
 */
export function counterpart(pathname: string, target: Locale) {
  const en = enPath(pathname);
  return localePath(isPaired(en) ? en : "/", target);
}
