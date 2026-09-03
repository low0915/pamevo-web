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
  //
  // /services and /our-projects ARE NOT HERE, and must not be. They were on
  // this list — folded onto the home page, because at the time this build had
  // nowhere else to put them — and they are now real routes built from the
  // sections that had absorbed them. A redirect takes precedence over a page,
  // so leaving them here did not merely waste the new pages: it made them
  // unreachable, and the nav linked to URLs that bounced straight back to the
  // home page. Same trap the /zh block below warns about, walked into from the
  // other direction.
  //
  // Reclaiming the old URLs rather than inventing new ones is the better
  // outcome: /services is what the WordPress site published, so whatever equity
  // that URL carries now lands on a page about the same subject instead of on a
  // redirect to the home page.
  //
  // /our-story USED TO BE ON THAT SAME FOOTING and is now a source below
  // instead, which is the one case this rule bends for. It is no longer a route
  // — the page is /our-profile — so there is nothing for a redirect to shadow,
  // and the equity it carries is passed forward one hop rather than dropped.
  // The test is not "was this a WordPress URL", it is "is there a page at this
  // path today"; when the answer changes, the rule changes with it.
  { source: "/about", destination: "/", permanent: true },
  // The page exists now. The source keeps the WordPress spelling because that
  // is the URL that was published; the destination is the new route.
  {
    source: "/about/directors-profile",
    destination: "/directors-profile",
    permanent: true,
  },
  // The page exists now, so this points at it rather than at the home page.
  // Note the source spelling: the WordPress slug had "mision" with one S, and
  // it stays misspelt here because that is the URL that was published and the
  // one that has links pointing at it. The destination is spelt correctly.
  //
  // The destination is /our-profile, not /vision-mission. That page was folded
  // into the profile page, and pointing this at it would have made a two-hop
  // chain out of a one-hop redirect — /about/vision-mision to /vision-mission
  // to /our-profile. Chains are followed but they leak, and the fix is to
  // repoint the source rather than to rely on the second hop.
  { source: "/about/vision-mision", destination: "/our-profile", permanent: true },
  { source: "/our-10-core-usp", destination: "/", permanent: true },

  // THE PROFILE RENAME. /our-story became /our-profile and /vision-mission was
  // folded into it, in all three languages. Six sources, all 308, all landing
  // on the page that now holds what they held.
  //
  // /our-story is the one that carries real weight: it is a URL the WordPress
  // site published, so it has whatever the old site accumulated plus whatever
  // this build has since earned. /vision-mission and the two /bm paths were
  // only ever published by this build; they are here because a live URL that
  // starts 404ing is a live URL that starts 404ing, however young it is.
  { source: "/our-story", destination: "/our-profile", permanent: true },
  { source: "/zh/our-story", destination: "/zh/our-profile", permanent: true },
  { source: "/bm/our-story", destination: "/bm/our-profile", permanent: true },
  { source: "/vision-mission", destination: "/our-profile", permanent: true },
  { source: "/zh/vision-mission", destination: "/zh/our-profile", permanent: true },
  { source: "/bm/vision-mission", destination: "/bm/our-profile", permanent: true },

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

  // The Chinese tree.
  //
  // /zh, /zh/contact, /zh/our-products, /zh/our-profile, /zh/services and
  // /zh/our-projects are REAL ROUTES in this build and are deliberately absent
  // from this list — a redirect here would take precedence over the page and
  // that page would never render. /zh/our-story is NOT on that list any more:
  // it is a source above, pointing at /zh/our-profile. The live WordPress site published several of
  // those same paths, so they need no redirect at all: they carry straight
  // over onto a page about the same subject.
  //
  // What does need handling is everything else the old /zh tree published —
  // /zh/blog/<product>, /zh/about and the rest — which has no Chinese page
  // here. Those go to the Chinese home page rather than to their
  // English equivalent: a reader who asked for Chinese should land somewhere
  // Chinese, and /zh is the page most likely to answer them.
  //
  // The product posts are the one exception worth routing properly: the
  // catalogue is bilingual, so /zh/blog/<slug> has a genuine destination.
  { source: "/zh/blog", destination: "/zh/our-products", permanent: true },
  { source: "/zh/blog/:slug*", destination: "/zh/our-products", permanent: true },
  { source: "/zh/shop", destination: "/zh/our-products", permanent: true },
  { source: "/zh/about", destination: "/zh", permanent: true },
  { source: "/zh/about/:path*", destination: "/zh", permanent: true },
  { source: "/zh/our-10-core-usp", destination: "/zh", permanent: true },
  // /zh/privacy has no Chinese page and never will while the notice is
  // English-only, so it goes to the English one rather than to /zh.
  { source: "/zh/privacy", destination: "/privacy", permanent: true },
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
