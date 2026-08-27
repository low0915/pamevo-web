import type { Metadata } from "next";

import { ProductCatalog } from "@/components/sections/ProductCatalog";
import { ProductsIntro } from "@/components/sections/ProductsIntro";
import { JsonLd } from "@/components/site/JsonLd";
import { SEO_ZH } from "@/lib/content";
import { productsGraph } from "@/lib/schema";
import { pageMetadataZh } from "@/lib/seo";

export const metadata: Metadata = pageMetadataZh(SEO_ZH.products);

/**
 * The catalogue in Chinese.
 *
 * Both sections are client components reading the locale from context, so they
 * need nothing passed to them — the ZH root layout above has already provided
 * it. The product specs themselves were bilingual before any of this: they
 * render English and Chinese together in either locale.
 */
export default function OurProductsPageZh() {
  return (
    <main className="flex-1">
      <JsonLd data={productsGraph("ZH")} />

      <ProductsIntro locale="ZH" />
      <ProductCatalog />
    </main>
  );
}
