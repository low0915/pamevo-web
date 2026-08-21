import type { Metadata } from "next";

import { ProductCatalog } from "@/components/sections/ProductCatalog";
import { ProductsIntro } from "@/components/sections/ProductsIntro";
import { SEO } from "@/lib/content";

export const metadata: Metadata = {
  /** The layout template appends " | MEVO Malaysia". */
  title: SEO.products.title,
  description: SEO.products.description,
};

/** The root layout renders children bare, so each page owns its own <main>. */
export default function OurProductsPage() {
  return (
    <main className="flex-1">
      <ProductsIntro />
      <ProductCatalog />
    </main>
  );
}
