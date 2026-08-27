import type { Metadata } from "next";

import { HomeBody } from "@/components/pages/HomeBody";
import { SEO_ZH } from "@/lib/content";
import { pageMetadataZh } from "@/lib/seo";

export const metadata: Metadata = pageMetadataZh(SEO_ZH.home);

/**
 * The home page in Chinese.
 *
 * Every section below reads the locale from context, so the body is shared with
 * `/` verbatim — the only difference between the two routes is the metadata
 * above and the `lang` the root layout renders.
 */
export default function HomeZh() {
  return <HomeBody locale="ZH" />;
}
