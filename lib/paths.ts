/**
 * The two languages, and the URL shape of each.
 *
 * LOCALES lives here rather than in content.ts because content.ts needs
 * `zhPath` to build the Chinese nav, and paths.ts needing LOCALES back would
 * make that a cycle. content.ts re-exports it, so every existing import of
 * `LOCALES` from "@/lib/content" keeps working.
 */
export const LOCALES = ["EN", "ZH"] as const;

export type Locale = (typeof LOCALES)[number];

/** What `<html lang>` is for each locale. ZH is Simplified — the same subtag
    the product specs already carry in ProductCatalog. */
export const HTML_LANG: Record<Locale, string> = { EN: "en", ZH: "zh-Hans" };

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
 * The paths that exist in both languages, English on the left.
 *
 * /privacy is deliberately absent. It is a PDPA notice with no Chinese text,
 * and giving it a /zh URL would publish a Chinese page of English legal copy,
 * which is worse than not offering one. It therefore gets no hreflang either.
 */
export const PAIRED_PATHS = ["/", "/contact", "/our-products"] as const;

export function isPaired(enPathname: string) {
  return (PAIRED_PATHS as readonly string[]).includes(enPathname);
}

/** The ZH URL for an EN path. `/` is `/zh`, everything else is prefixed. */
export function zhPath(path: string) {
  return path === "/" ? "/zh" : `/zh${path}`;
}

/**
 * Whether a pathname is the home page, in either language.
 *
 * `/` and `/zh` are one page rendered twice, and several things are true of it
 * and of nothing else on the site - it is the only page with scrubbed sections,
 * and so the only one the autoplay in components/ui/SmoothScroll.tsx has any
 * business running on. Comparing against `"/"` alone silently excludes the
 * Chinese half of the site, which is the kind of bug that only shows up for
 * readers nobody tests as.
 */
export function isHome(pathname: string) {
  return enPath(pathname) === "/";
}

/** The EN path for any URL, ZH or not. Inverse of `zhPath`. */
export function enPath(pathname: string) {
  if (pathname === "/zh") return "/";
  return pathname.startsWith("/zh/") ? pathname.slice(3) : pathname;
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
  if (target === "EN") return isPaired(en) ? en : "/";
  return isPaired(en) ? zhPath(en) : "/zh";
}
