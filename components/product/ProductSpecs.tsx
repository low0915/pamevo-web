import type { ProductSpecGroup } from "@/lib/products";

/**
 * A product's specification groups.
 *
 * Extracted from ProductCatalog so the catalogue row and the detail page render
 * specs from ONE piece of markup. Two copies of this would drift the first time
 * anyone restyled a heading, and the two places are supposed to be recognisably
 * the same object seen at two sizes.
 *
 * Both languages are always printed, in either locale. That is the source
 * data's own shape — the live product pages publish every line three times —
 * and it is the one part of the site that was bilingual before /zh existed. On
 * an English page the Chinese line is still correct content for a Chinese
 * reader who found it, and `lang` marks it so a screen reader switches voice
 * rather than reading Han characters as English.
 *
 * `gutter` is the catalogue's own quirk: the row's CTA floats in the panel's
 * bottom-right corner, so the last line of the last group has to reserve width
 * for it. The detail page passes nothing and the reservation disappears.
 */
export function ProductSpecs({
  groups,
  gutter = "",
  reserveOnLastLine = false,
}: {
  groups: ProductSpecGroup[];
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
            {group.title}
            {group.titleZh ? (
              <span lang="zh-Hans" className="ml-2 font-sans normal-case">
                {group.titleZh}
              </span>
            ) : null}
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
                {item.en}
                {item.zh ? (
                  <span
                    lang="zh-Hans"
                    className="mt-1 block text-base text-ink-2"
                  >
                    {item.zh}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
