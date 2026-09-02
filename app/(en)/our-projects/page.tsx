import type { Metadata } from "next";

import { Projects } from "@/components/sections/Projects";
import { JsonLd } from "@/components/site/JsonLd";
import { SEO } from "@/lib/content";
import { pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(SEO.projects);

/**
 * The Our Projects strip, as a page of its own.
 *
 * The same component the home page uses, not a copy of it — one section, two
 * places it appears, and no second version to keep in step. `standalone` is
 * what tells it which of those it is: it drops the curtain margin that pulls it
 * over the band above it on the home page, where here there is nothing above
 * it, and promotes its heading to the page's `h1`.
 *
 * The copy is read from context by the section itself, so this route differs
 * from its two counterparts only in the metadata above and the `lang` its root
 * layout renders.
 */
export default function OurProjectsPage() {
  return (
    <main className="flex-1">
      <JsonLd data={pageGraph("projects")} />
      <Projects standalone />
    </main>
  );
}
