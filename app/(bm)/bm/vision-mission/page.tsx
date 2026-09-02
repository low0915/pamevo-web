import type { Metadata } from "next";

import { VisionBody } from "@/components/pages/VisionBody";
import { JsonLd } from "@/components/site/JsonLd";
import { SEO_BM } from "@/lib/content";
import { pageGraph } from "@/lib/schema";
import { pageMetadataBm } from "@/lib/seo";

export const metadata: Metadata = pageMetadataBm(SEO_BM.vision);

/**
 * Vision & Mission.
 *
 * The route differs from its two counterparts only in the metadata above, the
 * locale handed to the body, and the `lang` its root layout renders — the
 * composition and the copy live in VisionBody and lib/content.ts.
 */
export default function VisionMissionPage() {
  return (
    <>
      <JsonLd data={pageGraph("vision", "BM")} />
      <VisionBody locale="BM" />
    </>
  );
}
