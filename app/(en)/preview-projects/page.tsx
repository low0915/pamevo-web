import type { Metadata } from "next";

import { Projects } from "@/components/sections/Projects";
import { NOINDEX } from "@/lib/seo";

/**
 * A screenshot harness, not a page — but it exported no metadata, so it was
 * fully crawlable, had no <h1>, and inherited the home page's exact <title>
 * and description. That is a duplicate of the site's most important result,
 * competing with it. It is also disallowed in app/robots.ts and left out of
 * app/sitemap.ts; the three together are belt and braces, and the meta robots
 * tag is the one that actually removes it from the index.
 */
export const metadata: Metadata = { title: "Preview", ...NOINDEX };

/** Preview only: the reveal is forced on, since a headless capture never
 *  triggers whileInView reliably. */
export default function Preview() {
  return (
    <main className="flex-1 bg-bg [&_*]:opacity-100!">
      <div className="md:mt-[calc(110dvh+4em)]">
        <Projects />
      </div>
    </main>
  );
}
