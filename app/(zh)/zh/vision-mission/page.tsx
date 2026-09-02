import type { Metadata } from "next";

import { VisionBody } from "@/components/pages/VisionBody";
import { JsonLd } from "@/components/site/JsonLd";
import { SEO_ZH } from "@/lib/content";
import { pageGraph } from "@/lib/schema";
import { pageMetadataZh } from "@/lib/seo";

export const metadata: Metadata = pageMetadataZh(SEO_ZH.vision);

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
      <JsonLd data={pageGraph("vision", "ZH")} />
      <VisionBody locale="ZH" />
    </>
  );
}
