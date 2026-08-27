import type { Metadata } from "next";

import { ContactBody } from "@/components/pages/ContactBody";
import { CONTACT, SEO } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

/** Title, description, canonical, hreflang and the social cards, from one
    entry. See lib/seo.ts for why the nested keys cannot be defaulted in the
    layout. */
export const metadata: Metadata = pageMetadata(SEO.contact);

export default function ContactPage() {
  return <ContactBody copy={CONTACT} />;
}
