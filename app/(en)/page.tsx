import type { Metadata } from "next";

import { HomeBody } from "@/components/pages/HomeBody";
import { SEO } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

/** The home page carried no metadata at all before: no canonical, no social
    card, just the layout's defaults. */
export const metadata: Metadata = pageMetadata(SEO.home);

export default function Home() {
  return <HomeBody />;
}
