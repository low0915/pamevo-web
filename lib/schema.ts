import { ADDRESS, BACKGROUND, FOOTER, SEO, SITE } from "./content";
import { PRODUCTS } from "./products";

/**
 * schema.org graphs.
 *
 * One `@graph` per page, with `@id` anchors so nodes cross-reference each other
 * instead of restating themselves. Values are read from content.ts rather than
 * retyped, so the markup cannot drift from what the page prints — which is both
 * the point of structured data and the thing Google checks for.
 */

/** The stable identity every other node points back at. */
const ORG_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

/** The number as dialled internationally. FOOTER.phone is the reading form. */
const TELEPHONE = FOOTER.phoneHref.replace("tel:", "");

function postalAddress() {
  return {
    "@type": "PostalAddress",
    streetAddress: ADDRESS.streetAddress,
    postalCode: ADDRESS.postalCode,
    addressLocality: ADDRESS.addressLocality,
    addressRegion: ADDRESS.addressRegion,
    addressCountry: ADDRESS.addressCountry,
  };
}

/**
 * `sameAs` means "this same entity, elsewhere" — profile pages. FOOTER.socials
 * leads with a WhatsApp `send/?phone=` deep link, which is a click-to-chat
 * action rather than an identity, so it is filtered out rather than asserted as
 * a profile of the company.
 */
function profiles() {
  return FOOTER.socials
    .filter((social) => social.name !== "WhatsApp")
    .map((social) => social.url);
}

/**
 * Organization. Home page only — Google's guidance is that organisation markup
 * belongs on one page, not repeated sitewide.
 */
function organization() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    alternateName: ["PA Projects", "P.A. Projects Marketing"],
    url: SITE.url,
    description: SEO.home.description,
    logo: {
      "@type": "ImageObject",
      url: `${SITE.url}/logo.png`,
      width: 2220,
      height: 174,
    },
    email: FOOTER.email,
    telephone: TELEPHONE,
    address: postalAddress(),
    areaServed: { "@type": "Country", name: "Malaysia" },
    sameAs: profiles(),
    identifier: {
      "@type": "PropertyValue",
      propertyID: "MY-SSM",
      name: "Company registration number",
      value: SITE.regNo,
    },
    /*
     * `parentOrganization` is deliberately absent. The copy names P.A.
     * Resources Berhad as the listed parent, but its corporate URL is not
     * recorded anywhere in this repo, and a `sameAs`/`url` pointing at the
     * wrong company is worse than saying nothing. Add the node once the client
     * confirms the domain.
     */
  };
}

/**
 * WebSite. Not for the sitelinks searchbox — Google retired that, and there is
 * no site search here to describe. What this node is still live for is the site
 * NAME Google prints in a result, which is otherwise guessed from the title.
 */
function website() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE.url,
    name: SITE.name,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-MY",
  };
}

/**
 * The showroom, as a local business.
 *
 * `HomeAndConstructionBusiness` rather than the bare `LocalBusiness` parent:
 * it is a real subtype and it is what this is. Placed on /contact because
 * Google requires marked-up NAP data to be visible on the page carrying it, and
 * /contact is where the address and phone number are actually printed.
 *
 * Two fields are missing and both are worth more than the markup around them:
 * `openingHoursSpecification`, which is what drives inclusion in the local pack
 * for "aluminium windows Shah Alam", and `geo`. Neither is recorded anywhere in
 * this repo. They are omitted rather than invented — flagged for the client.
 */
function showroom() {
  return {
    "@type": "HomeAndConstructionBusiness",
    "@id": `${SITE.url}${SEO.contact.path}#showroom`,
    parentOrganization: { "@id": ORG_ID },
    name: `${SITE.name} Showroom`,
    url: `${SITE.url}${SEO.contact.path}`,
    telephone: TELEPHONE,
    email: FOOTER.email,
    address: postalAddress(),
    /* The showroom exterior at dusk — the same photograph the Background
       section opens on, rather than a second copy of the path. */
    image: `${SITE.url}${encodeURI(BACKGROUND.images[0].src)}`,
    currenciesAccepted: "MYR",
    sameAs: profiles(),
  };
}

/** The last crumb carries no `item`: it is the page you are already on. */
function breadcrumbs(trail: { name: string; url?: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      ...(crumb.url ? { item: crumb.url } : {}),
    })),
  };
}

const graph = (...nodes: object[]) => ({
  "@context": "https://schema.org",
  "@graph": nodes,
});

export function homeGraph() {
  return graph(organization(), website());
}

export function contactGraph() {
  return graph(
    showroom(),
    breadcrumbs([
      { name: "Home", url: SITE.url },
      { name: SEO.contact.title },
    ]),
  );
}

/**
 * The catalogue, as an ItemList.
 *
 * Every product points at the catalogue's own URL with a fragment, because that
 * is genuinely where each one lives — there are no per-product routes. An
 * `ItemList` of twenty entries all claiming the same bare URL would be noise;
 * the fragment at least addresses the row.
 *
 * No `Product` nodes. A Product without `offers` cannot earn a rich result, and
 * twenty of them hanging off one URL asserts twenty pages that do not exist.
 * When /our-products/[slug] routes are added, this becomes the place to attach
 * them.
 */
export function productsGraph() {
  return graph(
    {
      "@type": "ItemList",
      name: SEO.products.title,
      numberOfItems: PRODUCTS.length,
      itemListElement: PRODUCTS.map((product, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: product.title,
        url: `${SITE.url}${SEO.products.path}#${product.slug}`,
      })),
    },
    breadcrumbs([
      { name: "Home", url: SITE.url },
      { name: SEO.products.title },
    ]),
  );
}
