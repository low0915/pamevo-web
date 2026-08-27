import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/pages/ProductDetail";
import { JsonLd } from "@/components/site/JsonLd";
import { SEO } from "@/lib/content";
import { describe, PRODUCTS } from "@/lib/products";
import { productGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

/**
 * A page per product.
 *
 * The catalogue at /our-products is untouched and stays the hub; these are
 * additive. They exist for three reasons, in descending order of how hard they
 * are to get back later:
 *
 *  1. The WordPress site this replaces has twenty-one indexed product URLs at
 *     /blog/<slug>/. Without a page each, all twenty-one collapse onto the
 *     catalogue — a many-to-one redirect onto a page that is not a close
 *     equivalent, which Google reads as a soft 404: the URLs are dropped and no
 *     equity transfers. Cutover happens once. Everything else here is
 *     reversible; that is not.
 *  2. Model-number queries — "MEVO DM1288", "DM106 casement window" — are the
 *     low-competition long tail a site this size can actually win, and they
 *     cannot be won without a URL to win them with.
 *  3. Product and BreadcrumbList markup need a URL to attach to.
 *
 * The slugs are byte-identical to the WordPress ones (they were transcribed
 * from those pages), so the redirect map is derived rather than retyped.
 */
export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

/** Twenty products, all known at build time. A stray slug is a 404, not a
    rendered shell waiting for data that will never arrive. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/our-products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) return {};

  return pageMetadata({
    path: `${SEO.products.path}/${product.slug}`,
    /* The category earns its place in the title: "DM106 Casement Window" alone
       repeats the h1, and the category is the word someone searching without a
       model number would use. */
    title: `${product.title} — ${product.category}`,
    description: describe(product),
    image: { url: product.images[0].src, alt: product.images[0].alt },
  });
}

export default async function ProductPage({
  params,
}: PageProps<"/our-products/[slug]">) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();

  return (
    <>
      <JsonLd data={productGraph(product)} />
      <ProductDetail product={product} />
    </>
  );
}
