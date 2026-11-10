import Image from "next/image";
import Link from "next/link";

import { ProductSpecs } from "@/components/product/ProductSpecs";
import { PRODUCTS_PAGE, PRODUCTS_PAGE_ZH, SEO, SEO_ZH } from "@/lib/content";
import { neighbours, productTitle, related, type Product } from "@/lib/products";
import type { Locale } from "@/lib/paths";

/**
 * One product, on its own page.
 *
 * Deliberately NOT a new design. Everything here is the catalogue row's own
 * markup at a larger size: the same `glass glass-flat glass-rim` panel, the
 * same mono/underlined group headings, the same bullets (through the
 * shared ProductSpecs), the same pill CTA. What the page adds is what a row
 * cannot hold — a heading of its own, a breadcrumb, the prose, every photograph
 * at full size rather than a thumbnail strip, and links out to its siblings.
 *
 * A server component: nothing here is interactive, so none of it needs to reach
 * the browser as JavaScript.
 */
export function ProductDetail({
  product,
  locale = "EN",
}: {
  product: Product;
  locale?: Locale;
}) {
  const zh = locale === "ZH";
  const copy = zh ? { ...PRODUCTS_PAGE, ...PRODUCTS_PAGE_ZH } : PRODUCTS_PAGE;
  const seo = zh ? SEO_ZH : SEO;
  const base = seo.products.path;
  const { previous, next } = neighbours(product);
  const siblings = related(product);

  return (
    <main className="flex-1">
      <section className="px-4 pt-32 pb-24 md:px-8 md:pt-40 md:pb-32 lg:px-12">
        <div className="mx-auto w-full max-w-[1440px]">
          {/* A real breadcrumb, matching the BreadcrumbList in the JSON-LD.
              Markup that claims a trail the page does not show is the kind of
              structured data Google eventually stops trusting. */}
          <nav
            aria-label={zh ? "面包屑导航" : "Breadcrumb"}
            className="font-mono text-xs tracking-tight text-ink-3 uppercase"
          >
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href={zh ? "/zh" : "/"} className="hover:text-ink">
                  {zh ? "首页" : "Home"}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href={base} className="hover:text-ink">
                  {copy.heading}
                </Link>
              </li>
              <li aria-hidden>/</li>
              {/* The last crumb is the page itself, so it is not a link — the
                  same rule the JSON-LD follows by omitting `item`. */}
              <li aria-current="page" className="text-ink-2 normal-case">
                {productTitle(product, locale)}
              </li>
            </ol>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
            <div>
              <p className="font-mono text-xs tracking-tight text-ink-3 uppercase">
                {product.no} — {product.category}
              </p>
              <h1 className="mt-3 max-w-[18ch] text-5xl leading-[1.04] font-medium tracking-tighter text-ink md:text-6xl">
                {productTitle(product, locale)}
              </h1>

              {product.blurb ? (
                <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-ink-2">
                  {product.blurb}
                </p>
              ) : null}

              {/* Every photograph at full size. In the catalogue these are a
                  thumbnail strip, which is right in a row and wrong here: for
                  product 16 the three shots ARE its three variants, so at this
                  size they are the content rather than a preview of it. */}
              <div className="mt-10 grid gap-4">
                {product.images.map((image, i) => (
                  <div
                    key={image.src}
                    className="relative aspect-[4/3] w-full overflow-hidden rounded-[8px] bg-surface-2"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      quality={78}
                      /* The LCP element, and unambiguously so: there is nothing
                         above it but text. */
                      {...(i === 0
                        ? { preload: true }
                        : { loading: "lazy" as const })}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* The catalogue row's panel, unchanged but for its width. */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="glass glass-flat glass-rim relative overflow-hidden rounded-[8px] p-5">
                <ProductSpecs groups={product.groups} locale={locale} />

                <div className="mt-8 flex justify-end">
                  <Link
                    href={copy.cta.href}
                    aria-label={copy.cta.aria(productTitle(product, locale))}
                    className="inline-flex items-center rounded-full bg-ink px-5 py-2.5 text-base font-medium tracking-tight text-bg transition-transform duration-[160ms] ease-[var(--ease-out)] hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {copy.cta.label}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Siblings in the same category. Internal links carrying the model
              number as anchor text, which is the term these pages can actually
              win — and it stops each product hanging off the catalogue alone. */}
          {siblings.length > 0 && (
            <div className="mt-20 border-t border-line pt-8">
              <h2 className="font-mono text-xs tracking-tight text-ink-3 uppercase">
                {zh ? `更多${product.category}产品` : `More in ${product.category}`}
              </h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {siblings.map((sibling) => (
                  <li key={sibling.slug}>
                    <Link
                      href={`${base}/${sibling.slug}`}
                      className="glass glass-flat glass-rim block overflow-hidden rounded-[8px] transition-transform duration-[160ms] ease-[var(--ease-out)] hover:-translate-y-0.5"
                    >
                      <span className="relative block aspect-[4/3] w-full bg-surface-2">
                        <Image
                          src={sibling.images[0].src}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, 25vw"
                          quality={60}
                          className="object-cover"
                        />
                      </span>
                      <span className="block p-4 text-base leading-snug tracking-tight text-ink">
                        {productTitle(sibling, locale)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Previous/next across the whole catalogue, so all twenty stay
              reachable by crawl from any one of them. */}
          <nav
            aria-label={zh ? "上一个 / 下一个产品" : "Previous and next product"}
            className="mt-12 flex items-start justify-between gap-6 border-t border-line pt-6 text-base"
          >
            <div>
              {previous && (
                <Link
                  href={`${base}/${previous.slug}`}
                  className="text-ink-2 hover:text-ink"
                >
                  ← {productTitle(previous, locale)}
                </Link>
              )}
            </div>
            <div className="text-right">
              {next && (
                <Link
                  href={`${base}/${next.slug}`}
                  className="text-ink-2 hover:text-ink"
                >
                  {productTitle(next, locale)} →
                </Link>
              )}
            </div>
          </nav>
        </div>
      </section>
    </main>
  );
}
