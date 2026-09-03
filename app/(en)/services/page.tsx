import type { Metadata } from "next";

import { ServicesBody } from "@/components/pages/ServicesBody";
import { JsonLd } from "@/components/site/JsonLd";
import { SEO } from "@/lib/content";
import { pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(SEO.services);

/**
 * The route differs from its two counterparts only in the metadata above, the
 * locale handed to the body, and the `lang` its root layout renders — the
 * composition and the copy live in ServicesBody and lib/content.ts.
 */
export default function ServicesPage() {
  return (
    <>
      <JsonLd data={pageGraph("services")} />
      <ServicesBody />
    </>
  );
}
