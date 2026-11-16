import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { EnquiryBand } from "@/components/site/EnquiryBand";
import { ClosingSheet } from "@/components/site/ClosingSheet";
import { PageHold } from "@/components/site/PageHold";
import { Grain } from "@/components/ui/Grain";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { CookieConsent } from "@/components/site/CookieConsent";
import { FloatingActions } from "@/components/site/FloatingActions";
import { FONT_VARIABLES } from "@/lib/fonts";
import { LocaleProvider } from "@/lib/locale";
import { HTML_LANG, type Locale } from "@/lib/paths";

/**
 * The document, shared by both root layouts.
 *
 * There are two root layouts — app/(en)/layout.tsx and app/(zh)/layout.tsx —
 * because `<html lang>` has to be correct in the HTML the server sends, and
 * only a root layout renders the <html> element. Everything inside it is
 * identical between the two, so it lives here rather than being kept in step by
 * hand in two files.
 *
 * Crossing between the groups is a full page load rather than a client
 * navigation. That is inherent to multiple root layouts, and it is the right
 * behaviour here: a language switch should re-request the document, not patch
 * the current one.
 */
export function Shell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <html
      lang={HTML_LANG[locale]}
      className={`${FONT_VARIABLES} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Set during parse, not at hydration: the browser restores a reload's
            scroll position on the load event, which is far too early for a
            React effect to have turned restoration off. The page is scrubbed,
            so a restored position is a reader dropped into the middle of a
            sequence they never saw begin. */}
        <script
          dangerouslySetInnerHTML={{
            __html: 'history.scrollRestoration = "manual";',
          }}
        />
        <SmoothScroll />
        {/* The locale is a constant for this whole tree — it is which root
            layout rendered — so it is provided once here and read by every
            section through `useCopy`. */}
        <LocaleProvider locale={locale}>
          <Header />
          {/* The page, held. Once it has been scrolled almost entirely past it
              pins by its foot, so its last screen stops on the display and the
              closing sheet below is drawn up over something standing still —
              which is the same thing the home page's sections do to each other.
              See PageHold. */}
          <PageHold>{children}</PageHold>
          {/* The closing enquiry and the footer, as ONE sheet.

              Grouped rather than stacked: they are what closes every page, and
              a curtain that lifted the band while leaving the footer behind
              read as one of them coming loose. ClosingSheet carries the
              overlap, the shadow and the travel for the pair.

              Here rather than at the foot of each page for the reason the
              header is here: one band, twenty-five routes that show it, three
              languages, and no copy of it anywhere to fall out of step. It
              reads the locale from the provider it sits inside, and takes
              itself off /contact — see EnquiryBand. */}
          <ClosingSheet>
            <EnquiryBand />
            <Footer />
          </ClosingSheet>
          {/* Products, Contact and WhatsApp, pinned to the right edge of
              every page. See FloatingActions. */}
          <FloatingActions />
        </LocaleProvider>
        <Grain />
        {/* Last, and in the root layout rather than a page: the plugin sweeps
            the document once for gated scripts and for the footer's
            preferences button, so anything it must find has to be mounted by
            the time this runs, and has to stay mounted. */}
        <CookieConsent />
      </body>
    </html>
  );
}
