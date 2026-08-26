"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { LOCALES } from "./content";

export type Locale = (typeof LOCALES)[number];

/** Where the choice is remembered between visits. A language preference is a
    functional setting, not tracking, so it is stored outright rather than
    gated behind the cookie banner. */
const STORAGE_KEY = "mevo-locale";

/** What `<html lang>` becomes for each toggle position. ZH is Simplified —
    the same subtag the product specs already carry in ProductCatalog. */
const HTML_LANG: Record<Locale, string> = { EN: "en", ZH: "zh-Hans" };

function parse(value: string | null): Locale | null {
  return value === "EN" || value === "ZH" ? value : null;
}

/**
 * The chosen locale, held as one module-level store rather than in React
 * state.
 *
 * The page is not routed per language: there is one URL and the copy swaps in
 * place. That is deliberate at this size — only part of the site is
 * translated, so a /zh route would promise a Chinese site that does not exist
 * yet. What that leaves is a single value several unrelated components read
 * (both toggles, four sections), and localStorage and other tabs writing to it
 * from outside React. That is an external store, so it is subscribed to as one
 * — which is also what keeps the restore off an effect that would have to
 * setState during mount.
 */
let current: Locale = "EN";
let restored = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  const next = parse(event.newValue);
  if (!next || next === current) return;
  current = next;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Locale {
  /* Read once, then cached in `current`: getSnapshot has to return the same
     value until something calls a listener, so it cannot go to storage on
     every render. */
  if (!restored) {
    restored = true;
    try {
      current = parse(window.localStorage.getItem(STORAGE_KEY)) ?? current;
    } catch {
      /* Private modes can refuse storage outright. EN is the fallback. */
    }
  }
  return current;
}

/** The server, and the client's hydration pass, always render English. A
    returning ZH reader is switched over in the commit right after, which is a
    re-render rather than a hydration mismatch. */
function getServerSnapshot(): Locale {
  return "EN";
}

export function setLocale(next: Locale) {
  if (next === current) return;
  current = next;
  restored = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* Nothing to do: the choice still applies for this visit. */
  }
  emit();
}

export function useLocale() {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  /* `setLocale` is a module function, so it is already stable across
     renders and needs no memoisation. */
  return { locale, setLocale };
}

/**
 * Keeps `<html lang>` on the language actually being read. Mounted once in the
 * root layout; renders nothing.
 */
export function LocaleSync() {
  const { locale } = useLocale();

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale];
  }, [locale]);

  return null;
}

/**
 * Picks the copy for the current locale.
 *
 * The ZH object is a partial overlay, not a parallel translation: only the
 * strings the client has actually supplied are in it, and everything else
 * falls through to the English original. That is what keeps a half-translated
 * page coherent rather than half-empty.
 */
export function useCopy<T extends object>(en: T, zh: Partial<T>): T {
  const { locale } = useLocale();
  return useMemo(
    () => (locale === "ZH" ? { ...en, ...zh } : en),
    [locale, en, zh],
  );
}
