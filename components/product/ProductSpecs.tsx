import type { Locale } from "@/lib/paths";
import { groupTitle, inLocale, type ProductSpecGroup } from "@/lib/products";

/**
 * A product's specification groups.
 *
 * Extracted from ProductCatalog so the catalogue row and the detail page render
 * specs from ONE piece of markup. Two copies of this would drift the first time
 * anyone restyled a heading, and the two places are supposed to be recognisably
 * the same object seen at two sizes.
 *
 * Each locale prints only its own language: English on /our-products, Malay on
 * /bm, Chinese on /zh. A line with no translation falls back to English.
 *
 * `gutter` is the catalogue's own quirk: the row's CTA floats in the panel's
 * bottom-right corner, so the last line of the last group has to reserve width
 * for it. The detail page passes nothing and the reservation disappears.
 */
export function ProductSpecs({
  groups,
  locale = "EN",
  gutter = "",
  reserveOnLastLine = false,
}: {
  groups: ProductSpecGroup[];
  locale?: Locale;
  /** Tailwind padding class for the last line, to clear a floating CTA. */
  gutter?: string;
  reserveOnLastLine?: boolean;
}) {
  const lastGroup = groups.length - 1;

  return (
    <>
      {groups.map((group, gi) => (
        <div key={group.title} className="mt-4 first:mt-0">
          <p className="font-mono text-xs tracking-tight text-ink-2 uppercase underline decoration-[rgb(126_133_140/0.5)] decoration-1 underline-offset-[6px]">
            {groupTitle(group, locale)}
          </p>
          <ul className="mt-2 space-y-2.5">
            {group.items.map((item, ii) => (
              <li
                key={item.en}
                className={`text-base leading-relaxed text-ink ${
                  reserveOnLastLine &&
                  gi === lastGroup &&
                  ii === group.items.length - 1
                    ? gutter
                    : ""
                }`}
              >
                {inLocale(item, locale)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
