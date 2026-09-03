import {
  ADDRESS,
  BACKGROUND,
  FOOTER,
  SEO,
  SEO_ZH,
  SEO_BM,
  SITE,
} from "./content";
import { LOCALE_PREFIX, type Locale } from "./paths";
import { describe, PRODUCTS, type Product } from "./products";

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
const IN_LANGUAGE: Record<Locale, string> = {
  EN: "en-MY",
  BM: "ms-MY",
  ZH: "zh-Hans-MY",
};

function website(locale: Locale) {
  const home = `${SITE.url}${LOCALE_PREFIX[locale]}`;
  return {
    "@type": "WebSite",
    /* One @id per language: these are three documents, not one described three
       times, and collapsing them would have a translated page assert it is the
       English one. */
    "@id": locale === "EN" ? WEBSITE_ID : `${home}#website`,
    url: home,
    name: SITE.name,
    publisher: { "@id": ORG_ID },
    inLanguage: IN_LANGUAGE[locale],
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

/** The SEO entry set for a locale, so a graph names the page it is actually
    on. The translated sets carry no `privacy` entry; nothing below reads one. */
const seo = (locale: Locale) =>
  locale === "ZH" ? SEO_ZH : locale === "BM" ? SEO_BM : SEO;

const graph = (...nodes: object[]) => ({
  "@context": "https://schema.org",
  "@graph": nodes,
});

export function homeGraph(locale: Locale = "EN") {
  return graph(organization(), website(locale));
}

/**
 * The three sections that are also pages — /our-profile, /services and
 * /our-projects — carry a breadcrumb and nothing else.
 *
 * Nothing else is honest. There is no `AboutPage` or `Service` node here
 * because neither would say anything the page does not already say in prose,
 * and a `Service` without an `offers` or an `areaServed` earns no rich result
 * while asserting a structure nobody maintains. The breadcrumb is real: these
 * pages genuinely sit one level under the home page of their language.
 */
export function pageGraph(
  key: "story" | "directors" | "services" | "projects",
  locale: Locale = "EN",
) {
  const copy = seo(locale);
  return graph(breadcrumbs([home(locale), { name: copy[key].title }]));
}

export function contactGraph(locale: Locale = "EN") {
  const copy = seo(locale);
  return graph(
    showroom(),
    breadcrumbs([
      home(locale),
      { name: copy.contact.title },
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
export function productsGraph(locale: Locale = "EN") {
  const copy = seo(locale);
  const base = `${SITE.url}${copy.products.path}`;
  return graph(
    {
      "@type": "ItemList",
      name: copy.products.title,
      numberOfItems: PRODUCTS.length,
      itemListElement: PRODUCTS.map((product, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: product.title,
        url: `${base}#${product.slug}`,
      })),
    },
    breadcrumbs([
      home(locale),
      { name: copy.products.title },
    ]),
  );
}

/** The word "Home" in each language, so no breadcrumb trail reads half in one
    language and half in another. */
const HOME_LABEL: Record<Locale, string> = {
  EN: "Home",
  BM: "Laman Utama",
  ZH: "首页",
};

/** The first crumb: the home page of whichever language this graph is for. */
const home = (locale: Locale) => ({
  name: HOME_LABEL[locale],
  url: `${SITE.url}${LOCALE_PREFIX[locale]}`,
});

/**
 * One product, for its own page.
 *
 * NOTE, so nobody is surprised six weeks from now: there is no `offers` node,
 * because this is a quotation-based catalogue with no published prices. Google
 * will therefore NOT render a product rich result, and Search Console WILL
 * report "Missing field 'offers'" as a non-critical warning on all twenty
 * pages. That is expected and correct.
 *
 * Do not invent an offer, a price or an aggregateRating to silence it — marking
 * up data the page does not show is a structured-data policy violation, and it
 * risks a manual action against the whole domain to quiet a warning that costs
 * nothing.
 *
 * What the markup does earn without offers: the model number, brand, category
 * and profile figures become machine-readable, and the product is tied to the
 * Organization node rather than floating free.
 */
export function productGraph(product: Product, locale: Locale = "EN") {
  const copy = seo(locale);
  const url = `${SITE.url}${copy.products.path}/${product.slug}`;

  return graph(
    {
      "@type": "Product",
      "@id": `${url}#product`,
      name: product.title,
      sku: `MEVO-${product.no}`,
      mpn: product.title.split(" ")[0],
      category: product.category,
      url,
      description: describe(product, 300),
      image: product.images.map((image) => `${SITE.url}${encodeURI(image.src)}`),
      brand: { "@type": "Brand", name: "MEVO" },
      manufacturer: { "@id": ORG_ID },
      /* The "Product Parameters" bullets are already "Label: value" strings,
         which is the shape a PropertyValue wants. Anything without a colon is
         skipped rather than emitted as a nameless property. */
      additionalProperty: product.groups
        .flatMap((group) => group.items)
        .filter((item) => item.en.includes(":"))
        .map((item) => {
          const [name, ...rest] = item.en.split(":");
          return {
            "@type": "PropertyValue",
            name: name.trim(),
            value: rest.join(":").trim(),
          };
        }),
    },
    breadcrumbs([
      home(locale),
      { name: copy.products.title, url: `${SITE.url}${copy.products.path}` },
      { name: product.title },
    ]),
  );
}
