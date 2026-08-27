import { PRODUCTS } from "./products";

/**
 * The WordPress site this build replaces.
 *
 * `paprojects.com.my` ran on WordPress until this rebuild took the apex domain.
 * Every URL Google had indexed is given an explicit destination here rather
 * than being left to a wildcard, because a wildcard maps the unknown onto the
 * home page and Google reads that as a soft 404 — it consolidates nothing and
 * blurs what the home page is about.
 *
 * NONE OF THIS DOES ANYTHING until the Next app is what serves the apex. On a
 * subdomain or a staging host these rules are inert.
 *
 * `permanent: true` emits 308, not 301. That is Next's own choice and it is
 * the right one: 308 preserves the request method where 301 permits browsers
 * to rewrite POST to GET. Google treats the two identically for canonicalisation
 * and PageRank, so nothing is lost. Only legacy auditors that pattern-match on
 * the literal string "301" will complain.
 */

/**
 * Products lived at `/blog/<slug>/` — a WordPress post type, not an editorial
 * blog. The twenty slugs in products.ts were transcribed from those very pages
 * and are byte-identical to them, so this map is derived rather than retyped:
 * renaming a slug moves both sides at once and can never half-move.
 *
 * They all land on the catalogue rather than on a page of their own, because
 * the catalogue is currently one page. See the note in the plan: this is a
 * many-to-one redirect and it forfeits most of what those twenty-one URLs have
 * accumulated. Adding `/our-products/[slug]` later turns every line here into a
 * 1:1 map with no other change.
 */
const products = PRODUCTS.map((product) => ({
  source: `/blog/${product.slug}`,
  destination: "/our-products",
  permanent: true,
}));

/** The twenty-first indexed product URL: a WordPress duplicate-slug suffix. */
const aliases = [
  {
    source: "/blog/aluminium-clad-wood-doors-windows-2",
    destination: "/our-products",
    permanent: true,
  },
];

const pages = [
  // Pages whose content survives, folded into the home page's sections.
  { source: "/our-story", destination: "/", permanent: true },
  { source: "/about", destination: "/", permanent: true },
  { source: "/about/directors-profile", destination: "/", permanent: true },
  { source: "/about/vision-mision", destination: "/", permanent: true },
  { source: "/our-10-core-usp", destination: "/", permanent: true },
  { source: "/services", destination: "/", permanent: true },

  // The blog index was a product archive, and so was WooCommerce's shop
  // archive. Both were genuinely about products, so both consolidate onto the
  // catalogue rather than onto the home page.
  { source: "/blog", destination: "/our-products", permanent: true },
  { source: "/shop", destination: "/our-products", permanent: true },
  { source: "/shop/:path*", destination: "/our-products", permanent: true },

  // Anything else under /blog/ that is not one of the twenty-one above. Listed
  // last so the exact rules win. Without it a stale slug 404s; with it, it
  // lands on the catalogue, which is where its reader was going anyway.
  { source: "/blog/:slug*", destination: "/our-products", permanent: true },

  // Yoast's sitemap index, and WordPress core's. Both are very likely still
  // submitted in Search Console; pointing them at the new sitemap is what keeps
  // that submission alive across the cutover instead of silently 404ing.
  { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
  { source: "/wp-sitemap.xml", destination: "/sitemap.xml", permanent: true },
  { source: "/page-sitemap1.xml", destination: "/sitemap.xml", permanent: true },
  { source: "/post-sitemap1.xml", destination: "/sitemap.xml", permanent: true },
  { source: "/category-sitemap1.xml", destination: "/sitemap.xml", permanent: true },

  // The Chinese tree. The live site published /zh/<path> for every page; this
  // build has no /zh routes yet, and the copy to fill them does not exist (see
  // lib/locale.tsx). Consolidating onto the English equivalent is the honest
  // outcome: the reader lands on a real page carrying a working EN/ZH toggle,
  // rather than on a 404 or on a Chinese URL serving English text.
  //
  // When /zh routes do ship, this rule becomes the identity and should be
  // deleted rather than edited.
  { source: "/zh", destination: "/", permanent: true },
  { source: "/zh/:path*", destination: "/:path*", permanent: true },
];

/**
 * Deliberately absent: /cart, /checkout, /my-account and /sample-page.
 *
 * All four are indexed WooCommerce and WordPress leftovers, and all four are
 * left to 404. Redirecting them to the home page is the common instinct and it
 * is wrong twice over — Google treats a redirect onto a page that is not a
 * close equivalent as a soft 404, so nothing is consolidated and the home
 * page's relevance profile picks up noise; and it lies to whoever followed a
 * stale /my-account bookmark.
 *
 * They must also stay OUT of robots.ts. Blocking an already-indexed URL stops
 * the crawler ever seeing the 404, so the entry lingers in the index as
 * "indexed, though blocked" indefinitely — the exact opposite of the goal. Let
 * them be crawled once, found gone, and dropped.
 */
export const LEGACY_REDIRECTS = [...products, ...aliases, ...pages];
