import type { Metadata } from "next";

import { ProductCatalog } from "@/components/sections/ProductCatalog";
import { ProductsIntro } from "@/components/sections/ProductsIntro";
import { JsonLd } from "@/components/site/JsonLd";
import { SEO } from "@/lib/content";
import { productsGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

/** Title, description, canonical and the social cards, from one entry. See
    lib/seo.ts for why the nested keys cannot be defaulted in the layout. */
export const metadata: Metadata = pageMetadata(SEO.products);

/** The root layout renders children bare, so each page owns its own <main>. */
export default function OurProductsPage() {
  return (
    <main className="flex-1">
      {/* ItemList + BreadcrumbList. See lib/schema.ts for why there are no
          Product nodes while the catalogue is a single page. */}
      <JsonLd data={productsGraph()} />

      <ProductsIntro />
      <ProductCatalog />
    </main>
  );
}
