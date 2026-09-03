import type { Metadata } from "next";

import { ServicesBody } from "@/components/pages/ServicesBody";
import { JsonLd } from "@/components/site/JsonLd";
import { SEO_BM } from "@/lib/content";
import { pageGraph } from "@/lib/schema";
import { pageMetadataBm } from "@/lib/seo";

export const metadata: Metadata = pageMetadataBm(SEO_BM.services);

/**
 * The route differs from its two counterparts only in the metadata above, the
 * locale handed to the body, and the `lang` its root layout renders — the
 * composition and the copy live in ServicesBody and lib/content.ts.
 */
export default function ServicesPage() {
  return (
    <>
      <JsonLd data={pageGraph("services", "BM")} />
      <ServicesBody locale="BM" />
    </>
  );
}
