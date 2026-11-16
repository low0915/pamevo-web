"use client";

import { DoorIcon, HandshakeIcon } from "@phosphor-icons/react";
import { siWhatsapp } from "simple-icons";
import { WHATSAPP } from "@/lib/content";
import { localePath, useLocale } from "@/lib/locale";
import { Z } from "@/lib/z";

/**
 * Three round shortcuts pinned to the right edge of every page: Our Products,
 * Contact Us, and WhatsApp. Mounted once in Shell, so every route in every
 * language gets them.
 *
 * Sits at the header's layer: under the mobile drawer, the lightbox and the
 * cookie banner, so none of those is ever covered by it. Each button carries
 * its name for screen readers, and shows it as a label on hover from `md` up.
 */
const LABELS = {
  EN: { products: "Our Products", contact: "Contact Us", whatsapp: "WhatsApp" },
  BM: { products: "Produk Kami", contact: "Hubungi Kami", whatsapp: "WhatsApp" },
  ZH: { products: "我们的产品", contact: "联系我们", whatsapp: "WhatsApp" },
};

export function FloatingActions() {
  const { locale } = useLocale();
  const label = LABELS[locale];

  const items = [
    {
      key: "products",
      href: localePath("/our-products", locale),
      label: label.products,
      icon: <DoorIcon size={24} weight="light" aria-hidden />,
    },
    {
      key: "contact",
      href: localePath("/contact", locale),
      label: label.contact,
      icon: <HandshakeIcon size={24} weight="light" aria-hidden />,
    },
    {
      key: "whatsapp",
      href: WHATSAPP.url,
      label: label.whatsapp,
      external: true,
      icon: (
        <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor" aria-hidden>
          <path d={siWhatsapp.path} />
        </svg>
      ),
    },
  ];

  return (
    <nav
      aria-label="Quick links"
      style={{ zIndex: Z.header }}
      className="fixed top-1/2 right-3 flex -translate-y-1/2 flex-col gap-3 md:right-5 md:gap-4"
    >
      {items.map((item) => (
        <a
          key={item.key}
          href={item.href}
          aria-label={item.label}
          {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="group relative flex size-11 items-center justify-center rounded-full bg-white text-ink shadow-[0_4px_16px_rgb(16_18_21/0.16)] ring-1 ring-[rgb(16_18_21/0.06)] transition-transform duration-[160ms] ease-out hover:scale-105 active:scale-95 md:size-14"
        >
          {item.icon}
          <span
            aria-hidden
            className="pointer-events-none absolute right-full mr-3 hidden translate-x-1 rounded-full bg-ink px-3 py-1.5 text-sm font-medium whitespace-nowrap text-bg opacity-0 transition duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 md:block"
          >
            {item.label}
          </span>
        </a>
      ))}
    </nav>
  );
}
