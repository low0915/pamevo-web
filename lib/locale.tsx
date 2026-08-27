"use client";

import { createContext, useContext, useMemo } from "react";

/* The URL helpers live in lib/paths.ts, which carries no "use client": the
   server builds hreflang from them during `generateMetadata`, and a client
   module's exports cannot be called from the server. Re-exported here so client
   components still import the locale and its paths from one place. */
export {
  counterpart,
  enPath,
  zhPath,
  isPaired,
  HTML_LANG,
  PAIRED_PATHS,
  type Locale,
} from "./paths";

import type { Locale } from "./paths";

/**
 * The locale, read from the ROUTE rather than from a client store.
 *
 * This used to be a module-level store backed by localStorage, because one URL
 * served both languages and the copy swapped in place. That had one fatal
 * property for search: the server could only ever render English. `<html lang>`
 * was corrected by an effect after hydration, and the Chinese copy existed only
 * inside the JS bundle, so no crawler ever saw a word of it.
 *
 * Now English lives at `/` and Chinese at `/zh`, each with its own root layout,
 * and the locale is a constant for the whole tree beneath. A constant handed
 * down from a server component is a context, not a store — which is also what
 * lets the server render Chinese HTML with `lang="zh-Hans"` already on it.
 *
 * There is no setter any more. Switching language is a navigation, and the
 * toggle in the header is a link — see `counterpart` below.
 */
const LocaleContext = createContext<Locale>("EN");

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  return { locale: useContext(LocaleContext) };
}

/**
 * Picks the copy for the current locale.
 *
 * The ZH object is a partial overlay, not a parallel translation: only the
 * strings that have actually been supplied are in it, and everything else falls
 * through to the English original. That is what keeps a partly-translated
 * section coherent rather than half-empty — and it is still true per section,
 * even though the three routed pages are now translated end to end.
 */
export function useCopy<T extends object>(en: T, zh: Partial<T>): T {
  const { locale } = useLocale();
  return useMemo(
    () => (locale === "ZH" ? { ...en, ...zh } : en),
    [locale, en, zh],
  );
}
