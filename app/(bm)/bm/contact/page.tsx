import type { Metadata } from "next";

import { ContactBody } from "@/components/pages/ContactBody";
import { CONTACT, CONTACT_BM, SEO_BM } from "@/lib/content";
import { pageMetadataBm } from "@/lib/seo";

export const metadata: Metadata = pageMetadataBm(SEO_BM.contact);

/**
 * The same body as /contact, with the Malay copy merged over it here rather
 * than read from context: ContactBody is a server component, and context is a
 * client mechanism.
 *
 * The merge is one level deep, matching `useCopy`, and CONTACT_BM supplies
 * `banner`, `details` and `form` in full — a partial nested object would
 * replace its English counterpart and take the untranslated siblings with it.
 */
export default function ContactPageBm() {
  return <ContactBody copy={{ ...CONTACT, ...CONTACT_BM }} locale="BM" />;
}
