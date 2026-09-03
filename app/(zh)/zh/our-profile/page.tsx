import type { Metadata } from "next";

import { Background } from "@/components/sections/Background";
import { VisionMission } from "@/components/sections/VisionMission";
import { JsonLd } from "@/components/site/JsonLd";
import { SEO_ZH } from "@/lib/content";
import { pageGraph } from "@/lib/schema";
import { pageMetadataZh } from "@/lib/seo";

export const metadata: Metadata = pageMetadataZh(SEO_ZH.story);

/**
 * Our Profile: the company's own story, and what it says it is for.
 *
 * TWO CHAPTERS, ONE PAGE. Background carries the first — the group, the years
 * and the partnership — and it is the same component the home page used to
 * build that section from, not a copy of it. `standalone` is what tells it
 * which of those it is: it drops the curtain margin that pulled it over the
 * band above it and promotes its heading to the page's `h1`.
 *
 * VisionMission carries the second, and it used to be a page of its own at
 * /vision-mission. It is here because that is where a reader looking for it
 * would already be: a company profile that stops before saying what the company
 * is FOR is half a page, and the two were one click apart for no reason a
 * reader would recognise. The old URL redirects here rather than 404ing, in
 * every language — see lib/legacy-urls.ts.
 *
 * The copy for the first chapter is read from context by the section itself;
 * the second takes a locale, being a server component. So this route differs
 * from its two counterparts only in the metadata above, that locale, and the
 * `lang` its root layout renders.
 */
export default function OurProfilePageZh() {
  return (
    <main className="flex-1">
      <JsonLd data={pageGraph("story", "ZH")} />
      <Background standalone />
      <VisionMission locale="ZH" />
    </main>
  );
}
