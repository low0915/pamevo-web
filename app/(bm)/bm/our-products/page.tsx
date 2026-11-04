import type { Metadata } from "next";

import { ProductCatalog } from "@/components/sections/ProductCatalog";
import { Materials } from "@/components/sections/Materials";
import { ProductsIntro } from "@/components/sections/ProductsIntro";
import { JsonLd } from "@/components/site/JsonLd";
import { SEO_BM } from "@/lib/content";
import { productsGraph } from "@/lib/schema";
import { pageMetadataBm } from "@/lib/seo";

export const metadata: Metadata = pageMetadataBm(SEO_BM.products);

/**
 * The catalogue in Malay.
 *
 * Both sections are client components reading the locale from context, so they
 * need nothing passed to them — the BM root layout above has already provided
 * it.
 *
 * The specifications themselves are the seam in this page, and it is worth
 * naming: lib/products.ts carries English and Chinese on every bullet and
 * renders both in every locale, so a Malay reader gets Malay chrome around
 * bilingual EN/ZH specs. Translating 86 spec bullets is the client's call and
 * their data to supply; the page is built to take it the day it exists.
 */
export default function OurProductsPageBm() {
  return (
    <main className="flex-1">
      <JsonLd data={productsGraph("BM")} />

      <ProductsIntro locale="BM" />
      <ProductCatalog />
      {/* Glass, finishes and hardware: where a reader who has found a
          product goes next. See Materials. */}
      <Materials />
    </main>
  );
}
