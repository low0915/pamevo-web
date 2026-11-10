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
 * The specifications render in Malay here, from the `ms` lines in
 * lib/products.ts, transcribed from the client's e-catalogue.
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
