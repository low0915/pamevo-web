import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Grain } from "@/components/ui/Grain";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { CookieConsent } from "@/components/site/CookieConsent";
import { SEO } from "@/lib/content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: SEO.home.title,
    /** Sub-pages set only their own half of the title; this appends the brand
        so no page can ship without it. */
    template: SEO.titleTemplate,
  },
  description: SEO.home.description,
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
        <Header />
        {children}
        <Footer />
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
