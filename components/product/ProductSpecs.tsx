import type { Locale } from "@/lib/paths";
import { groupTitle, inLocale, type ProductSpecGroup } from "@/lib/products";

const ORDER: Locale[] = ["EN", "BM", "ZH"];
const LANG: Record<Locale, string> = { EN: "en", BM: "ms", ZH: "zh-Hans" };

/**
 * A product's specification groups.
 *
 * Extracted from ProductCatalog so the catalogue row and the detail page render
 * specs from ONE piece of markup. Two copies of this would drift the first time
 * anyone restyled a heading, and the two places are supposed to be recognisably
 * the same object seen at two sizes.
 *
 * EVERY LINE IN ALL THREE LANGUAGES, as the client's catalogue and the old
 * site print them. The page's own language leads at full size; the other two
 * follow under it, smaller and quieter, in a fixed EN / BM / ZH order. A
 * translation is skipped when it is missing or identical to the lead line, so
 * brand names and figures ("ROTO, HOPPE", "1.8mm") are printed once rather
 * than three times. Each secondary line carries its own `lang`, so a screen
 * reader switches voice and the CJK font fallback applies per line.
 *
 * Group headings stay in the page's language only: they are labels, and three
 * of them stacked over every group would outweigh the lines they label.
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
                {ORDER.filter((l) => l !== locale).map((l) => {
                  const lead = inLocale(item, locale);
                  const line = l === "EN" ? item.en : l === "BM" ? item.ms : item.zh;
                  if (!line || line === lead) return null;
                  return (
                    <span
                      key={l}
                      lang={LANG[l]}
                      className="block text-sm leading-snug text-ink-2"
                    >
                      {line}
                    </span>
                  );
                })}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
