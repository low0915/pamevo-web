import type { Metadata } from "next";

import { VisionBody } from "@/components/pages/VisionBody";
import { JsonLd } from "@/components/site/JsonLd";
import { SEO } from "@/lib/content";
import { pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(SEO.vision);

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
      <JsonLd data={pageGraph("vision")} />
      <VisionBody />
    </>
  );
}
