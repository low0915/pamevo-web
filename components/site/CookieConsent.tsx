"use client";

import { useEffect, useRef } from "react";
import * as cc from "vanilla-cookieconsent";
import { CONSENT } from "@/lib/content";
import { holdAutoplay, releaseAutoplay } from "@/lib/autoplay";
import { Z } from "@/lib/z";

/**
 * Bump when what the categories actually cover changes — the day a tracker is
 * added, not when the wording is tidied. A change re-asks everyone who has
 * already answered, which is right for the first case and rude for the second.
 */
const REVISION = 0;

/** How long a choice stands before it is asked again. */
const CONSENT_DAYS = 182;

/**
 * The copy, in the shape vanilla-cookieconsent wants it.
 *
 * A preferences section becomes a toggle by carrying `linkedCategory`; the ones
 * without it are prose. Order here is the order on screen.
 */
const EN = {
  consentModal: {
    label: CONSENT.banner.label,
    title: CONSENT.banner.title,
    description: CONSENT.banner.description,
    acceptAllBtn: CONSENT.banner.acceptAll,
    acceptNecessaryBtn: CONSENT.banner.acceptNecessary,
    showPreferencesBtn: CONSENT.banner.showPreferences,
    closeIconLabel: CONSENT.banner.closeIconLabel,
    footer: CONSENT.banner.footer,
  },
  preferencesModal: {
    title: CONSENT.preferences.title,
    acceptAllBtn: CONSENT.preferences.acceptAll,
    acceptNecessaryBtn: CONSENT.preferences.acceptNecessary,
    savePreferencesBtn: CONSENT.preferences.save,
    closeIconLabel: CONSENT.preferences.closeIconLabel,
    serviceCounterLabel: CONSENT.preferences.serviceCounterLabel,
    sections: [
      {
        title: CONSENT.preferences.intro.title,
        description: CONSENT.preferences.intro.description,
      },
      {
        title: CONSENT.preferences.necessary.title,
        description: CONSENT.preferences.necessary.description,
        linkedCategory: "necessary",
      },
      {
        title: CONSENT.preferences.analytics.title,
        description: CONSENT.preferences.analytics.description,
        linkedCategory: "analytics",
      },
      {
        title: CONSENT.preferences.marketing.title,
        description: CONSENT.preferences.marketing.description,
        linkedCategory: "marketing",
      },
      {
        title: CONSENT.preferences.more.title,
        description: CONSENT.preferences.more.description,
      },
    ],
  },
};

/**
 * Cookie consent, on vanilla-cookieconsent.
 *
 * The site sets no tracking cookies today. This is here so that the day one is
 * added it is already behind a choice rather than in front of one: a tracker
 * ships as `<script type="text/plain" data-category="analytics">`, inert until
 * the category it names is allowed, and the plugin swaps it for a live script
 * at that moment. Two things follow from how that works, and both are easy to
 * get wrong later:
 *
 *   - Gated scripts must live in app/layout.tsx. The plugin collects
 *     `script[data-category]` once, inside `run()`. One placed in a page would
 *     mount after that sweep and stay inert for good.
 *   - So must anything carrying `data-cc="show-preferencesModal"`, for the same
 *     reason — see the footer's button.
 *
 * Structure follows components/ui/SmoothScroll.tsx: a client component that
 * renders nothing and exists only to run an effect. The whole configuration
 * sits here beside the `run()` that consumes it; only the strings leave, into
 * lib/content.ts.
 *
 * The panels are dressed in the site's own material rather than the plugin's:
 * `onModalReady` puts `.glass` and `.glass-rim` on them, which is why the CSS
 * is imported into a cascade layer in app/globals.css — see the note there.
 */
export function CookieConsent() {
  const started = useRef(false);

  useEffect(() => {
    // The plugin guards itself with a `window._ccRun` flag, but leaning on an
    // undocumented global for StrictMode's second pass is not a thing to do.
    if (started.current) return;
    started.current = true;

    // The plugin reads its stacking order from a variable it defaults to
    // 2147483647. Handed the documented scale instead, so the one place z
    // values are decided stays the one place they are decided.
    document.documentElement.style.setProperty(
      "--cc-z-index",
      String(Z.consent),
    );

    cc.run({
      autoShow: true,
      mode: "opt-in",
      revision: REVISION,
      // Must stay false. True puts `overflow: hidden !important` on the page
      // while the notice is up, which would strand Lenis mid-scroll and lurch
      // when it cleared. The notice interrupts the reader, not the page.
      disablePageInteraction: false,

      cookie: {
        name: "cc_cookie",
        expiresAfterDays: CONSENT_DAYS,
        sameSite: "Lax",
        path: "/",
      },

      guiOptions: {
        // A box, not a bar. The header is a floating island inside the page's
        // gutters; an edge-to-edge bar would read as a widget bolted under it.
        // This sits diagonally opposite, as the answer to it.
        consentModal: {
          layout: "box wide",
          position: "bottom left",
          equalWeightButtons: true,
          flipButtons: false,
        },
        preferencesModal: {
          layout: "box",
          position: "right",
          equalWeightButtons: true,
          flipButtons: false,
        },
      },

      categories: {
        necessary: { enabled: true, readOnly: true },
        // Empty by design: nothing is measured yet. When a tracker lands, add
        // its cookies under `autoClear` here, so that withdrawing consent
        // deletes them rather than merely stopping the next one.
        analytics: {},
        marketing: {},
      },

      language: { default: "en", translations: { en: EN } },

      onModalReady: ({ modalName, modal }) => {
        modal.classList.add("glass", "glass-rim");
        // The notice does not freeze the page, so telling assistive tech the
        // rest of the document is inert would be untrue. The preferences panel
        // keeps its `aria-modal`, because that one genuinely is modal.
        if (modalName === "consentModal") modal.removeAttribute("aria-modal");
      },

      // The autoplay reads a wheel or a swipe as "the reader has taken over".
      // A dialog opening is neither, so it is said in words instead.
      onModalShow: holdAutoplay,
      onModalHide: releaseAutoplay,
    });
  }, []);

  return null;
}
