import type { Metadata } from "next";

import { HomeBody } from "@/components/pages/HomeBody";
import { SEO_BM } from "@/lib/content";
import { pageMetadataBm } from "@/lib/seo";

export const metadata: Metadata = pageMetadataBm(SEO_BM.home);

/**
 * The home page in Malay.
 *
 * Every section below reads the locale from context, so the body is shared with
 * `/` verbatim — the only difference between the two routes is the metadata
 * above and the `lang` the root layout renders.
 */
export default function HomeBm() {
  return <HomeBody locale="BM" />;
}
