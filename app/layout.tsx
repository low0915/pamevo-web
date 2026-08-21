import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Grain } from "@/components/ui/Grain";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
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
        <SmoothScroll />
        <Header />
        {children}
        <Footer />
        <Grain />
      </body>
    </html>
  );
}
