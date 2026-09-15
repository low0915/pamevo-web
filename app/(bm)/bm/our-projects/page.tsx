import type { Metadata } from "next";

import { ProjectsBody } from "@/components/pages/ProjectsBody";
import { JsonLd } from "@/components/site/JsonLd";
import { SEO_BM } from "@/lib/content";
import { pageGraph } from "@/lib/schema";
import { pageMetadataBm } from "@/lib/seo";

export const metadata: Metadata = pageMetadataBm(SEO_BM.projects);

/**
 * Our Projects in Malay. See the English route for what the page is; this one
 * differs only in the metadata above, the `locale` it passes, and the `lang`
 * its root layout renders.
 */
export default function OurProjectsPageBm() {
  return (
    <main className="flex-1">
      <JsonLd data={pageGraph("projects", "BM")} />
      <ProjectsBody locale="BM" />
    </main>
  );
}
