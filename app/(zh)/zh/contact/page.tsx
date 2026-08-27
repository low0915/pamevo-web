import type { Metadata } from "next";

import { ContactBody } from "@/components/pages/ContactBody";
import { CONTACT, CONTACT_ZH, SEO_ZH } from "@/lib/content";
import { pageMetadataZh } from "@/lib/seo";

export const metadata: Metadata = pageMetadataZh(SEO_ZH.contact);

/**
 * The same body as /contact, with the Chinese copy merged over it here rather
 * than read from context: ContactBody is a server component, and context is a
 * client mechanism.
 *
 * The merge is one level deep, matching `useCopy`, and CONTACT_ZH supplies
 * `banner`, `details` and `form` in full — a partial nested object would
 * replace its English counterpart and take the untranslated siblings with it.
 */
export default function ContactPageZh() {
  return <ContactBody copy={{ ...CONTACT, ...CONTACT_ZH }} locale="ZH" />;
}
