import type { Metadata } from "next";

import { ProjectsBody } from "@/components/pages/ProjectsBody";
import { JsonLd } from "@/components/site/JsonLd";
import { SEO } from "@/lib/content";
import { pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(SEO.projects);

/**
 * Our Projects: the shared banner, then every photograph in the catalogue as a
 * masonry wall.
 *
 * The page used to render the home page's dragged strip with `standalone`. It
 * now has a body of its own — see ProjectsBody for why the band replaced that
 * heading rather than sitting above it, and ProjectGallery for why a page
 * someone navigated to shows all 23 photographs rather than six behind a
 * gesture.
 *
 * The copy is chosen by the body from the `locale` prop, so this route differs
 * from its two counterparts only in the metadata above, that prop, and the
 * `lang` its root layout renders.
 */
export default function OurProjectsPage() {
  return (
    <main className="flex-1">
      <JsonLd data={pageGraph("projects")} />
      <ProjectsBody />
    </main>
  );
}
