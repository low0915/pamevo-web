import type { Metadata } from "next";

import { ProjectsBody } from "@/components/pages/ProjectsBody";
import { JsonLd } from "@/components/site/JsonLd";
import { SEO_ZH } from "@/lib/content";
import { pageGraph } from "@/lib/schema";
import { pageMetadataZh } from "@/lib/seo";

export const metadata: Metadata = pageMetadataZh(SEO_ZH.projects);

/**
 * Our Projects in Chinese. See the English route for what the page is; this one
 * differs only in the metadata above, the `locale` it passes, and the `lang`
 * its root layout renders.
 */
export default function OurProjectsPageZh() {
  return (
    <main className="flex-1">
      <JsonLd data={pageGraph("projects", "ZH")} />
      <ProjectsBody locale="ZH" />
    </main>
  );
}
