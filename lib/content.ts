/**
 * Single source of truth for every visible string on the page.
 * Copy is taken verbatim from paprojects.com.my, including its own casing
 * and spelling. Lorem Ipsum and template attributions are deliberately absent.
 */

import { bmPath, zhPath, type Locale } from "./paths";
/* The catalogue, for PROJECT_GALLERY below — which is built from it rather
   than transcribed beside it. lib/products.ts imports nothing of its own, so
   this is a leaf dependency and not the start of a cycle. */
import { PRODUCTS } from "./products";

/** `href` is set only on pages that actually exist. Everything else stays an
    inert placeholder until its route is built. */
export type NavItem = {
  label: string;
  href?: string;
  children?: { label: string; href?: string }[];
};

export const NAV: NavItem[] = [
  {
    label: "Our Profile",
    href: "/our-profile",
    /* Our Story and Vision & Mission are the two sections OF /our-profile, so
       the first two children are fragments of that one page; Director's Profile
       is a page of its own and the third child is a real route. Same shape as
       Our Products below, with one difference that matters for the current-mark:
       a child here can be a different page, so the parent's active state is
       `isNavItemCurrent` (which also lights on /directors-profile) rather than a
       plain path check — see lib/paths.ts.

       The fragment children need a target id with scroll-margin on the page:
       #story on the lead section in Background.tsx, #vision on VisionMission.tsx.
       They are rendered as plain anchors, not next/link — the reason is in the
       submenu note in Header.tsx. */
    children: [
      { label: "Our Story", href: "/our-profile#story" },
      { label: "Vision & Mission", href: "/our-profile#vision" },
      { label: "Director's Profile", href: "/directors-profile" },
    ],
  },
  { label: "Services & Features", href: "/services" },
  {
    label: "Our Products",
    href: "/our-products",
    /* The catalogue's own two halves, and they are live now.
    
       Not routes of their own: both open /our-products and the fragment picks
       the filter up on arrival. That keeps one page and one indexed URL for
       twenty products while still letting the nav point at half of them — see
       `systemFromHash` in lib/products.ts for why a fragment rather than a
       query parameter, and what it costs. */
    children: [
      { label: "Window System", href: "/our-products#window" },
      { label: "Door System", href: "/our-products#door" },
      /* The material library under the catalogue. An element id rather than
         a filter keyword, so SmoothScroll lands on it like any other anchor. */
      { label: "Glass, Finishes & Hardware", href: "/our-products#materials" },
    ],
  },
  /* "Our Project" is hidden from the header for now. The page still exists at
     /our-projects; to bring the link back, restore
     `{ label: "Our Project", href: "/our-projects" }` here AND its line in
     NAV_ZH_LABELS and NAV_BM_LABELS below — they are positional. */
  { label: "Contact Us", href: "/contact" },
];

/**
 * Labels, and the Chinese URL for each.
 *
 * The href is DERIVED from the English one through `zhPath` rather than being
 * carried over unchanged. It used to be carried over, on the reasoning that a
 * route could then never be right in one language and stale in the other —
 * which was true while both languages shared one URL. Once /zh became real
 * routes that same sharing became the bug: the Chinese header linked a Chinese
 * reader straight out to the English pages.
 *
 * "联系我们" rather than a bare "联系": the English "Contact Us" is a phrase in
 * both halves, and it is the same wording the projects strip already ends on.
 *
 * The sub-labels are translated here too, which the note this replaces asked
 * for when the first `children` appeared. They are positional — index i of this
 * list is index i of NAV, and the children line up the same way — so an item
 * added to NAV needs a line adding here or it renders in English, and an item
 * REMOVED from NAV needs removing from both of these or every label below it
 * shifts up one and the nav silently mislabels itself. That is not
 * hypothetical: Vision & Mission came out of the middle of this list when its
 * page was folded into the profile page, and taking it out of NAV alone would
 * have left Services reading "Visi & Misi".
 *
 * FOR THE CLIENT TO CONFIRM: five of these six are new and are not the client's
 * own words, unlike the section copy elsewhere in this file. 服务与特色 in
 * particular is a literal rendering of "Services & Features" and a Malaysian
 * Chinese reader may expect 服务与特点. Nothing here is load-bearing until the
 * four unbuilt pages exist, which is the moment to have them checked.
 */
const NAV_ZH_LABELS: { label: string; children?: string[] }[] = [
  { label: "公司简介", children: ["我们的故事", "愿景与使命", "董事简介"] },
  { label: "服务与特色" },
  { label: "我们的产品", children: ["窗系统", "门系统", "玻璃、饰面与五金"] },
  { label: "联系我们" },
];

export const NAV_ZH: NavItem[] = NAV.map((item, i) => ({
  ...item,
  label: NAV_ZH_LABELS[i].label,
  href: item.href ? zhPath(item.href) : undefined,
  /* Falls back to the English sub-label rather than dropping the row: a missing
     translation should show the wrong language, not an empty menu. */
  children: item.children?.map((child, j) => ({
    label: NAV_ZH_LABELS[i].children?.[j] ?? child.label,
    /* Through `zhPath` for the reason the parent href is: a child carried over
       unchanged would send a Chinese reader to the English catalogue. The
       fragment rides along untouched, since the prefix goes on the front. */
    href: child.href ? zhPath(child.href) : undefined,
  })),
}));

/**
 * The same six, in Malay, built the same way and from the same list — so a nav
 * item added to NAV needs a line here and a line in NAV_ZH_LABELS or it renders
 * in English in that language.
 *
 * "Hubungi Kami" rather than a bare "Hubungi": the verb does not stand alone as
 * a label any more than the Chinese one does, and it is the same phrase the
 * projects strip ends on.
 */
const NAV_BM_LABELS: { label: string; children?: string[] }[] = [
  { label: "Profil Kami", children: ["Kisah Kami", "Visi & Misi", "Profil Pengarah"] },
  { label: "Perkhidmatan & Ciri" },
  { label: "Produk Kami", children: ["Sistem Tingkap", "Sistem Pintu", "Kaca, Kemasan & Perkakasan"] },
  { label: "Hubungi Kami" },
];

export const NAV_BM: NavItem[] = NAV.map((item, i) => ({
  ...item,
  label: NAV_BM_LABELS[i].label,
  href: item.href ? bmPath(item.href) : undefined,
  children: item.children?.map((child, j) => ({
    label: NAV_BM_LABELS[i].children?.[j] ?? child.label,
    href: child.href ? bmPath(child.href) : undefined,
  })),
}));

/**
 * The language switch, as it is OFFERED rather than as it exists.
 *
 * LOCALES in lib/paths.ts is the list of languages the site is actually built
 * in, and everything that depends on a route reads it: hreflang, the sitemap,
 * `counterpart`, the two root layouts. Bahasa Melayu is not in it and must not
 * be — adding it there would publish hreflang for pages that 404.
 *
 * This is the other list: what the switch shows a reader. An entry with no
 * `locale` is a language named but not built, and renders inert, exactly as a
 * NavItem with no `href` does. When the Malay copy lands, that one line gains
 * a `locale` and the switch starts working — everything else follows from
 * LOCALES.
 */
export const LOCALE_MENU: {
  /** What the switch prints: the two letters, as before. */
  code: string;
  /** The routed locale, when the language has pages. Absent means not built. */
  locale?: Locale;
  /** For `lang` and `hreflang`. `ms` is Malay's own subtag. */
  lang: string;
  /** The language's name in the language, for the row under the code. */
  name: string;
}[] = [
  { code: "EN", locale: "EN", lang: "en", name: "English" },
  { code: "BM", locale: "BM", lang: "ms", name: "Bahasa Melayu" },
  { code: "ZH", locale: "ZH", lang: "zh-Hans", name: "中文" },
];

/* Defined in lib/paths.ts and re-exported here, so importing it from
   "@/lib/content" keeps working. See the note there. */
export { LOCALES } from "./paths";

/** Deep link to the sales WhatsApp. Same number as FOOTER.phone, written in the
    international format the api.whatsapp.com endpoint expects. */
export const WHATSAPP = {
  url: "https://api.whatsapp.com/send/?phone=60148797371",
  label: "Chat on WhatsApp",
};

/** The logo is a co-branded lockup: P.A. PROJECTS x MEVO. */
export const LOGO_ALT = "P.A. Projects and MEVO";

/**
 * The site's own identity, for the metadata layer.
 *
 * `url` is hardcoded rather than read from an env var on purpose. An unset
 * NEXT_PUBLIC_SITE_URL does not fail a build — it silently ships canonicals and
 * og:urls pointing at localhost, which is the one SEO fault nobody notices
 * until a month of indexing has already gone wrong.
 */
export const SITE = {
  url: "https://paprojects.com.my",
  name: "MEVO Malaysia",
  legalName: "PA Projects Marketing Sdn Bhd",
  /** SSM company number, as printed in the footer. */
  regNo: "847136-X",
  /** Malaysian English, which is what the copy is written in. */
  locale: "en_MY",
} as const;

/**
 * The showroom address in parts, for structured data.
 *
 * FOOTER.address prints the same address as one human-readable line. These are
 * kept beside it rather than parsed out of it, because parsing a formatted
 * address is a guess and the JSON-LD would drift the moment the line is
 * re-punctuated.
 */
export const ADDRESS = {
  streetAddress: "19, Jalan 15/23, Taman Perindustrian Tiong Nam, Seksyen 15",
  postalCode: "40200",
  addressLocality: "Shah Alam",
  addressRegion: "Selangor",
  addressCountry: "MY",
} as const;

/**
 * Head copy: the browser tab and the search result, not the page body. It sits
 * with the rest of the copy because it is still copy, and because a title that
 * drifts from the page it names is worse than one written in the wrong file.
 *
 * Titles stay under ~60 characters, where Google truncates them, and lead
 * with what people actually search for — aluminium windows and doors, in
 * Malaysia — rather than with the brand, which has no search volume yet.
 *
 * Descriptions are written to fit the ~160 characters a result snippet shows.
 * The client's longer framing of the brand — the Top 10 Chinese system paired
 * with a Bursa-listed Malaysian extruder — is the Background section's job,
 * where it has room to be read. A description cut off mid-word says less than
 * a shorter one that finishes its sentence.
 *
 * `path` is the page's canonical, and the key the metadata builder in lib/seo.ts
 * keys off. It lives here so a page's URL and its title are stated together.
 */
export const SEO = {
  /** Pages supply their own half; this appends the brand. See app/layout.tsx. */
  titleTemplate: "%s | MEVO Malaysia",
  home: {
    path: "/",
    title: "Aluminium Windows & Doors Malaysia | MEVO Malaysia",
    description:
      "High-performance aluminium windows, doors and sunrooms for Malaysian homes and developments. MEVO systems supplied, installed and serviced from Shah Alam.",
  },
  products: {
    path: "/our-products",
    title: "Aluminium Window & Door Systems",
    description:
      "Browse 20 MEVO window and door systems: casement, awning, sliding and panoramic windows, bifold and entry doors, sunrooms and aluminium-clad wood. Full specs.",
  },
  privacy: {
    path: "/privacy",
    title: "Privacy & Cookies",
    description:
      "How MEVO Malaysia handles personal data, and the cookies this website stores.",
  },
  contact: {
    path: "/contact",
    title: "Contact",
    description:
      "Speak to MEVO Malaysia about aluminium windows and doors: send an enquiry, call 014 - 879 7371, or visit the Shah Alam showroom.",
  },
  story: {
    path: "/our-profile",
    title: "Our Profile",
    description:
      "Established 2004, listed on Bursa Malaysia 2006: how P.A. Group grew from an aluminium extruder into the group behind MEVO Malaysia, and the vision behind it.",
  },
  directors: {
    path: "/directors-profile",
    title: "Director's Profile",
    description:
      "The leadership behind P.A. Resources Berhad and MEVO Malaysia, the group supplying aluminium window and door systems across the country.",
  },
  services: {
    path: "/services",
    title: "Services & Features",
    description:
      "Architectural consultation, custom system selection, supply, certified installation and after-sales service for aluminium windows and doors in Malaysia.",
  },
  projects: {
    path: "/our-projects",
    title: "Our Projects",
    description:
      "Aluminium windows and doors from MEVO Malaysia in completed homes, commercial spaces and facades: casement, panoramic, sliding and entry systems in place.",
  },
};

/**
 * The Chinese head copy, for the three routed /zh pages.
 *
 * A full object rather than a partial overlay: metadata is read on the server
 * by `generateMetadata`, outside React, so there is no `useCopy` to merge it —
 * lib/seo.ts picks between SEO and SEO_ZH on the locale directly.
 *
 * `path` is the Chinese URL, and it is what the page's own canonical becomes.
 * The English path is derived from it for the hreflang pair rather than being
 * repeated, so the two can never disagree about which pages are counterparts.
 *
 * There is no `privacy` entry. That page is English-only; see PAIRED_PATHS in
 * lib/locale.tsx.
 */
export const SEO_ZH = {
  titleTemplate: "%s | MEVO 马来西亚",
  home: {
    path: "/zh",
    /**
     * No brand suffix here, where SEO.home.title carries one — and the
     * asymmetry is load-bearing rather than an oversight.
     *
     * A title template applies to CHILD segments, not to the segment that
     * defines it. The English home page is app/(en)/page.tsx, which sits in the
     * same segment as the layout holding the template, so nothing is appended
     * and the brand has to be written into the string. The Chinese home page is
     * app/(zh)/zh/page.tsx — one segment deeper than app/(zh)/layout.tsx — so
     * the template does apply, and a brand written in here would be printed
     * twice.
     */
    title: "马来西亚铝合金门窗",
    description:
      "为马来西亚住宅与发展项目打造的高性能铝合金门窗及阳光房。MEVO 系统，由莎阿南展厅提供供应、安装与售后服务。",
  },
  products: {
    path: "/zh/our-products",
    title: "铝合金门窗系统",
    description:
      "浏览 20 款 MEVO 门窗系统：平开窗、上悬窗、推拉窗、极简全景窗、折叠门、入户门、阳光房与铝包木，附完整规格。",
  },
  contact: {
    path: "/zh/contact",
    title: "联系我们",
    description:
      "就铝合金门窗事宜联系 MEVO 马来西亚：在线咨询、致电 014 - 879 7371，或莅临莎阿南展厅。",
  },
  story: {
    path: "/zh/our-profile",
    title: "公司简介",
    description:
      "2004 年成立，2006 年于马来西亚交易所主板上市：P.A. Group 如何从铝型材挤压商成长为 MEVO 马来西亚门窗业务背后的集团，以及支撑这一切的愿景与使命。",
  },
  directors: {
    path: "/zh/directors-profile",
    title: "董事简介",
    description:
      "P.A. Resources Berhad 与 MEVO 马来西亚背后的领导团队 —— 为全国供应铝合金门窗系统的集团。",
  },
  services: {
    path: "/zh/services",
    title: "我们的服务",
    description:
      "建筑咨询、定制设计与系统选型、供应与项目协调、持证安装及售后服务 —— 马来西亚铝合金门窗的全流程服务。",
  },
  projects: {
    path: "/zh/our-projects",
    title: "我们的项目",
    description:
      "MEVO 马来西亚铝合金门窗在已完成住宅、商业空间与建筑幕墙中的实景：平开、全景、推拉与入户系统。",
  },
};

/**
 * The Malay head copy, for the three routed /bm pages.
 *
 * A full object rather than a partial overlay, for the same reason SEO_ZH is:
 * metadata is read on the server by `generateMetadata`, outside React, so there
 * is no `useCopy` to merge it.
 *
 * `path` carries the /bm prefix and English segments beneath it — /bm/contact,
 * not /bm/hubungi. That is the shape /zh already uses, and it is the one that
 * keeps PAIRED_PATHS honest: the pairing is computed by stripping a prefix, so
 * a translated segment would need a lookup table per language and would break
 * hreflang the first time one drifted.
 *
 * `title` carries no brand, where SEO.home.title does. The template appends one
 * to child segments, and app/(bm)/bm/page.tsx is a child of the layout that
 * defines it — see the same note on SEO_ZH.
 */
export const SEO_BM = {
  titleTemplate: "%s | MEVO Malaysia",
  home: {
    path: "/bm",
    title: "Tingkap & Pintu Aluminium Malaysia",
    description:
      "Sistem tingkap, pintu dan sunroom aluminium berprestasi tinggi untuk rumah dan projek pembangunan di Malaysia. Sistem MEVO dibekal, dipasang dan diselenggara dari Shah Alam.",
  },
  products: {
    path: "/bm/our-products",
    title: "Sistem Tingkap & Pintu Aluminium",
    description:
      "Terokai 20 sistem tingkap dan pintu MEVO: casement, awning, gelangsar, panoramik, bifold, pintu utama, sunroom dan aluminium bersalut kayu. Spesifikasi penuh.",
  },
  contact: {
    path: "/bm/contact",
    title: "Hubungi Kami",
    description:
      "Hubungi MEVO Malaysia tentang tingkap dan pintu aluminium: hantar pertanyaan, telefon 014 - 879 7371, atau kunjungi bilik pameran kami di Shah Alam.",
  },
  story: {
    path: "/bm/our-profile",
    title: "Profil Kami",
    description:
      "Ditubuhkan 2004, tersenarai di Bursa Malaysia 2006: bagaimana P.A. Group berkembang daripada pengekstrud aluminium kepada kumpulan di sebalik MEVO Malaysia, serta visi dan misi di sebaliknya.",
  },
  directors: {
    path: "/bm/directors-profile",
    title: "Profil Pengarah",
    description:
      "Kepimpinan di sebalik P.A. Resources Berhad dan MEVO Malaysia, kumpulan yang membekalkan sistem tingkap dan pintu aluminium di seluruh negara.",
  },
  services: {
    path: "/bm/services",
    title: "Perkhidmatan Kami",
    description:
      "Perundingan seni bina, pemilihan sistem tersuai, pembekalan, pemasangan bertauliah dan perkhidmatan selepas jualan untuk tingkap dan pintu aluminium di Malaysia.",
  },
  projects: {
    path: "/bm/our-projects",
    title: "Projek Kami",
    description:
      "Tingkap dan pintu aluminium MEVO Malaysia dalam rumah, ruang komersial dan fasad yang telah siap: sistem casement, panoramik, gelangsar dan pintu utama.",
  },
};

export const HERO = {
  /** Set on one line on the hero's first slide. */
  tagline: "Innovation. Performance. Affordable.",
  subheading:
    "Redefining Modern Living Through High-Performance Window & Door Systems",
  /** The first slide's picture: the product in use, a full-height sliding
      door opened onto a terrace pool. Replaced the abstract chrome footage
      (/hero-video.mp4, still in public/), which showed no window or door. */
  image: "/products/07.jpg",
  alt: "A full-height aluminium sliding door opened from a living room onto a terrace pool, a fixed window panel beside it",
  /**
   * The page’s real <h1>. What is visible in that slot is the logo image, so
   * the heading text is rendered sr-only beside it: screen readers and
   * crawlers get one unambiguous statement of who this is and what they sell,
   * and the layout is untouched. Kept in sync with SEO.home.title by hand -
   * they are the same claim written for two different readers.
   */
  heading:
    "P.A. Projects x MEVO Malaysia — specialists in aluminium windows and doors",
  /**
   * The slides after the first, in order. Each leads somewhere: `href` is the
   * English path, and the hero prefixes it for /zh and /bm.
   *
   * Headlines are kept to one line at hero size, like the tagline on slide 1,
   * so every slide's lockup is the same height and the slides line up as they
   * swap. Untranslated for now, so /zh and /bm fall through to this English.
   * Copy is ours, not the client's. Every claim comes from the company
   * catalogue (MEVO MALAYSIA PA PROJECTS e-catalogue) or is already on the
   * site: P.A. Group's in-house smelting, die design, extrusion and anodising
   * and its 3,800 MT monthly extrusion capacity (catalogue p. 3), "one-stop
   * custom service" (its cover), twenty systems, tested performance, and the
   * Shah Alam team.
   *
   * MALAYSIA FIRST: the site is PA Projects', the Malaysian company. MEVO is
   * its partner in China and is named as one, but the slides speak for the
   * Malaysian side — so no "China's top 10" here, though the catalogue has it.
   *
   * "Finished profile", not "finished window": P.A. Group makes the aluminium
   * profile; the windows and doors are MEVO's, made in China.
   *
   * Images are from the site's own library, chosen per destination.
   */
  slides: [
    {
      eyebrow: "Our Products",
      title: "Twenty systems. One standard.",
      body: "Window and door systems supplied, installed and serviced in Malaysia, tested for heat, sound, water and wind.",
      cta: "View Products",
      href: "/our-products",
      image: "/products/05-1.jpg",
      alt: "A slimline panoramic sliding door framing a lake and mountains from a living room",
    },
    {
      eyebrow: "Our Profile",
      title: "From billet to finished profile.",
      body: "Smelted, extruded and anodised in Malaysia by P.A. Group: 3,800 tonnes of profile every month.",
      cta: "About Us",
      href: "/our-profile",
      image: "/pa mevo_up.png",
      alt: "The MEVO and P.A. Projects showroom and office lit at dusk",
    },
    {
      eyebrow: "Services & Features",
      title: "One-stop custom service.",
      body: "Design, customisation, supply, installation and after-sales, from one team.",
      cta: "Our Services",
      href: "/services",
      image: "/services/04.jpg",
      alt: "An installer fixing a window frame in place with a cordless drill",
    },
    {
      eyebrow: "Support",
      title: "Here when you need us.",
      body: "Questions, site visits, servicing and after-sales: talk to our team in Shah Alam.",
      cta: "Contact Us",
      href: "/contact",
      image: "/services/05.jpg",
      alt: "Close view of hands driving a screw into a window frame",
    },
  ],
};

/**
 * Chinese copy is supplied by the client section by section, and only some
 * sections have it. Each ZH export is therefore a partial overlay on the
 * English object beside it: what is here replaces the original, what is
 * missing falls through untranslated. See `useCopy` in lib/locale.tsx.
 *
 * `heading` stays English on purpose - it is the sr-only h1, and a
 * half-translated accessibility layer is worse than a consistent one. The same
 * goes for every `alt` in this file.
 */
export const HERO_ZH: Partial<typeof HERO> = {
  tagline: "创新。性能。实惠。",
  subheading: "通过高性能门窗系统重新定义现代生活",
  /**
   * The real <h1>, translated now that Chinese has a URL of its own.
   *
   * The note above says `heading` stays English because a half-translated
   * accessibility layer is worse than a consistent one. That held while one URL
   * served both languages. On /zh it inverts: the h1 is the single strongest
   * statement a page makes about what it is, and leaving it English on a page
   * that is otherwise Chinese is the one thing most likely to cost the page its
   * own language.
   */
  heading: "P.A. Projects x MEVO 马来西亚 —— 铝合金门窗系统专家",
};

/**
 * The hero in Malay.
 *
 * "Mampu Milik" rather than a literal "Berpatutan" for Affordable: it is the
 * phrase Malaysian housing and property copy actually uses, and this is a line
 * about price on a page selling to homeowners.
 *
 * `heading` is the real sr-only h1 and is translated, for the reason HERO_ZH
 * gives: on a page with its own URL the h1 is the strongest single statement it
 * makes about what it is.
 */
export const HERO_BM: Partial<typeof HERO> = {
  tagline: "Inovasi. Prestasi. Mampu Milik.",
  subheading:
    "Mentakrif Semula Kehidupan Moden Melalui Sistem Tingkap & Pintu Berprestasi Tinggi",
  heading:
    "P.A. Projects x MEVO Malaysia — pakar tingkap dan pintu aluminium",
};

export const BACKGROUND = {
  heading: "Our Story",
  /**
   * One photograph per CHAPTER, swapped as the pinned section scrolls.
   *
   * There are four paragraphs now and still two images, and that is right
   * rather than an oversight: the home page's swap is driven by the two
   * chapters this section has always had, and splitting each of them in two for
   * /our-profile's panels did not add a third chapter. See `paragraphs`.
   */
  images: [
    {
      src: "/pa mevo_up.png",
      alt: "The MEVO and P.A. Projects showroom and office lit at dusk, its glazed corner facade glowing against a deep blue sky",
    },
    {
      src: "/pexels-aniket-suryawanshi-480804303-32649853.jpg",
      alt: "Contemporary facade seen from below against the sky",
    },
  ],
  /**
   * The same showroom as images[0], cut out of its sky.
   *
   * Used only by /our-profile, where the design lays the building over a light
   * ground and a blue bar rather than using it as a full-bleed backdrop — so it
   * has to be a cut-out, and the alpha is the whole point of the file. Exported
   * from Figma (node 123:113, "pa mevo_isolated 1"); about a fifth of the
   * canvas is transparent sky.
   *
   * Kept beside `images` rather than replacing images[0]: the home page still
   * wants the uncut photograph behind its pinned frame, where a transparent sky
   * would show the section's own ground through it.
   */
  isolated: {
    src: "/pa-mevo-isolated.png",
    alt: "The MEVO and P.A. Projects showroom and office lit at dusk, cut out against the page",
    width: 2115,
    height: 1712,
  },
  /**
   * The client's copy said "over 30 years of proven expertise" one sentence
   * after "Established in 2004", while STATS below counts 20 years and its
   * standfirst dates the extrusion business to 2004 — three different ages for
   * one company, all visible within a single scroll.
   *
   * Resolved toward the two claims that agree and are checkable: 2004, and the
   * 2006 Bursa listing. "Over two decades" is true of both and contradicts
   * neither. If the 30-year figure is real it almost certainly belongs to the
   * founders rather than the company, and needs saying that way — flagged for
   * the client rather than guessed at here.
   */
  /**
   * THREE PARAGRAPHS FOR TWO CHAPTERS, which the two consumers read
   * differently and neither of them by counting.
   *
   * [0] and [1] are the Group's history, split where /our-profile's lead
   * stacks it in two brand bars. [2] and [3] are the MEVO partnership, split
   * the same way for that chapter's two glass panels.
   *
   * So it is FOUR paragraphs across TWO chapters, two apiece, and no consumer
   * may assume that by counting. The home page's pinned swap is still two
   * paragraphs against two photographs and reads [0] and [2] by name - the
   * opening of each chapter. Taking the first two would put both halves of the
   * history in the band and drop the partnership entirely; taking the last two
   * would lose the opening. Both failures are silent, which is why the indices
   * are named in CHAPTER_ONE / CHAPTER_TWO in Background.tsx and never spelled
   * as literals at a call site.
   */
  paragraphs: [
    "Established in 2004 and listed on the Main Market of Bursa Malaysia in 2006; P.A. Resources Berhad (P.A. Group) is a leading Malaysian company in aluminium architectural and industrial applications. With over two decades of proven expertise, the Group has grown from a specialised aluminium extruder into a vertically integrated industrial group.",
    "Our operations encompass billet smelting, tool and die design, precision extrusion, surface treatment, and solar energy solutions. Headquartered in Kuala Selangor, P.A. Group is widely recognised across the region for its quality, leadership, and expertise in the aluminium industry.",
    /* [2] and [3] rewritten from the client's copy to tell the partnership
       from the Malaysian side: the site is PA Projects', and MEVO is named as
       the partner it is. MEVO's own operations in China (two centres, East and
       South China) came out; what MEVO makes, energy-saving and low-carbon
       systems, stayed, because that is what the reader is buying. */
    "P.A. Group has also formed an in-depth strategic partnership with MEVO Doors & Windows, a renowned window and door brand and our key overseas supplier of energy-saving, low-carbon window and door systems.",
    "Through PA Projects, those systems are brought to Malaysia: supplied, installed and serviced by our own team from our Shah Alam showroom, from the first consultation to long after handover.",
  ],
};

/** The Chinese panel copy is the client's own, not a translation of the two
    English paragraphs above: it makes the brand case rather than reciting the
    corporate history. Same two steps, so the pinned swap is unchanged. */
export const BACKGROUND_ZH: Partial<typeof BACKGROUND> = {
  heading: "我们的故事",
  /**
   * SPLIT AT ITS OWN SENTENCE, not at the English one.
   *
   * The Chinese [0] is not a translation of the English [0]: it is MEVO
   * Malaysia's philosophy where the English is the P.A. Group's history, and it
   * carries none of the operations or headquarters copy the English second bar
   * prints. So there was nothing here to split at the same place, and writing
   * it would have meant inventing Chinese claims about smelting, extrusion and
   * a head office that no one has approved.
   *
   * What it does instead is give the two bars this language's own two
   * sentences, split where the copy already turns - the belief, then what
   * follows from it. Same composition on every locale, no new assertions.
   *
   * FLAGGED FOR THE CLIENT: the Chinese lead is about a different subject from
   * the English and Malay ones. That predates this change, and it is a content
   * decision rather than a layout one.
   */
  paragraphs: [
    "在 MEVO 马来西亚，我们坚信门窗不仅仅是建筑构件——它们塑造着人们的生活、工作以及体验环境的方式。",
    "作为 MEVO 优质系统的独家总经销商和战略合作伙伴，我们提供集美观、舒适、耐用、节能和长期价值于一体的综合解决方案。",
    "结合先进的工程技术、现代建筑美学与可靠的性能。",
    "MEVO 通过专为现代生活方式设计的创新门窗和建筑解决方案，打造舒适、节能且时尚的居住空间。",
  ],
};

/**
 * The same section in Malay — and a translation of the ENGLISH paragraphs, not
 * of the Chinese ones. The two are different copy: the Chinese panel is the
 * client's own brand pitch, the English is the corporate history. The history
 * is the checkable one, so it is what the third language carries.
 */
export const BACKGROUND_BM: Partial<typeof BACKGROUND> = {
  heading: "Kisah Kami",
  paragraphs: [
    "Ditubuhkan pada 2004 dan tersenarai di Pasaran Utama Bursa Malaysia pada 2006; P.A. Resources Berhad (P.A. Group) ialah sebuah syarikat Malaysia yang terkemuka dalam aplikasi aluminium seni bina dan perindustrian. Dengan lebih dua dekad kepakaran yang terbukti, Kumpulan ini telah berkembang daripada pengeluar ekstrusi aluminium khusus kepada sebuah kumpulan perindustrian bersepadu menegak.",
    "Operasi kami merangkumi peleburan bilet, reka bentuk alat dan acuan, ekstrusi berpresisi, rawatan permukaan dan penyelesaian tenaga solar. Beribu pejabat di Kuala Selangor, P.A. Group diiktiraf secara meluas di rantau ini kerana kualiti, kepimpinan dan kepakarannya dalam industri aluminium.",
    "P.A. Group juga telah menjalin kerjasama strategik yang mendalam dengan MEVO Doors & Windows, jenama tingkap dan pintu yang terkenal dan pembekal luar negara utama kami bagi sistem tingkap dan pintu yang jimat tenaga dan rendah karbon.",
    "Melalui PA Projects, sistem-sistem ini dibawa ke Malaysia: dibekalkan, dipasang dan diselenggara oleh pasukan kami sendiri dari bilik pameran kami di Shah Alam, dari konsultasi pertama hingga lama selepas serahan.",
  ],
};

/**
 * The home page's testimonials: Google reviews on a row of sliding cards,
 * under the section title, with a link to the listing. See Testimonials.
 *
 * PLACEHOLDERS, EVERY REVIEW. To be replaced with real reviews
 * pulled from the PA Projects Google listing:
 *   - `text` exactly as the customer wrote it, never edited or tidied;
 *   - `name` as Google shows it;
 *   - `stars` and `when` as Google shows them ("2 months ago");
 *   - `href`, the listing's own reviews link.
 * Pick reviews that name something specific (the system, the install,
 * after-sales, the showroom), of roughly similar length: the cards in a row
 * share one height. Six to ten is the right number.
 *
 * The reviews are not translated: a quote is the customer's own words, in the
 * language they wrote it.
 */
export type Review = { name: string; stars: number; when: string; text: string };

export const TESTIMONIALS = {
  eyebrow: "Testimonials",
  heading: "What our customers say.",
  googleLink: "See all on Google",
  /** PLACEHOLDER: swap for the Google Business profile's review link. */
  href: "https://www.google.com/maps/search/?api=1&query=PA%20Projects%20Marketing%20Sdn%20Bhd%20Shah%20Alam",
  reviews: [
    { name: "Customer Name", stars: 5, when: "2 weeks ago", text: "Placeholder review. We replaced every window in our terrace house with their sliding systems. The team measured, quoted and installed within the month, and the house is noticeably quieter." },
    { name: "Customer Name", stars: 5, when: "1 month ago", text: "Placeholder review. Visited the Shah Alam showroom before deciding. Being able to open and close the actual doors made the choice easy." },
    { name: "Customer Name", stars: 5, when: "1 month ago", text: "Placeholder review. Installers were punctual and careful, covered the floors and cleaned up after themselves. The panoramic door looks great." },
    { name: "Customer Name", stars: 5, when: "2 months ago", text: "Placeholder review. Our living room used to be hot by the afternoon. Since the new glazing went in it stays cool, and the aircon runs less." },
    { name: "Customer Name", stars: 4, when: "3 months ago", text: "Placeholder review. Good quality profiles and hardware for the price. Delivery took a little longer than planned, but they kept us updated throughout." },
    { name: "Customer Name", stars: 5, when: "3 months ago", text: "Placeholder review. Had an issue with a handle after a year and after-sales came the next day to sort it out. That is why we would recommend them." },
    { name: "Customer Name", stars: 5, when: "4 months ago", text: "Placeholder review. No more leaks during heavy rain. The casement windows seal properly and close smoothly." },
    { name: "Customer Name", stars: 5, when: "5 months ago", text: "Placeholder review. Helpful sales team who explained the difference between each system honestly, without pushing the most expensive one." },
  ] as Review[],
};

export const TESTIMONIALS_ZH: Partial<typeof TESTIMONIALS> = {
  eyebrow: "客户评价",
  heading: "听听客户怎么说。",
  googleLink: "在 Google 查看全部",
};

export const TESTIMONIALS_BM: Partial<typeof TESTIMONIALS> = {
  eyebrow: "Testimoni",
  heading: "Kata pelanggan kami.",
  googleLink: "Lihat semua di Google",
};

/**
 * The product band on the home page: six panes of glass over one photograph,
 * a product to a pane.
 *
 * There is no visible heading by design — the band is a field of product names
 * and nothing else — so `heading` is rendered for screen readers only. Without
 * it the section is an unnamed landmark holding six bare links.
 *
 * `href` is copy rather than a route helper because the two languages do not
 * have the same pages behind it. English has a page per product at
 * /our-products/[slug]; Chinese has the catalogue at /zh/our-products and no
 * detail routes, so a Chinese reader is sent to the Chinese catalogue rather
 * than out of their own language into an English page. When
 * /zh/our-products/[slug] exists, this is the one line that changes.
 */
export const PRODUCT_GRID = {
  heading: "Our Products",
  /** Names each pane. The visible text is the product name alone, which reads
      as a heading rather than as a link; this says where it goes. */
  aria: (product: string) => `View ${product}`,
  /**
   * The catalogue, opened ON that product — not the product's own page.
   *
   * It was `/our-products/${slug}`, which is a real route and still is. The
   * difference is where it leaves the reader: a per-product page is a dead end
   * with one product on it, and someone who has just picked a pane out of a
   * grid of six is browsing rather than deciding. The fragment puts them in the
   * catalogue with that row open and the other nineteen underneath it.
   *
   * The slug is the row's `id`, so this is an ordinary anchor as far as the
   * browser is concerned, and `scroll-mt-28` on the row is what stops it
   * landing behind the header. See `productFromHash` in lib/products.ts.
   */
  href: (slug: string) => `/our-products#${slug}`,
};

export const PRODUCT_GRID_ZH: Partial<typeof PRODUCT_GRID> = {
  heading: "我们的产品",
  aria: (product: string) => `查看 ${product}`,
  /* Now takes the slug, where it used to throw it away. There are still no
     per-product routes in Chinese, but the catalogue is translated and the row
     is addressable in it, so a Chinese reader lands on the same product an
     English one does rather than at the top of the list. */
  href: (slug: string) => `/zh/our-products#${slug}`,
};

/** Same rule as the Chinese overlay: there are no /bm product pages, so a pane
    goes to the Malay catalogue — but to the row itself, not to the top of it. */
export const PRODUCT_GRID_BM: Partial<typeof PRODUCT_GRID> = {
  heading: "Produk Kami",
  aria: (product: string) => `Lihat ${product}`,
  href: (slug: string) => `/bm/our-products#${slug}`,
};

/**
 * The door collection band on the home page, under the product grid. Copy
 * supplied by the client; English only for now, so /zh and /bm show it in
 * English but link into their own catalogue.
 *
 * Three categories, shown as expanding panels — see DoorCollection.tsx.
 *
 * THE IMAGES ARE STAND-INS: the closest catalogue photograph for each category,
 * until the client supplies one per category. They should be portrait and lit
 * alike, since the three sit side by side.
 *
 * Every category links to the door half of the catalogue: the catalogue filters
 * by system (window / door) and nothing finer, so there is no "interior doors
 * only" view to send a category to yet.
 */
/**
 * The home page's second section: five category panels, three door and two
 * window. The client's copy was for doors only; the two window panels, and
 * "door and window" in the title, description and closing line, are ours.
 *
 * `href` on a category is the English path its panel opens (the hero prefixes
 * it per locale); a category without one opens the section's own `href`. The
 * window panels open their product's row in the catalogue.
 */
export const DOOR_COLLECTION = {
  title: "Explore Our Door & Window Collection",
  subheading: "Different Styles. Endless Possibilities.",
  description:
    "Discover MEVO’s range of modern door and window systems, thoughtfully designed to complement every space with elegance, functionality, and style.",
  categories: [
    {
      name: "Modern Interior Doors",
      tagline: "Sleek Design. Timeless Elegance.",
      description:
        "Enhance your interior with modern door designs featuring clean lines, elegant finishes, and a sophisticated appearance.",
      image: "/products/14.jpg",
      alt: "Black-panelled room with a slim black-framed interior door with an arched glass grille",
    },
    {
      name: "Luxury Double Doors",
      tagline: "A Grand Entrance. A Lasting Impression.",
      description:
        "Make a statement with beautifully crafted double doors that bring a bold, luxurious touch to residential and commercial spaces.",
      image: "/products/17.jpg",
      alt: "Dark double entry door with a bronze medallion handle under a columned porch",
    },
    {
      name: "Glass Interior Doors",
      tagline: "Modern Simplicity. Beautiful Spaces.",
      description:
        "Create bright, stylish interiors with elegant glass door designs that balance privacy, natural light, and contemporary aesthetics.",
      image: "/products/13.jpg",
      alt: "Black-framed arched French sliding doors in reeded glass closing off a kitchen",
    },
    {
      name: "Casement Windows",
      tagline: "Open Wide. Seal Tight.",
      description:
        "Thermally broken casement windows that swing fully open for fresh air, and close onto an unbroken perimeter seal that keeps out heat, rain and noise.",
      image: "/products/01.jpg",
      alt: "Living room with a tall dark-framed casement window opening onto a misty pine forest",
      href: "/our-products#dm106-casement-window",
    },
    {
      name: "Sliding Windows",
      tagline: "Slim Lines. Smooth Glide.",
      description:
        "Space-saving sliding windows with slim sightlines and a quiet, smooth glide, secured by a double-hook lock with child lock and ready for an insect screen.",
      image: "/products/04.jpg",
      alt: "Pale living room with a wide sliding window, half of it covered by an insect screen, looking onto a forested hillside",
      href: "/our-products#dm132-sliding-window",
    },
  ] as {
    name: string;
    tagline: string;
    description: string;
    image: string;
    alt: string;
    href?: string;
  }[],
  explore: "Explore",
  ctaHeading: "Find the Perfect Door or Window for Your Space",
  ctaBody:
    "From modern simplicity to luxurious statement designs, explore door and window solutions that reflect your style.",
  ctaButton: "View All Products",
  /** The door panels' link. The closing button opens the whole catalogue. */
  href: "/our-products#door",
  allHref: "/our-products",
};

export const DOOR_COLLECTION_ZH: Partial<typeof DOOR_COLLECTION> = {
  href: "/zh/our-products#door",
  allHref: "/zh/our-products",
};

export const DOOR_COLLECTION_BM: Partial<typeof DOOR_COLLECTION> = {
  href: "/bm/our-products#door",
  allHref: "/bm/our-products",
};

/**
 * The ten Core USPs' media and one-line notes, for CoreUspsPanel on
 * /services. PARALLEL BY INDEX to WHY_CHOOSE.parts[1].items: the first entry
 * belongs to the first USP, so the two lists move together or not at all.
 *
 * MEDIA ARE PLACEHOLDERS: the closest pictures already in the site's library.
 * Each is to be replaced by a short, silent, landscape clip (4-8s, slow
 * movement, no text in frame) or a photograph, shot or chosen for that USP.
 * Give an entry a `video` (an .mp4 in /public) and it plays, with `image` as
 * its poster; without one the image is shown.
 *
 * The notes restate claims the site makes elsewhere (the performance grades,
 * the hardware, the warranty, the EPP plan, the install team); none is new.
 */
export type UspMedia = { image: string; alt: string; video?: string };

export const CORE_USP_MEDIA: UspMedia[] = [
  { image: "/engineering/acoustic.jpg", alt: "A quiet, softly lit living room beside a large glazed door" },
  { image: "/engineering/thermal.jpg", alt: "Glazed office towers at dusk seen from above, their windows lit" },
  { image: "/products/05-2.jpg", alt: "Cutaway of a thermally broken aluminium profile, its insulation strip and seals" },
  { image: "/engineering/water-3.jpg", alt: "Heavy rain running in sheets down a pane of glass" },
  { image: "/products/15.jpg", alt: "Sunlight through full-height sliding doors onto a pale living room" },
  { image: "/products/18.jpg", alt: "A dark aluminium entry door set into a white facade" },
  { image: "/products/05-1.jpg", alt: "A slimline panoramic sliding door framing a lake and mountains" },
  { image: "/products/12.jpg", alt: "A living room opening onto a forest through full-height sliding doors" },
  { image: "/products/06.jpg", alt: "A bright bathroom with a freestanding tub beside floor-to-ceiling glass" },
  { image: "/services/04.jpg", alt: "An installer fixing a window frame in place with a cordless drill" },
];

export const CORE_USP_NOTES = [
  "Profiles and glazing tested to cut outside noise by up to 43dB, so a busy road stays outside.",
  "Thermally broken frames graded Level 8 (1.5 W/m²K) keep the afternoon heat out of the room.",
  "Less heat coming in means less work for the air-conditioning, month after month.",
  "Seals tested to Level 6 hold back driving rain at up to 700 Pa.",
  "Glazing that filters UV, helping protect floors, fabrics and furniture from fading.",
  "German Roto hardware and HOPPE handles, with locking built for a secure home.",
  "Slim sightlines down to a 15mm interlock, in clean finishes for modern homes.",
  "Up to 15 years of product warranty, with lifetime maintenance behind it.",
  "Spread the cost with a 0% interest easy payment plan.",
  "Our own team measures, installs and services every system, long after handover.",
];

export const CORE_USP_NOTES_ZH = [
  "型材与玻璃经测试可降低外部噪音高达 43dB，让车流声留在窗外。",
  "Level 8（1.5 W/m²K）断桥隔热窗框，把午后的热气挡在室外。",
  "进入室内的热量更少，空调负担更轻，月月如此。",
  "密封性能经测试达 Level 6，可抵御高达 700 Pa 的风雨。",
  "可过滤紫外线的玻璃，帮助保护地板、布艺与家具不褪色。",
  "德国 Roto 五金与 HOPPE 把手，锁闭系统为居家安全而设计。",
  "细至 15mm 的纤细勾企，配以简洁饰面，契合现代住宅。",
  "长达 15 年的产品保固，并享终身维护。",
  "0% 利息分期付款计划，轻松分摊费用。",
  "我们自己的团队负责测量、安装与维护每一套系统，交付之后依然在。",
];

export const CORE_USP_NOTES_BM = [
  "Profil dan kaca diuji untuk mengurangkan bunyi luar sehingga 43dB, supaya bunyi jalan raya kekal di luar.",
  "Bingkai penebat haba Level 8 (1.5 W/m²K) menghalang haba petang daripada masuk ke dalam bilik.",
  "Kurang haba masuk bermakna penghawa dingin kurang bekerja, bulan demi bulan.",
  "Kedap diuji pada Level 6, menahan hujan lebat sehingga 700 Pa.",
  "Kaca yang menapis UV, membantu melindungi lantai, fabrik dan perabot daripada pudar.",
  "Perkakasan Roto Jerman dan pemegang HOPPE, dengan sistem kunci untuk rumah yang selamat.",
  "Garis pandangan nipis sehingga interlock 15mm, dengan kemasan bersih untuk rumah moden.",
  "Waranti produk sehingga 15 tahun, disokong penyelenggaraan sepanjang hayat.",
  "Bahagikan kos dengan pelan bayaran mudah faedah 0%.",
  "Pasukan kami sendiri mengukur, memasang dan menyelenggara setiap sistem, lama selepas serahan.",
];

/**
 * Why Choose PA Projects. Copy supplied by the client; the company name was
 * "MEVO Malaysia" and is PA Projects now, the Malaysian company the site is for.
 * One background photograph; the panel advances through three parts.
 * No heading by design.
 */
export const WHY_CHOOSE = {
  image: {
    src: "/pexels-adrien-olichon-1257089-3319219.jpg",
    alt: "Glazed roof canopy seen from below, a grid of glass panels against the sky",
  },
  parts: [
    {
      title: "Why Choose PA Projects",
      items: [
        "First Local Manufacturer & Seller of MEVO Systems",
        "Trusted & Reliable After-Sales Services",
        "Try before You Buy",
        "Up to 15 Years Warranty",
      ],
    },
    {
      /** Exactly ten items, matching the nav entry of the same name. */
      title: "Our 10 Core USPs",
      items: [
        "Silent Living Lifestyle (Sound Reduction 43dB)",
        "Heat Reduction Lifestyle (Level 8, 1.5 W/m²K)",
        "Energy Efficiency",
        "Superior Water Tightness (Level 6, ≥700 Pa)",
        "UV Protection Technology",
        "Superior Safety Performance",
        "Innovation & Modern Design",
        "Premium Quality with Up to 15-Year Warranty",
        "Affordable with 0% Interest EPP payment plan",
        "Professional MEVO Installation Team & After-Sales Service",
      ],
    },
    /* The client's benefit names are the card titles; the test grades they
       rest on are each card's description (`bodies`, parallel to `items`).
       Air and water share a card, as the client lists them, so there are
       five. */
    {
      title: "5 Engineering Performance Highlights",
      items: [
        "Sound Reduction",
        "Heat Reduction",
        "Air & Water Tightness",
        "Safety & Security",
        "Wind Resistance",
      ],
      bodies: [
        ["Acoustic Insulation Level 5 (Sound Reduction 43dB)"],
        ["Thermal Insulation Level 8 (1.5 W/m²K, CRF ≥75)"],
        ["Air Tightness Level 8 (-67% to 96% Airflow Leakage)", "Water Tightness Level 6 (≥700 Pa)"],
        ["Superior German Hardware System: German Roto Hardware System, HOPPE Handle, TECTUS / TPEO Transmission Rod System"],
        ["Wind Resistance Level 9 (≥5000 Pa = 500 kgf/m²)"],
      ],
    },
  ],
  tagline: [
    "Our commitment is simple:",
    "Innovation Meets Performance. Premium Living Made Affordable.",
  ],
  /**
   * Copy that exists only for the home page's WhyMevo band, where each of the
   * four claims in `parts[0]` is given a card of its own and a card needs more
   * than a title on it.
   *
   * NOTHING HERE IS A NEW CLAIM. Every line restates something the site already
   * says somewhere else, and the source is named against each one, because a
   * sentence on the home page about warranty terms or where the metal is
   * extruded is a statement about the business and not a piece of layout:
   *
   *   lede      VISION.banner.lede and VISION.blocks[1].body
   *   notes[0]  SEO.story.description - founded 2004, listed on Bursa
   *             Malaysia 2006, an aluminium extruder
   *   notes[1]  VISION.blocks[1].body and SERVICES.items[4].body
   *   notes[2]  SEO.contact.description - the Shah Alam showroom
   *   notes[3]  VISION.blocks[0].body - 15-year warranty, lifetime maintenance
   *
   * `notes` is parallel to `parts[0].items` and is read by index, so the two
   * lists have to stay the same length and the same order.
   */
  home: {
    lede: "Premium window and door systems that more people in Malaysia can actually own - designed, supplied, installed and serviced by one local team.",
    notes: [
      "Extruded, supplied and backed here: P.A. Group has been an aluminium extruder in Malaysia since 2004, and listed on Bursa Malaysia since 2006.",
      "Delivery, installation and maintenance are handled locally, by the same team that supplied the system.",
      "See the systems working at our Shah Alam showroom - open them, close them, handle the profile before you decide.",
      "Up to fifteen years of product warranty, with lifetime maintenance behind it.",
    ],
  },
};

/** All three parts and the closing commitment. The performance grades keep
    their English level names and SI units - "Level 8", "1.5W/m²K", "43dB" -
    because those are the standard's own notation and are read as figures rather
    than as words. The photograph and its alt text stay English; see the note on
    HERO_ZH. */
export const WHY_CHOOSE_ZH: Partial<typeof WHY_CHOOSE> = {
  parts: [
    {
      title: "为什么选择 PA Projects",
      items: [
        "本地首家制造商与销售商",
        "值得信赖、可靠的售后服务",
        "先试后买",
        "长达 15 年保固",
      ],
    },
    {
      title: "我们的 10 大核心优势",
      items: [
        "静享生活体验（隔音效果高达 43dB）",
        "清凉舒适生活（隔热性能达 Level 8，1.5W/m²K）",
        "高效节能",
        "卓越水密性能（Level 6，≥700 Pa）",
        "UV 防护科技",
        "卓越安全性能",
        "创新现代设计",
        "卓越品质，最高享有 15 年保固",
        "价格亲民，提供 0% 利息 EPP 分期付款计划",
        "专业 MEVO 安装团队与完善售后服务",
      ],
    },
    {
      title: "5 大工程性能亮点",
      items: ["隔音降噪", "隔热降温", "气密与水密", "安全防护", "抗风压"],
      bodies: [
        ["隔音性能 Level 5（降噪达 43dB）"],
        ["隔热性能 Level 8（1.5 W/m²K，CRF ≥75）"],
        ["气密性能 Level 8（空气渗漏减少 67% 至 96%）", "水密性能 Level 6（≥700 Pa）"],
        ["卓越德国五金系统：德国 Roto 五金系统、HOPPE 把手、TECTUS / TPEO 传动杆系统"],
        ["抗风压性能 Level 9（≥5000 Pa = 500 kgf/m²）"],
      ],
    },
  ],
  tagline: ["我们的承诺很简单：", "创新与性能交融。尊贵生活，触手可及。"],
  /** The home page's card copy. Translated here rather than left to fall
      through, because these four lines carry the concrete facts on the band -
      the founding year, the listing, the showroom, the warranty term - and a
      Chinese reader landing on an English paragraph under a Chinese heading
      would be reading the one part of the section that is not decoration.
      NEEDS THE CLIENT'S SIGN-OFF: see the note on WHY_CHOOSE.home. */
  home: {
    lede: "让更多马来西亚人真正拥有得起的优质门窗系统 —— 由同一支本地团队负责设计、供应、安装与售后。",
    notes: [
      "在本地挤压、供应与承担：P.A. Group 自 2004 年起在马来西亚从事铝材挤压，并于 2006 年在马来西亚证券交易所上市。",
      "交付、安装与维护均由本地负责，而且是供应该系统的同一支团队。",
      "到莎阿南展厅亲自试用 —— 开启、关闭、触摸型材，然后再做决定。",
      "最高十五年产品保固，并有终身维护作为支撑。",
    ],
  },
};

/**
 * All three parts and the closing commitment, in Malay.
 *
 * The performance grades keep their English level names and SI units — "Level
 * 8", "1.5 W/m²K", "43dB" — for the reason the Chinese overlay gives: that is
 * the standard's own notation, and it is read as a figure rather than as a
 * word. "Level" specifically is left alone rather than rendered "Tahap",
 * because it names a grade in a test standard, not a quantity.
 */
export const WHY_CHOOSE_BM: Partial<typeof WHY_CHOOSE> = {
  parts: [
    {
      title: "Mengapa Pilih PA Projects",
      items: [
        "Pengeluar & Penjual Tempatan Pertama Sistem MEVO",
        "Perkhidmatan Selepas Jualan yang Dipercayai & Boleh Diharap",
        "Cuba Sebelum Anda Beli",
        "Waranti Sehingga 15 Tahun",
      ],
    },
    {
      title: "10 USP Teras Kami",
      items: [
        "Gaya Hidup Senyap (Pengurangan Bunyi 43dB)",
        "Gaya Hidup Kurang Haba (Level 8, 1.5 W/m²K)",
        "Kecekapan Tenaga",
        "Kalis Air Unggul (Level 6, ≥700 Pa)",
        "Teknologi Perlindungan UV",
        "Prestasi Keselamatan Unggul",
        "Inovasi & Reka Bentuk Moden",
        "Kualiti Premium dengan Waranti Sehingga 15 Tahun",
        "Mampu Milik dengan Pelan Bayaran EPP Faedah 0%",
        "Pasukan Pemasangan MEVO Profesional & Perkhidmatan Selepas Jualan",
      ],
    },
    {
      title: "5 Sorotan Prestasi Kejuruteraan",
      items: [
        "Pengurangan Bunyi",
        "Pengurangan Haba",
        "Kalis Udara & Air",
        "Keselamatan & Sekuriti",
        "Rintangan Angin",
      ],
      bodies: [
        ["Penebat Akustik Level 5 (Pengurangan Bunyi 43dB)"],
        ["Penebat Haba Level 8 (1.5 W/m²K, CRF ≥75)"],
        ["Kalis Udara Level 8 (Kebocoran Aliran Udara -67% hingga 96%)", "Kalis Air Level 6 (≥700 Pa)"],
        ["Sistem Perkakasan Jerman Unggul: Sistem Perkakasan Roto Jerman, Pemegang HOPPE, Sistem Rod Transmisi TECTUS / TPEO"],
        ["Rintangan Angin Level 9 (≥5000 Pa = 500 kgf/m²)"],
      ],
    },
  ],
  tagline: [
    "Komitmen kami mudah:",
    "Inovasi Bertemu Prestasi. Kehidupan Premium yang Mampu Milik.",
  ],
  /** The home page's card copy, in Malay. Same reason as the Chinese overlay:
      these four lines carry the concrete facts on the band and are the last
      place on it that should fall through to English.
      NEEDS A NATIVE-SPEAKER REVIEW, along with the rest of the Malay on this
      site - see the note on WHY_CHOOSE.home for what each line restates. */
  home: {
    lede: "Sistem tingkap dan pintu premium yang lebih ramai rakyat Malaysia mampu miliki - direka, dibekal, dipasang dan diselenggara oleh satu pasukan tempatan.",
    notes: [
      "Diekstrud, dibekal dan disokong di sini: P.A. Group ialah pengekstrud aluminium di Malaysia sejak 2004, dan tersenarai di Bursa Malaysia sejak 2006.",
      "Penghantaran, pemasangan dan penyelenggaraan dikendalikan secara tempatan, oleh pasukan yang sama yang membekalkan sistem tersebut.",
      "Lihat sistem berfungsi di bilik pameran kami di Shah Alam - buka, tutup dan pegang profilnya sebelum anda membuat keputusan.",
      "Jaminan produk sehingga lima belas tahun, disokong penyelenggaraan sepanjang hayat.",
    ],
  },
};

/** Product shot that overlaps the stat band. Exported from the Figma layout,
    a cut-out on transparency so the rules behind it stay visible. */
export const STATS_IMAGE = {
  src: "/stats-extrusion.png",
  alt: "Cross-sections of extruded aluminium window and door profiles, stacked",
};

/** Heading and standfirst for the stat band. Supplied by the client rather
    than taken from the live site, which runs the figures with no copy.

    The heading is two lines because the layout draws it that way: the break
    after the comma is a design decision, not something to leave to wrapping. */
export const STATS_INTRO = {
  heading: ["Engineering Innovation,", "Proven Across Every Building Type"],
  body: "P.A. Group has been extruding aluminium since 2004, and our partnership with MEVO brought the window and door systems to match. That combination covers over 10,000 completed projects in Malaysia, ranging from single residential units to full building facades, backed by a service team that stays involved after handover.",
};

/**
 * The four figures the band carries, in the order they are read.
 *
 * That order is the layout: the plan puts two across the upper row, middle and
 * right, then drops to the row beneath for the last two — left box first, then
 * middle, with the photograph filling the cell beside them. DOM order and
 * reading order are the same thing here on purpose, so the count-up runs the
 * way an eye does and a screen reader hears the figures in the order they
 * appear on the page. Moving a figure between boxes therefore means moving it
 * in this list as well; leaving it would put the count-up out of step with the
 * layout and read the plan out of order.
 *
 * WHY THERE ARE FOUR NOW. "Successful Projects" was the third figure in the
 * middle of the lower row and the left box was empty in both rows. It has moved
 * out to the left box of the LOWER row, and customer retention takes the middle
 * cell it left — so the lower row now reads across as projects, retention,
 * photograph, and the upper row carries the two that were always there.
 *
 * The retention figure is the client's own, and it has been in this file's
 * comments since the band was built: it was noted as a fourth figure with no
 * cell to put it in. There is a cell now.
 */
export const STATS = [
  {
    value: 20,
    suffix: "+",
    label: "Years of Experience",
    body: "Extruding aluminium since 2004, listed on Bursa Malaysia's Main Market since 2006.",
  },
  {
    value: 99,
    suffix: "%",
    label: "Satisfied Clients",
    body: "Measured on delivered performance, not promises: sound, heat, water and wind tested.",
  },
  {
    value: 10,
    suffix: "k+",
    label: "Successful Projects",
    body: "Residential units, commercial buildings and high-rise facades completed across Malaysia.",
  },
  {
    value: 3800,
    /* A no-break space, not a plain one: the figure and its unit are flex
       items, and a flex item's leading space is dropped. */
    suffix: " MT",
    /* Replaced Customer Retention (98%), which said much what Satisfied
       Clients beside it says. This is P.A. Group's own, Malaysian figure, from
       the company catalogue (p. 3): 11 automated extrusion lines, 4 to 8 inch,
       with a monthly capacity of 3,800 metric tonnes. */
    label: "Extruded Monthly",
    body: "Aluminium profile from P.A. Group's 11 automated extrusion lines in Malaysia.",
  },
];

/** The heading keeps its two-line break: the comma is where the layout draws
    the line, in either language. The standfirst is the same claim, not a
    literal rendering - Chinese marketing copy carries "小至...大至" where the
    English runs "ranging from...to". */
export const STATS_INTRO_ZH: Partial<typeof STATS_INTRO> = {
  heading: ["工程创新，", "经各类建筑项目验证"],
  body: "P.A. Group 自 2004 年起从事铝型材挤压生产，与 MEVO 的合作则带来了与之匹配的门窗系统。这一组合已在马来西亚完成超过 10,000 个项目，小至单栋住宅，大至整幢建筑幕墙，并由一支在交付后仍持续跟进的服务团队提供支持。",
};

/** Label and supporting line only, in the same order as STATS. `value` and
    `suffix` are carried over from STATS rather than repeated: the figures are
    the same figures, and the counter in Stats.tsx animates to them in either
    language. Reordering STATS means reordering this too - it is merged by
    index, so a mismatch swaps labels silently rather than failing. "10k+" is left as
    it is - "1万+" would be the idiomatic form, but it would mean counting to 1,
    and a figure that ticks 0 to 1 reads as broken rather than as a count. */
const STATS_TEXT_ZH = [
  {
    label: "年行业经验",
    body: "自 2004 年起从事铝型材挤压生产，2006 年于马来西亚交易所主板上市。",
  },
  {
    label: "客户满意度",
    body: "以交付的实际性能衡量，而非口头承诺：隔音、隔热、水密与抗风均经测试验证。",
  },
  {
    label: "成功项目",
    body: "已在马来西亚完成住宅单位、商业建筑与高层幕墙工程。",
  },
  {
    label: "月挤压产能",
    body: "P.A. Group 在马来西亚的 11 条自动化挤压生产线所产铝型材。",
  },
];

/** A whole replacement array rather than a partial overlay: STATS is a bare
    array, so there is no key for `useCopy` to merge on. Stats.tsx picks between
    the two on the locale directly. */
export const STATS_ZH: typeof STATS = STATS.map((stat, i) => ({
  ...stat,
  ...STATS_TEXT_ZH[i],
}));

/** The heading keeps its two-line break: the comma is where the layout draws
    the line, in every language. */
export const STATS_INTRO_BM: Partial<typeof STATS_INTRO> = {
  heading: ["Inovasi Kejuruteraan,", "Terbukti Merentas Setiap Jenis Bangunan"],
  body: "P.A. Group telah mengekstrusi aluminium sejak 2004, dan kerjasama kami dengan MEVO membawa sistem tingkap dan pintu yang setanding. Gabungan itu merangkumi lebih 10,000 projek siap di Malaysia, daripada unit kediaman tunggal hinggalah fasad bangunan penuh, disokong oleh pasukan perkhidmatan yang terus terlibat selepas serahan.",
};

/** Label and supporting line only, in the same order as STATS; `value` and
    `suffix` carry over from STATS, so the counter animates to the same figures
    in every language. Merged by index, so this list and STATS have to stay in
    step - see the note on STATS_TEXT_ZH. */
const STATS_TEXT_BM = [
  {
    label: "Tahun Pengalaman",
    body: "Mengekstrusi aluminium sejak 2004, tersenarai di Pasaran Utama Bursa Malaysia sejak 2006.",
  },
  {
    label: "Pelanggan Berpuas Hati",
    body: "Diukur pada prestasi yang disampaikan, bukan janji: bunyi, haba, air dan angin semuanya diuji.",
  },
  {
    label: "Projek Berjaya",
    body: "Unit kediaman, bangunan komersial dan fasad bangunan tinggi disiapkan di seluruh Malaysia.",
  },
  {
    label: "Kapasiti Penyemperitan Bulanan",
    body: "Profil aluminium daripada 11 barisan penyemperitan automatik P.A. Group di Malaysia.",
  },
];

export const STATS_BM: typeof STATS = STATS.map((stat, i) => ({
  ...stat,
  ...STATS_TEXT_BM[i],
}));

/** Was "To Get More Details", which is not idiomatic and read as a sentence
    fragment where /contact uses it as an <h2>. */

/**
 * Vision and mission, shown as the closing section of the profile page.
 *
 * The client supplied both statements. They are transcribed here with four
 * small corrections, all of them mechanical rather than editorial, and all
 * worth having confirmed:
 *
 *   "15-years product warranty"  ->  "15-year product warranty"
 *   "door and window system"     ->  "door and window systems" (plural subject)
 *   "Localized"                  ->  "Localised", which is the spelling the
 *                                    rest of this file uses ("specialised",
 *                                    "recognised") and the one Malaysian
 *                                    English takes
 *   an em dash before "backed by", because the original ran two clauses
 *   together without punctuation
 *
 * Nothing was added. The warranty term, the lifetime maintenance and the three
 * services named in the mission are the client's own claims, and this page is
 * the only place on the site that makes them — if any of them is wrong it is
 * wrong in public, so they want checking before launch rather than after.
 *
 * The photography is chosen rather than decorative: the lattice is the
 * aspiration the vision describes, and the profile in the hands is the thing
 * the mission is about delivering and servicing. Both were already in the repo
 * and unused.
 */
export const VISION = {
  banner: {
    heading: "Vision & Mission",
    lede: "Premium window and door systems that more people in Malaysia can actually own — and the local service that keeps them working long after handover.",
  },
  blocks: [
    {
      label: "Vision",
      body: "To redefine premium living in Malaysia by making high-end quality accessible to more people at an affordable price — backed by up to 15 years of product warranty and lifetime maintenance.",
      image: {
        src: "/pexels-masoodaslami-29585706.jpg",
        alt: "The white structural lattice of a contemporary building, seen from below against the sky",
      },
    },
    {
      label: "Mission",
      body: "Localised services for delivery, installation and after-sales, to ensure the timely completion of quality door and window systems for your project in Malaysia.",
      image: {
        src: "/pexels-francesca-cinel-114872900-9729590.jpg",
        alt: "Two hands holding an aluminium window profile, the chambers of its section visible at the cut end",
      },
    },
  ],
};

/** Label and statement only. The photographs and their alt text carry over
    from VISION, which is the same rule BACKGROUND follows: the pictures are
    the same pictures in every language. */
const VISION_TEXT_ZH = [
  {
    label: "愿景",
    body: "重新定义马来西亚的优质生活 —— 以可负担的价格，让更多人享有高端品质，并以长达 15 年的产品保固与终身维护作为支撑。",
  },
  {
    label: "使命",
    body: "以本地化的配送、安装与售后服务，确保优质门窗系统在您马来西亚的项目中按时完成。",
  },
];

export const VISION_ZH: Partial<typeof VISION> = {
  banner: {
    heading: "愿景与使命",
    lede: "让更多马来西亚家庭真正负担得起的高端门窗系统 —— 以及交付之后依然在场的本地服务。",
  },
  blocks: VISION.blocks.map((block, i) => ({ ...block, ...VISION_TEXT_ZH[i] })),
};

/** Mine rather than the client's, like every other Malay string here, and
    wanting a native speaker's eye before it ships. */
const VISION_TEXT_BM = [
  {
    label: "Visi",
    body: "Mentakrif semula kehidupan premium di Malaysia dengan menjadikan kualiti tinggi mampu dimiliki lebih ramai orang pada harga berpatutan — disokong jaminan produk sehingga 15 tahun dan penyelenggaraan sepanjang hayat.",
  },
  {
    label: "Misi",
    body: "Perkhidmatan tempatan untuk penghantaran, pemasangan dan selepas jualan, bagi memastikan sistem pintu dan tingkap berkualiti disiapkan tepat pada masanya untuk projek anda di Malaysia.",
  },
];

export const VISION_BM: Partial<typeof VISION> = {
  banner: {
    heading: "Visi & Misi",
    lede: "Sistem tingkap dan pintu premium yang benar-benar mampu dimiliki lebih ramai rakyat Malaysia — dan perkhidmatan tempatan yang mengekalkannya lama selepas serahan.",
  },
  blocks: VISION.blocks.map((block, i) => ({ ...block, ...VISION_TEXT_BM[i] })),
};
/**
 * The second slide of the /contact hero (ContactHero): an invitation to the
 * Shah Alam showroom, its button opening the address in Google Maps.
 *
 * The address is FOOTER.address, short of its "(Showroom & Office)" tag. The
 * map link searches for that address rather than pointing at a place ID, so
 * it needs nothing from the client to work; swap in the showroom's own Maps
 * link when there is one, and the pin will carry the business name.
 *
 * The picture is the showroom and office at dusk, the one the home hero's
 * Our Profile slide uses.
 */
const SHOWROOM_ADDRESS =
  "19, Jalan 15/23, Taman Perindustrian Tiong Nam, Seksyen 15, 40200 Shah Alam, Selangor";

export const SHOWROOM_SLIDE = {
  eyebrow: "Visit Our Showroom",
  headline: "See it before you decide.",
  body: SHOWROOM_ADDRESS,
  cta: "Get Directions",
  href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `PA Projects, ${SHOWROOM_ADDRESS}, Malaysia`,
  )}`,
  image: "/pa mevo_up.png",
  alt: "The PA Projects showroom and office in Shah Alam, lit at dusk",
};

export const SHOWROOM_SLIDE_ZH: Partial<typeof SHOWROOM_SLIDE> = {
  eyebrow: "参观展厅",
  headline: "亲眼看过，再做决定。",
  cta: "获取路线",
};

/** The first slide of the /contact hero: the page's own. Its headline and
    lede are CONTACT.banner's, per locale; this is what that copy lacked. */
export const CONTACT_HERO = {
  eyebrow: "Contact Us",
  image: "/products/12.jpg",
  alt: "A living room opening onto a forest and mountains through a run of full-height aluminium sliding doors",
};

export const CONTACT_HERO_ZH: Partial<typeof CONTACT_HERO> = { eyebrow: "联系我们" };
export const CONTACT_HERO_BM: Partial<typeof CONTACT_HERO> = { eyebrow: "Hubungi Kami" };

export const SHOWROOM_SLIDE_BM: Partial<typeof SHOWROOM_SLIDE> = {
  eyebrow: "Kunjungi Bilik Pameran Kami",
  headline: "Lihat dahulu, baru memilih.",
  cta: "Dapatkan Arah",
};

/**
 * The opening of /our-profile: the home hero's layout, on one slide, at the
 * partial height every inner page's hero now takes. Its button glides down to
 * Our Story (#story).
 *
 * The image is the company e-catalogue's cover render - a slimline panoramic
 * slider opening a pavilion onto a courtyard - extracted from the PDF at its
 * full 2800x4624. It is a render of the product, not a photograph of a place,
 * which is why it is used here rather than the catalogue's HQ photograph (see
 * PROFILE_FIGURES on why that one is waiting).
 *
 * Malaysia first: the lines are about P.A. Group, the Malaysian company. ZH and
 * BM are ours, and want a native speaker's eye.
 */
export const PROFILE_HERO = {
  eyebrow: "Our Profile",
  headline: ["Malaysian aluminium,", "since 2004."],
  body: "PA Projects is part of P.A. Group: an aluminium manufacturer in Malaysia since 2004, listed on Bursa Malaysia since 2006.",
  cta: "Our Story",
  image: "/profile-hero.jpg",
  alt: "A slimline panoramic sliding door opening a pavilion onto a courtyard pool, two people and a car beyond the glass",
};

export const PROFILE_HERO_ZH: Partial<typeof PROFILE_HERO> = {
  eyebrow: "公司简介",
  headline: ["马来西亚铝业，", "始于 2004 年。"],
  body: "PA Projects 隶属 P.A. Group：自 2004 年起在马来西亚从事铝材制造，并于 2006 年在马来西亚交易所上市。",
  cta: "我们的故事",
};

export const PROFILE_HERO_BM: Partial<typeof PROFILE_HERO> = {
  eyebrow: "Profil Kami",
  headline: ["Aluminium Malaysia,", "sejak 2004."],
  body: "PA Projects ialah sebahagian daripada P.A. Group: pengeluar aluminium di Malaysia sejak 2004, tersenarai di Bursa Malaysia sejak 2006.",
  cta: "Kisah Kami",
};

/**
 * The last section of /our-profile: the sales team, as an edge-to-edge grid of
 * portraits, each revealing the person's name, role and contact on
 * hover (or tap, on a touch screen).
 *
 * PLACEHOLDERS, ALL OF IT BELOW THE LEDE. The people are stand-ins until the
 * client sends, for each: name, role or area, a portrait (4:5, matched
 * background and crop across the team), and the
 * number to reach them on. Until a member has a `photo`, the card draws a
 * neutral silhouette; until they have their own `whatsapp`/`phone`, the
 * buttons fall back to the company's (WHATSAPP, FOOTER).

 */
export type SalesMember = {
  name: string;
  role: string;
  photo?: string;
  /** wa.me / api.whatsapp.com link; the company's when absent. */
  whatsapp?: string;
  /** tel: link; the company's when absent. */
  phone?: string;
};

export const SALES_TEAM = {
  eyebrow: "Our Sales Team",
  heading: "The people behind your project.",
  lede: "From the first site visit to the final fitting, you deal with the same team. Talk to us in English, Mandarin or Bahasa Malaysia.",
  whatsapp: "WhatsApp",
  call: "Call",
  members: [
    { name: "Team Member", role: "Sales Manager" },
    { name: "Team Member", role: "Sales Consultant, Residential" },
    { name: "Team Member", role: "Sales Consultant, Projects" },
    { name: "Team Member", role: "Showroom Consultant" },
  ] as SalesMember[],
};

export const SALES_TEAM_ZH: Partial<typeof SALES_TEAM> = {
  eyebrow: "销售团队",
  heading: "为您的项目把关的人。",
  lede: "从第一次现场勘察到最后的安装，始终由同一支团队为您服务。英语、华语或马来语，皆可沟通。",
  whatsapp: "WhatsApp",
  call: "致电",
};

export const SALES_TEAM_BM: Partial<typeof SALES_TEAM> = {
  eyebrow: "Pasukan Jualan Kami",
  heading: "Orang di sebalik projek anda.",
  lede: "Dari lawatan tapak pertama hingga pemasangan akhir, anda berurusan dengan pasukan yang sama. Bercakap dengan kami dalam bahasa Inggeris, Mandarin atau Bahasa Malaysia.",
  whatsapp: "WhatsApp",
  call: "Hubungi",
};

/**
 * The trust band on /our-profile, between Our Story and Vision & Mission: the
 * group behind PA Projects, in four figures a homeowner can weigh.
 *
 * Every figure is from the company e-catalogue (pp. 2-3) and is P.A. Group's
 * own, in Malaysia. The MEVO factory figures in the same pages (150,000 m2,
 * 500+ stores, 500,000 households) are left out: they are China's, and this
 * band is about the Malaysian side.
 *
 * ISO 9001:2015 IS NOT HERE, though it was planned. Its only source is the sign
 * in the catalogue's HQ photograph, and that photograph carries an AI-generator
 * watermark - so it waits for the client to confirm the certification.
 *
 * The labels are written for a buyer rather than an investor: what the figure
 * means for the window, not the furnace. ZH and BM are ours, and want a
 * native speaker's eye.
 */
export const PROFILE_FIGURES = {
  eyebrow: "The Group Behind PA Projects",
  heading: "A listed Malaysian manufacturer, behind every system.",
  lede: "PA Projects is backed by P.A. Group's own aluminium operations in Malaysia: smelting, extrusion and surface treatment, under one publicly listed group.",
  figures: [
    {
      value: "2006",
      label: "Listed on Bursa Malaysia",
      body: "On the Main Market since 2006, with accounts and governance open to public scrutiny.",
    },
    {
      value: "11",
      label: "Automated extrusion lines",
      body: "4- to 8-inch presses at P.A. Group's own plant, for precise, complex profiles.",
    },
    {
      value: "3,800 MT",
      label: "Extruded every month",
      body: "Finished in-house on two anodising lines, for weather resistance and a lasting surface.",
    },
    {
      value: "4,000 MT",
      label: "Billet smelted every month",
      body: "From our own furnaces, the composition checked by spectrometer before it is extruded.",
    },
  ],
};

export const PROFILE_FIGURES_ZH: Partial<typeof PROFILE_FIGURES> = {
  eyebrow: "PA Projects 背后的集团",
  heading: "一家上市的马来西亚制造商，支撑每一套系统。",
  lede: "PA Projects 背后是 P.A. Group 在马来西亚自有的铝业运营：熔铸、挤压与表面处理，同属一家上市集团。",
  figures: [
    { value: "2006", label: "马来西亚交易所上市", body: "自 2006 年起于主板上市，财务与治理接受公众监督。" },
    { value: "11", label: "条自动化挤压生产线", body: "P.A. Group 自有工厂的 4 至 8 英寸挤压机，精准生产复杂型材。" },
    { value: "3,800 MT", label: "每月挤压产能", body: "由两条阳极氧化生产线在厂内完成表面处理，耐候且持久。" },
    { value: "4,000 MT", label: "每月铝锭熔铸", body: "出自自有熔炉，挤压前以光谱仪检测成分。" },
  ],
};

export const PROFILE_FIGURES_BM: Partial<typeof PROFILE_FIGURES> = {
  eyebrow: "Kumpulan di Sebalik PA Projects",
  heading: "Pengeluar Malaysia yang tersenarai, di sebalik setiap sistem.",
  lede: "PA Projects disokong oleh operasi aluminium P.A. Group sendiri di Malaysia: peleburan, penyemperitan dan rawatan permukaan, di bawah satu kumpulan tersenarai awam.",
  figures: [
    { value: "2006", label: "Tersenarai di Bursa Malaysia", body: "Di Pasaran Utama sejak 2006, dengan akaun dan tadbir urus terbuka kepada penelitian awam." },
    { value: "11", label: "Barisan penyemperitan automatik", body: "Mesin 4 hingga 8 inci di kilang P.A. Group sendiri, untuk profil kompleks yang tepat." },
    { value: "3,800 MT", label: "Disemperit setiap bulan", body: "Disiapkan di kilang sendiri pada dua barisan anodisasi, untuk ketahanan cuaca dan permukaan yang tahan lama." },
    { value: "4,000 MT", label: "Bilet dilebur setiap bulan", body: "Daripada relau kami sendiri, komposisinya diperiksa dengan spektrometer sebelum disemperit." },
  ],
};



/**
 * /directors-profile.
 *
 * THE BANNER ONLY. There are no profiles here yet because none were supplied,
 * and a director's name, title or biography is not something to invent — it is
 * a statement about a real person, published under the company's name, and a
 * plausible-sounding placeholder is worse than an empty page because nobody
 * notices it is wrong.
 *
 * What the route does carry is real: the heading, a lede that claims nothing
 * beyond what /our-profile already establishes, its own metadata, its hreflang
 * set and its place in the sitemap. Adding the profiles is a `people` array
 * here and a block in DirectorsBody; nothing structural has to move.
 *
 * The slug keeps the WordPress spelling, `directors-profile`, because that is
 * the URL the old site published and the one links point at — see
 * lib/legacy-urls.ts, where the redirect now lands here instead of on the home
 * page.
 */
export const DIRECTORS = {
  banner: {
    heading: "Director's Profile",
    lede: "The leadership behind P.A. Resources Berhad and MEVO Malaysia, the group supplying aluminium window and door systems across the country.",
  },
};

export const DIRECTORS_ZH: Partial<typeof DIRECTORS> = {
  banner: {
    heading: "董事简介",
    lede: "P.A. Resources Berhad 与 MEVO 马来西亚背后的领导团队 —— 为全国供应铝合金门窗系统的集团。",
  },
};

/** Mine rather than the client's, like every other Malay string here. */
export const DIRECTORS_BM: Partial<typeof DIRECTORS> = {
  banner: {
    heading: "Profil Pengarah",
    lede: "Kepimpinan di sebalik P.A. Resources Berhad dan MEVO Malaysia, kumpulan yang membekalkan sistem tingkap dan pintu aluminium di seluruh negara.",
  },
};

export const CTA = "Speak to our team";
export const CTA_ZH = "联系我们的团队";
export const CTA_BM = "Hubungi pasukan kami";

/**
 * The enquiry band that closes every page.
 *
 * Mounted once in components/site/Shell.tsx, next to the header and the footer,
 * so it is one band on twenty-eight routes rather than a section pasted into
 * each of them. See components/site/EnquiryBand.tsx for the drawing it is set
 * inside, and for why it is absent on /contact.
 *
 * `heading` is TWO STRINGS, not one with a full stop in the middle, and the
 * component renders each as its own block. That is the whole line-break policy:
 * the band is a wide, shallow field with a drawing around the copy, and a
 * heading that wrapped to four lines on a laptop would burst the elevation it
 * sits in. Two lines, at every width, in every language, by construction —
 * STATS_INTRO takes the same approach for the same reason.
 *
 * `lede` is written to two lines and wants to stay there. It is not enforced
 * the way the heading is, because a paragraph broken by hand reads as a poem;
 * what holds it is length against the measure the component sets. Roughly 95
 * characters is two lines at that measure, 120 is three, and three is what the
 * band was made shorter to avoid. Translations should be checked against the
 * rendered band rather than against this number, since a Chinese line of the
 * same meaning is about half the characters.
 *
 * The tone is deliberately unbusinesslike. This is the last thing on the page,
 * read by someone who has already looked at the products and is deciding
 * whether writing in is going to be a whole procedure — so it asks for a photo
 * or a rough idea rather than for a specification, and says what happens next.
 *
 * No value that exists in FOOTER is repeated here. The WhatsApp link is read
 * from WHATSAPP by the component, the same rule /contact and /privacy follow,
 * so there is one number to change rather than four.
 */
export const ENQUIRY = {
  heading: ["Tell us about your project.", "We will take it from there."],
  lede: "Send a drawing, a photo, or just a rough idea — we will come back with the systems that suit it.",
  primary: "Send an enquiry",
  /** WHATSAPP.label is "Chat on WhatsApp", the same words the header uses. Held
      separately here so the translations have somewhere to go. */
  secondary: WHATSAPP.label,
  /** Set into the break in the dimension line above the elevation, where a
      drawing carries its title. */
  systemMark: "MEVO Aluminium Window and Door Systems",
};

/** The Chinese band. The heading keeps its two lines and its order — the
    invitation, then the reassurance. */
export const ENQUIRY_ZH: Partial<typeof ENQUIRY> = {
  heading: ["说说您在建的项目，", "剩下的交给我们。"],
  lede: "一张图纸、一张照片，哪怕只是一个初步想法 —— 我们都会回复适合的系统方案。",
  primary: "在线咨询",
  secondary: "WhatsApp 咨询",
  systemMark: "MEVO 铝合金系统",
};

/** The Malay band. Like every other Malay string on the site this is mine
    rather than the client's, and wants a native speaker's eye before it
    ships. */
export const ENQUIRY_BM: Partial<typeof ENQUIRY> = {
  heading: ["Beritahu kami projek anda.", "Kami uruskan selebihnya."],
  lede: "Hantar lukisan, gambar, atau sekadar idea kasar — kami akan kembali dengan sistem yang sesuai.",
  primary: "Hantar pertanyaan",
  secondary: "Hubungi di WhatsApp",
  systemMark: "Sistem Aluminium MEVO",
};

/**
 * The /contact page.
 *
 * Only the page's own copy lives here. The number, address and email are read
 * from FOOTER by the page itself, the same rule /privacy follows, so there is
 * one place to change a phone number rather than four.
 *
 * The form asks for as little as it can get away with: a name, one way to
 * reply, and what the enquiry is about. Every field beyond that is a reason
 * not to send it. `hint` is why the two contact fields are not both required —
 * it says so once, above the pair, rather than as an error after the fact.
 *
 * `errors` are written as instructions rather than diagnoses: "Tell us who to
 * reply to", not "Invalid input". `failed` deliberately offers the phone and
 * WhatsApp, because a failure here means the visitor cannot reach us the way
 * they chose and the page owes them another route.
 */
export const CONTACT = {
  banner: {
    heading: "Let's talk about your project",
    lede: "Windows and doors for a home, a development or a commercial facade. Tell us what you are building and we will come back with the systems that suit it.",
  },
  details: {
    heading: CTA,
    blurb:
      "Reach the team directly, or send the form and we will reply within one working day.",
    labels: {
      phone: "Phone",
      email: "Email",
      address: "Showroom & office",
      company: "Registered as",
    },
  },
  form: {
    heading: "Send an enquiry",
    hint: "A phone number or an email — whichever you would rather we use.",
    labels: {
      name: "Name",
      email: "Email",
      phone: "Phone",
      message: "What can we help with?",
    },
    placeholders: {
      message: "The project, the rooms or elevations involved, and any timeline you are working to.",
    },
    submit: "Send enquiry",
    submitting: "Sending",
    retry: "Try again",
    errors: {
      name: "Tell us who this is from.",
      contact: "Add a phone number or an email so we can reply.",
      email: "That email address does not look right.",
      phone: "That phone number does not look right.",
      message: "Tell us a little about the project.",
      failed:
        "That did not send. Please call 014 - 879 7371 or message us on WhatsApp, and we will pick it up from there.",
      rateLimited:
        "That is several enquiries in a short time. Please call 014 - 879 7371 if it is urgent.",
    },
    sent: {
      heading: "Enquiry sent",
      body: "We have it, and we will reply within one working day. If it is urgent, call 014 - 879 7371.",
      again: "Send another",
    },
    /** Read by a screen reader as the state changes; never shown. */
    status: {
      submitting: "Sending your enquiry.",
      sent: "Enquiry sent.",
      error: "Your enquiry could not be sent.",
    },
    /** The consent line under the button. The policy it names exists. */
    consent: "By sending this you agree to our",
    consentLink: "Privacy & Cookies Policy",
  },
};

/**
 * The contact page in Chinese.
 *
 * Complete, not partial — and it has to be. `useCopy` merges one level deep
 * (`{...en, ...zh}`), so supplying a half-filled `form` would replace the
 * English `form` wholesale and take its untranslated siblings down with it.
 * Every nested object below is therefore given in full.
 *
 * Written rather than transliterated. "Send an enquiry" is 发送咨询 because
 * 咨询 is what a Malaysian Chinese reader calls this kind of pre-sales
 * question; a literal 询问 reads as an interrogation. The error strings keep
 * the English originals' manner — instructions rather than diagnoses, so
 * "请告诉我们您的姓名。" rather than "无效输入".
 *
 * The phone number is left in its dialling form in every string. It is a
 * number, not a word, and the Latin digits are what a reader will key in.
 *
 * `consentLink` points at /privacy, which is English. That is a real seam and
 * it is the honest one: the policy genuinely has no Chinese version, so the
 * label is translated and the document it opens is not pretended to be.
 */
export const CONTACT_ZH: Partial<typeof CONTACT> = {
  banner: {
    heading: "谈谈您的项目",
    lede: "无论是住宅、发展项目还是商业幕墙的门窗需求，请告诉我们您正在建造什么，我们会为您配置合适的系统。",
  },
  details: {
    heading: CTA_ZH,
    blurb: "可直接联系我们的团队，或填写表格，我们将在一个工作日内回复。",
    labels: {
      phone: "电话",
      email: "电邮",
      address: "展厅与办公室",
      company: "注册公司名称",
    },
  },
  form: {
    heading: "发送咨询",
    hint: "留下电话或电邮皆可 —— 由您决定我们以哪种方式回复。",
    labels: {
      name: "姓名",
      email: "电邮",
      phone: "电话",
      message: "有什么可以帮到您？",
    },
    placeholders: {
      message: "项目概况、涉及的房间或立面，以及您的时间安排。",
    },
    submit: "发送咨询",
    submitting: "发送中",
    retry: "重试",
    errors: {
      name: "请告诉我们这封咨询来自谁。",
      contact: "请留下电话或电邮，以便我们回复。",
      email: "这个电邮地址似乎不正确。",
      phone: "这个电话号码似乎不正确。",
      message: "请简单说明一下您的项目。",
      failed:
        "发送失败。请致电 014 - 879 7371 或通过 WhatsApp 联系我们，我们会从那里继续跟进。",
      rateLimited:
        "短时间内收到多次咨询。如有急事，请致电 014 - 879 7371。",
    },
    sent: {
      heading: "咨询已发送",
      body: "我们已经收到，将在一个工作日内回复。如有急事，请致电 014 - 879 7371。",
      again: "再发一封",
    },
    status: {
      submitting: "正在发送您的咨询。",
      sent: "咨询已发送。",
      error: "您的咨询未能发送。",
    },
    consent: "发送即表示您同意我们的",
    consentLink: "隐私与 Cookie 政策",
  },
};

/**
 * The contact page in Malay.
 *
 * Complete rather than partial, and it has to be, for the reason CONTACT_ZH
 * gives: `useCopy` merges one level deep, so a half-filled `form` would replace
 * the English `form` wholesale and take its untranslated siblings with it.
 *
 * The errors keep the English originals' manner — instructions rather than
 * diagnoses. "Alamat e-mel itu nampak tidak betul." rather than "Input tidak
 * sah.", which is what a system says to itself.
 *
 * The phone number stays in its dialling form in every string: it is a number,
 * not a word, and the digits are what a reader will key in.
 *
 * `consentLink` points at /privacy, which is English. That is a real seam and
 * the honest one — the policy has no Malay version, so the label is translated
 * and the document it opens is not pretended to be.
 */
export const CONTACT_BM: Partial<typeof CONTACT> = {
  banner: {
    heading: "Mari bincangkan projek anda",
    lede: "Tingkap dan pintu untuk sebuah rumah, projek pembangunan atau fasad komersial. Beritahu kami apa yang sedang anda bina dan kami akan kembali dengan sistem yang sesuai.",
  },
  details: {
    heading: CTA_BM,
    blurb:
      "Hubungi pasukan kami terus, atau hantar borang dan kami akan membalas dalam satu hari bekerja.",
    labels: {
      phone: "Telefon",
      email: "E-mel",
      address: "Bilik pameran & pejabat",
      company: "Didaftarkan sebagai",
    },
  },
  form: {
    heading: "Hantar pertanyaan",
    hint: "Nombor telefon atau e-mel — mana-mana yang anda lebih suka kami gunakan.",
    labels: {
      name: "Nama",
      email: "E-mel",
      phone: "Telefon",
      message: "Apa yang boleh kami bantu?",
    },
    placeholders: {
      message:
        "Projek tersebut, bilik atau fasad yang terlibat, dan sebarang jangka masa yang anda rancangkan.",
    },
    submit: "Hantar pertanyaan",
    submitting: "Menghantar",
    retry: "Cuba lagi",
    errors: {
      name: "Beritahu kami pertanyaan ini daripada siapa.",
      contact: "Tambah nombor telefon atau e-mel supaya kami boleh membalas.",
      email: "Alamat e-mel itu nampak tidak betul.",
      phone: "Nombor telefon itu nampak tidak betul.",
      message: "Ceritakan sedikit tentang projek anda.",
      failed:
        "Pertanyaan itu tidak terhantar. Sila telefon 014 - 879 7371 atau hubungi kami di WhatsApp, dan kami akan teruskan dari sana.",
      rateLimited:
        "Itu beberapa pertanyaan dalam masa yang singkat. Sila telefon 014 - 879 7371 jika ia mendesak.",
    },
    sent: {
      heading: "Pertanyaan dihantar",
      body: "Kami sudah menerimanya, dan akan membalas dalam satu hari bekerja. Jika ia mendesak, telefon 014 - 879 7371.",
      again: "Hantar satu lagi",
    },
    status: {
      submitting: "Menghantar pertanyaan anda.",
      sent: "Pertanyaan dihantar.",
      error: "Pertanyaan anda tidak dapat dihantar.",
    },
    consent: "Dengan menghantarnya anda bersetuju dengan",
    consentLink: "Dasar Privasi & Kuki",
  },
};

export const SERVICES = {
  /** The page's banner. `heading` below is the SECTION's own heading, which the
      stack prints on every panel; this is the page's, and it is the nav's
      wording rather than the section's so the two agree. */
  banner: {
    heading: "Services & Features",
    lede: "From the first consultation to the last service visit: the drawings, the system selection, the supply, the installation and everything after, handled by one team.",
  },
  heading: "Our Services",
  /** One photograph per service. The pinned runway shows exactly one pair at a
      time, so each image has to carry its service on its own. */
  items: [
    {
      title: "Architectural Consultation",
      body: "We provide professional consultation to understand your design requirements, project needs, and performance expectations for homeowners, architects, interior designers and developers.",
      image: {
        src: "/services/01.jpg",
        alt: "Two people reading a printed floor plan across a table",
      },
    },
    {
      title: "Custom Design & System Selection",
      body: "Every project is unique. Our team provides customised solutions to match architectural concepts and lifestyle requirements.",
      image: {
        src: "/services/02.jpg",
        alt: "A window system held open at its cross-section while a hand points at the profile",
      },
    },
    {
      title: "Supply & Project Solutions",
      body: "From small residential projects to large developments, MEVO MALAYSIA provides reliable supply solutions with professional project coordination.",
      image: {
        src: "/services/03.jpg",
        alt: "Racked lengths of extruded metal stock in an industrial warehouse",
      },
    },
    {
      title: "Installation & Technical Support",
      body: "Our installation team, all Certified MEVO Installers, ensures every system performs according to design expectations.",
      image: {
        src: "/services/04.jpg",
        alt: "An installer fixing a window frame in place with a cordless drill",
      },
    },
    {
      title: "After-Sales Service",
      body: "Dedicated customer support and maintenance guidance for long-term satisfaction.",
      image: {
        src: "/services/05.jpg",
        alt: "Close view of hands driving a screw into a window frame",
      },
    },
  ],
};

/** Title and body only, in the same order as SERVICES.items. The photographs
    and their alt text are carried over from the English entries below rather
    than repeated here, so the two lists can never drift apart. `heading` is
    untranslated, so the panel labels stay "our Services [01]". */
const SERVICES_ITEMS_ZH = [
  {
    title: "建筑咨询",
    body: "我们为业主、建筑师、室内设计师和开发商提供专业的咨询服务，以了解您的设计需求、项目需求和性能预期。",
  },
  {
    title: "定制设计与系统选型",
    body: "每个项目都是独一无二的。我们的团队提供定制化的解决方案，以匹配建筑理念和生活方式的要求。",
  },
  {
    title: "供应与项目解决方案",
    body: "从小型住宅项目到大型开发项目，MEVO MALAYSIA 凭借专业的项目协调能力，为您提供可靠的供应解决方案。",
  },
  {
    title: "安装与技术支持",
    body: "我们的专业安装团队，MEVO 认证安装商，确保每个系统都按照设计预期执行。",
  },
  {
    title: "售后服务",
    body: "专属客户支持与维护指导，确保长期满意。",
  },
];

export const SERVICES_ZH: Partial<typeof SERVICES> = {
  banner: {
    heading: "服务与特色",
    lede: "从最初的咨询到最后一次售后上门：图纸、系统选型、供应、安装及其后的一切，由同一支团队负责。",
  },
  /* Was untranslated, so the ZH panel labels read "Our Services [01]". */
  heading: "我们的服务",
  items: SERVICES.items.map((item, i) => ({ ...item, ...SERVICES_ITEMS_ZH[i] })),
};

/** Title and body only, in the same order as SERVICES.items. The photographs
    and their alt text carry over from the English entries, so the two lists
    cannot drift apart. */
const SERVICES_ITEMS_BM = [
  {
    title: "Perundingan Seni Bina",
    body: "Kami menyediakan perundingan profesional untuk memahami keperluan reka bentuk, keperluan projek dan jangkaan prestasi anda — untuk pemilik rumah, arkitek, pereka dalaman dan pemaju.",
  },
  {
    title: "Reka Bentuk Tersuai & Pemilihan Sistem",
    body: "Setiap projek adalah unik. Pasukan kami menyediakan penyelesaian tersuai yang sepadan dengan konsep seni bina dan keperluan gaya hidup.",
  },
  {
    title: "Pembekalan & Penyelesaian Projek",
    body: "Daripada projek kediaman kecil hingga pembangunan berskala besar, MEVO MALAYSIA menyediakan penyelesaian pembekalan yang boleh diharap dengan penyelarasan projek yang profesional.",
  },
  {
    title: "Pemasangan & Sokongan Teknikal",
    body: "Pasukan pemasangan kami, semuanya Pemasang MEVO Bertauliah, memastikan setiap sistem berfungsi mengikut jangkaan reka bentuknya.",
  },
  {
    title: "Perkhidmatan Selepas Jualan",
    body: "Sokongan pelanggan yang khusus dan panduan penyelenggaraan untuk kepuasan jangka panjang.",
  },
];

export const SERVICES_BM: Partial<typeof SERVICES> = {
  banner: {
    heading: "Perkhidmatan & Ciri",
    lede: "Daripada perundingan pertama hingga lawatan servis terakhir: lukisan, pemilihan sistem, pembekalan, pemasangan dan segala yang selepasnya, diuruskan oleh satu pasukan.",
  },
  heading: "Perkhidmatan Kami",
  items: SERVICES.items.map((item, i) => ({ ...item, ...SERVICES_ITEMS_BM[i] })),
};
/**
 * MEVO Workmanship. Copy supplied by the client for /services, used as given;
 * "PA Projects Marketing" in their draft is written "PA Projects", as the
 * client asked and as the company catalogue prints it. English only for now, so /zh and /bm fall
 * through to it.
 *
 * `hero` is the page's opening slide; `section` is the annotated cross-section
 * further down the page, which the hero's button scrolls to.
 *
 * Each component's `spec` comes from the company catalogue (MEVO MALAYSIA
 * PA PROJECTS company profile e-catalogue): "3.0mm wall thickness exceeding
 * Chinese national standard", "imported German hardware & window handles",
 * the 46.6 topological thermal break strip and "three-layer sealing design"
 * from its Core Functional Advantages page, the DM30/75's six sealing layers,
 * the "injected corner cleats" of its Professional Craftsmanship panel, and
 * the DM15's 15mm interlock.
 */
export const WORKMANSHIP = {
  hero: {
    eyebrow: "MEVO Workmanship",
    /** Three short sentences, set one to a line. */
    headline: ["Precision Engineering.", "Exceptional Quality.", "Built to Last."],
    body: "At PA Projects, we believe that exceptional doors and windows begin with exceptional workmanship.",
    cta: "Explore the Engineering",
    image: "/pexels-francesca-cinel-114872900-9729590.jpg",
    alt: "Two hands holding an aluminium window profile, the chambers of its section visible at the cut end",
  },
  section: {
    /** The fragment the hero's button scrolls to. */
    id: "workmanship",
    heading: "Experience the Art of Precision Engineering",
    paragraphs: [
      "Discover the engineering behind MEVO’s advanced door and window systems, where every detail is thoughtfully designed to deliver strength, durability, smooth functionality, and modern aesthetics.",
      "From precision-engineered aluminium profiles to carefully selected hardware and innovative sealing technologies, every component plays an essential role in creating reliable, high-performance systems.",
    ],
    subheading: "Engineered with Precision. Designed for Everyday Living.",
    lead: "Explore the craftsmanship behind MEVO’s door and window solutions, featuring:",
    /** In the order the numbers run round the drawing. */
    components: [
      {
        title: "Advanced Aluminium Profiles",
        body: "Engineered for structural strength, durability, and contemporary design.",
        spec: "Wall thickness up to 3.0mm",
      },
      {
        title: "Precision Hardware Systems",
        body: "Designed to support smooth operation and dependable performance.",
        spec: "Imported German hardware & handles",
      },
      {
        title: "Thermal Break Technology",
        body: "Developed to help improve thermal insulation and indoor comfort.",
        spec: "46.6mm insulation strip",
      },
      {
        title: "Innovative Sealing Systems",
        body: "Designed to enhance sealing performance against external elements.",
        spec: "Three-layer sealing, up to six on sliding doors",
      },
      {
        title: "Modern Engineering & Design",
        body: "Combining functionality, attention to detail, and refined aesthetics.",
        spec: "Injected corner cleats, 15mm slim interlock",
      },
    ],
    exterior: "Exterior",
    interior: "Interior",
    /** The drawing's caption, for anyone who cannot see it. */
    figureLabel:
      "Cross-section of a thermally broken aluminium window, with its profile chambers, hardware, thermal break strips, seals and glazing marked one to five",
  },
};
/**
 * MEVO Global Strategic Partners: the material library at the foot of
 * /our-products. Intro copy supplied by the client, used as given ("PA
 * Projects Marketing" written "PA Projects", as on /services).
 *
 * THE SAMPLES ARE OURS, NOT THE CLIENT'S, and every one marked `placeholder`
 * is a stand-in to be replaced once the client supplies their real range of
 * finishes. Low-E and laminated insulated glass are confirmed by the company
 * catalogue (pp. 4-5), as are Hörmann and VBH hardware (DM27, DM112). The rest are taken from the product catalogue
 * (lib/products.ts), which names each of them against a real product:
 *
 *   - Insulated glass: the 5+20A+5 black-spacer units of the DM122/132.
 *     Reeded glass: the DM16 French sliding door.
 *   - Faux copper and raw aluminium: the Fortune Deer entry door's surface.
 *     Phantom Grey: the Bamboo Rhyme door's handle. Fluorocarbon: RUYUDESHUI.
 *   - Every hardware brand is one a product's spec names. That they are
 *     "strategic partners" rather than suppliers is the client's claim and
 *     theirs to confirm before launch; names are set as text, not logos,
 *     until the client supplies logo files they have the right to use.
 *
 * `swatch` is a colour for the finish chips and the tinted profile drawing.
 * `image` is a photograph from the site's own library for the large view.
 * `product` names where the sample can be seen in the catalogue, by slug.
 */
export const MATERIALS = {
  id: "materials",
  eyebrow: "MEVO Global Strategic Partners",
  heading: "Quality Components. Trusted Partnerships. Exceptional Performance.",
  paragraphs: [
    "At PA Projects, we believe quality begins with the right components.",
    "MEVO brings together carefully selected materials, premium hardware, and innovative technologies to deliver reliable, stylish, and high-performance door and window systems.",
    "Explore our range of glass options, aluminium finishes, and hardware solutions designed to complement every space.",
  ],
  partnersLabel: "Hardware partners",
  closing: "Discover Quality in Every Detail.",
  cta: { label: "Book a Showroom Visit", href: "/contact" },
  /** The small link in the /our-products banner that scrolls here. */
  bannerLink: "Glass, Finishes & Hardware",
  seenIn: "Seen in",
  placeholderTag: "Placeholder",
  tabs: [
    {
      key: "glass",
      label: "Glass",
      samples: [
        {
          name: "Insulated Glass",
          body: "Two panes sealed around a black aluminium spacer, such as the 5mm + 20A + 5mm units of the DM122/132, for insulation against heat and sound.",
          image: "/products/10.jpg",
          product: "dm122-132-side-pressure-sliding-window",
        },
        {
          name: "Reeded Glass",
          body: "Fluted glass that lets light through while softening the view, for interior doors where privacy matters.",
          image: "/products/13.jpg",
          product: "dm16-french-interior-sliding-door",
        },
        {
          name: "Low-E Glass",
          body: "Premium-grade coated glass for intense sun: Low-E thermal insulation, sun protection and UV resistance, where ordinary glass absorbs heat and glares.",
          image: "/products/06.jpg",
        },
        {
          name: "Laminated Insulated Glass",
          body: "Laminated, double-glazed units for superior sound insulation, sealed on three layers around the sash.",
          image: "/products/01.jpg",
        },
      ],
    },
    {
      key: "finishes",
      label: "Aluminium Finishes",
      samples: [
        {
          name: "Matte Black",
          body: "A placeholder for the client's standard dark finish. Replace with the real name and coating.",
          swatch: "#1b1d20",
          placeholder: true,
        },
        {
          name: "Phantom Grey",
          body: "A soft, deep grey, as on the Bamboo Rhyme entry door's handle.",
          swatch: "#5d6268",
          product: "bamboo-rhyme-entry-door",
        },
        {
          name: "Raw Aluminium",
          body: "The metal's own silver, left visible, as on the Fortune Deer entry door.",
          swatch: "#c3c8ce",
          product: "fortune-deer-entry-door",
        },
        {
          name: "Faux Copper",
          body: "A warm copper-toned surface treatment, spliced with raw aluminium on the Fortune Deer entry door.",
          swatch: "#9a6646",
          product: "fortune-deer-entry-door",
        },
        {
          name: "Fluorocarbon Coating",
          body: "An ultra-weather-resistant coating for surfaces that face the sun and rain, as on the RUYUDESHUI entry door.",
          swatch: "#3c4148",
          product: "ruyudeshui-entry-door",
        },
      ],
    },
    {
      key: "hardware",
      label: "Hardware",
      samples: [
        {
          name: "ROTO",
          body: "German hardware, including the lift-and-slide system on MEVO's large sliding doors.",
          image: "/products/12.jpg",
          product: "dm30-75-sliding-door",
        },
        {
          name: "HOPPE",
          body: "German handles, fitted across MEVO's casement and fixed window systems.",
          image: "/products/01.jpg",
          product: "dm106-casement-window",
        },
        {
          name: "KESENBERG",
          body: "German hardware for MEVO's bifold doors, on high-load double-row rollers.",
          image: "/products/11.png",
          product: "dm80-biofold-door",
        },
        {
          name: "Wehag",
          body: "German hardware for awning windows, with 30° micro-ventilation.",
          image: "/products/08.jpg",
          product: "dm122-awning-window",
        },
        {
          name: "Hörmann",
          body: "German anti-theft hook locks on the slimline panoramic door.",
          image: "/products/05-1.jpg",
          product: "dm27-slimline-panoramic-door",
        },
        {
          name: "VBH",
          body: "German hardware handles, with Mtuosi, on the DM112 window and door system.",
          image: "/products/07.jpg",
          product: "dm112-windowdoor-system",
        },
        {
          name: "OPK",
          body: "The Perfect System multi-linkage hardware behind MEVO's ultra-slim interior sliding doors.",
          image: "/products/15.jpg",
          product: "dm10-interior-sliding-door",
        },
        {
          name: "HYUNDAI",
          body: "The South Korean motorised system on the slimline panoramic door.",
          image: "/products/05-1.jpg",
          product: "dm27-slimline-panoramic-door",
        },
      ],
    },
  ] as MaterialTab[],
};

export type MaterialSample = {
  name: string;
  body: string;
  image?: string;
  swatch?: string;
  product?: string;
  placeholder?: boolean;
};
export type MaterialTab = { key: string; label: string; samples: MaterialSample[] };

export const MATERIALS_ZH: Partial<typeof MATERIALS> = {
  bannerLink: "玻璃、饰面与五金",
  cta: { label: "预约参观展厅", href: "/contact" },
};

export const MATERIALS_BM: Partial<typeof MATERIALS> = {
  bannerLink: "Kaca, Kemasan & Perkakasan",
  cta: { label: "Tempah Lawatan Bilik Pameran", href: "/contact" },
};



export const PROJECTS = {
  heading: "Our Projects",
  blurb:
    "From homes to commercial spaces, explore aluminium windows and doors crafted for every unique project.",
  /** The banner at the head of /our-projects, on the standalone page only.

      The home page's strip has no banner — it is a section inside a longer
      page, and the heading above it is doing that job. The standalone page
      opens on the band, and when it does the band carries the `h1`: see the
      note on `standalone` in Projects.tsx for why the section's own heading
      then goes rather than being repeated under it.

      The heading repeats `heading` above rather than reaching for something
      of its own, and that is the decision rather than an oversight. Every
      other banner on the site is a short noun phrase — "Our Products", "Our
      Services", "Director's Profile" — and it is the words the nav item uses,
      so a page is called what the reader clicked to reach it. /contact is the
      one exception, and it earns it by asking for something.

      The lede is where the page differs from the home page's strip: that one
      shows six photographs in passing, this one is the whole catalogue. */
  banner: {
    heading: "Our Projects",
    lede: "Windows, doors, sunrooms and entrances from across the MEVO range, photographed in the rooms they were installed in. Tap any photograph to see it full size.",
  },
  /** Points at a page that does not exist yet; the link ships ahead of it. */
  cta: { label: "Contact us", href: "/contact" },
  /** Names each tile's lightbox trigger. Held here rather than written into the
      markup because it is a sentence, and a sentence half in the component and
      half in a data file cannot be translated. Same pattern as
      PRODUCTS_PAGE.cta.aria. */
  openLabel: (project: string) => `Open ${project}`,
  /** Six photographs, each captioned with the product it actually shows.

      They were PROJECT 1 through PROJECT 6 — the live site's own tile names,
      and six anonymous numbers under a heading promising a portfolio. The
      photographs are the manufacturer's product shots, so every tile already
      HAD a subject; only the caption was withholding it.

      The model code is dropped: "Casement Window" rather than "DM106 Casement
      Window". This is the home page, where a reader is being shown what MEVO
      makes, not looking up a part — the code belongs in the catalogue, where
      someone is comparing systems.

      The pictures are the manufacturer's own installation photography out of
      `public/products/`, the same shots the catalogue in lib/products.ts hangs
      its product pages on - so these are rooms MEVO systems are actually
      standing in rather than stock architecture. The alt text is copied from
      that catalogue verbatim, and must stay in step with it: it describes the
      photograph, so a swapped `src` is a wrong alt until it is rewritten.

      Chosen for the crop as much as for the subject. The strip's cards are 3:4
      and the photography is all landscape, so `object-cover` throws away the
      sides of every one of them; these six sit between 1.33 and 1.43, where
      the wider shots in the catalogue run past 1.9 and would lose half their
      width to the frame.

      Intrinsic pixel sizes are carried so the lightbox frame can be the
      picture's own shape rather than a box it sits letterboxed inside. */
  images: [
    { src: "/products/01.jpg", label: "Casement Window", alt: "Living room with a tall dark-framed casement window opening onto a misty pine forest", width: 2560, height: 1706 },
    { src: "/products/03.jpg", label: "Sunroom", alt: "Freestanding glass sunroom with a dark aluminium gable frame, standing on lit stone steps in an evening garden", width: 2560, height: 1792 },
    { src: "/products/05-1.jpg", label: "Slimline Panoramic Door", alt: "Minimal lounge with a full-height two-panel panoramic door opening onto a lake ringed by mountains", width: 2560, height: 1844 },
    { src: "/products/07.jpg", label: "Window & Door System", alt: "Poolside living room with a combined door and window system, a screened side panel and a small opening casement", width: 2560, height: 1785 },
    { src: "/products/15.jpg", label: "Interior Sliding Door", alt: "Pale seaside room with an ultra-slim four-panel sliding door framing a rocky shore", width: 2048, height: 1536 },
    { src: "/products/18.jpg", label: "Chasing Light Entry Door", alt: "Modern white house entrance with a ribbed charcoal entry door, a slim sidelight and a lit wall sconce", width: 2560, height: 1920 },
  ],
};

/**
 * Every photograph in `public/products/`, for the masonry gallery on
 * /our-projects.
 *
 * DERIVED FROM THE CATALOGUE RATHER THAN TRANSCRIBED FROM IT. `PRODUCTS` in
 * lib/products.ts already carries each shot's `src` and `alt` beside the
 * product it belongs to, and a second hand-written list of the same 23 entries
 * would agree with it on the day it was written and never again — a swapped
 * photograph in the catalogue would leave this one captioning the old picture.
 * So the list is built from that array, and adding a product's photograph to
 * the catalogue adds it here.
 *
 * Two things the catalogue has no room for are added on the way past:
 *
 *   - INTRINSIC PIXEL SIZES, which the masonry layout and the lightbox both
 *     need. The grid gives each tile the photograph's own proportions rather
 *     than a fixed box, which is what makes it masonry rather than a grid of
 *     crops; the lightbox sizes its frame the same way. Measured off the files
 *     themselves — a wrong number here is a tile of the wrong height, not a
 *     stretched picture, since `object-cover` still fits it.
 *   - A LABEL, which is the product's title with the model code dropped:
 *     "Casement Window", not "DM106 Casement Window". Same rule the six-image
 *     strip followed, and for the same reason — this is someone being shown
 *     what MEVO makes, not looking up a part.
 *
 * The model code is the leading token of every catalogue title that has one
 * (`DM106`, `DM122/132`), so it is stripped by shape rather than listed; the
 * four entry doors and the clad-wood range have no code and pass through
 * whole.
 *
 * THE LABELS ARE ENGLISH IN ALL THREE LOCALES, and that is a real gap rather
 * than an oversight. lib/products.ts is English-only — the same reason
 * /bm/our-products prints Malay chrome around English bullets, noted at the top
 * of that file. PROJECTS carried hand-written ZH and BM label arrays, but they
 * were six labels for the six photographs the strip showed, positional: the
 * seventh entry here would silently take the first Chinese label. Rather than
 * ship a wall captioned wrongly in two languages, the labels stay in one
 * language until the client supplies the other two.
 *
 * Filling the gap is a `titleZh` / `titleMs` beside `title` in lib/products.ts
 * and a lookup here keyed on `no` — not another positional array, which is the
 * shape that could not survive a photograph being added.
 */
const MODEL_CODE = /^DM[\d/]+(?:Pro)?\s+/i;

/** Intrinsic size of each file in `public/products/`, keyed by `src`. Read off
    the files rather than guessed: see the note above. */
const PRODUCT_IMAGE_SIZES: Record<string, { width: number; height: number }> = {
  "/products/01.jpg": { width: 2560, height: 1706 },
  "/products/02.png": { width: 2000, height: 1500 },
  "/products/03.jpg": { width: 2560, height: 1792 },
  "/products/04.jpg": { width: 2560, height: 1701 },
  "/products/05-1.jpg": { width: 2560, height: 1844 },
  "/products/05-2.jpg": { width: 2560, height: 1452 },
  "/products/06.jpg": { width: 1920, height: 985 },
  "/products/07.jpg": { width: 2560, height: 1785 },
  "/products/08.jpg": { width: 2560, height: 1707 },
  "/products/09.jpg": { width: 2560, height: 1536 },
  "/products/10.jpg": { width: 2560, height: 1383 },
  "/products/11.png": { width: 854, height: 678 },
  "/products/12.jpg": { width: 2560, height: 1343 },
  "/products/13.jpg": { width: 2560, height: 1425 },
  "/products/14.jpg": { width: 2560, height: 2560 },
  "/products/15.jpg": { width: 2048, height: 1536 },
  "/products/16-1.jpeg": { width: 2560, height: 1728 },
  "/products/16-2.jpeg": { width: 2560, height: 1360 },
  "/products/16-3.jpeg": { width: 2560, height: 1738 },
  "/products/17.jpg": { width: 2560, height: 1957 },
  "/products/18.jpg": { width: 2560, height: 1920 },
  "/products/19.jpg": { width: 2560, height: 2560 },
  "/products/20.jpg": { width: 2560, height: 2249 },
};

/** The fallback shape for a photograph added to the catalogue without a size
    being recorded above. 3:2 is the commonest ratio in the set, so a forgotten
    entry lands at a plausible height rather than collapsing the tile. */
const FALLBACK_SIZE = { width: 2560, height: 1707 };

export const PROJECT_GALLERY: {
  src: string;
  label: string;
  alt: string;
  width: number;
  height: number;
}[] = PRODUCTS.flatMap((product) =>
  product.images.map((image) => ({
    src: image.src,
    label: product.title.replace(MODEL_CODE, ""),
    alt: image.alt,
    ...(PRODUCT_IMAGE_SIZES[image.src] ?? FALLBACK_SIZE),
  })),
);

/** Tile labels only. Each photograph's `src`, `alt` and intrinsic size are
    carried over from PROJECTS: the alt text describes the picture and is held
    in step with lib/products.ts by hand, so it stays in one place and in one
    language rather than being copied into a second list that could drift.
    `openLabel` reads "查看" - view - rather than a literal "open", which is
    what a Chinese reader expects of a control that enlarges a photograph. */
const PROJECT_LABELS_ZH = [
  "系统窗",
  "阳光房",
  "全景门",
  "门联窗",
  "联动吊门",
  "追光入户门",
];

export const PROJECTS_ZH: Partial<typeof PROJECTS> = {
  heading: "我们的项目",
  blurb:
    "从住宅到商业空间，探索为每一个独特项目量身打造的铝合金门窗。",
  /* The band at the head of /zh/our-projects. The heading is `heading` above
     again, for the reason given on the English banner — it is what the nav
     calls this page. The lede is the page's own. */
  banner: {
    heading: "我们的项目",
    lede: "美沃全系列门窗、阳光房与入户门，实拍于安装现场。点击任意照片查看大图。",
  },
  /* href too, not just the label: this pointed a Chinese reader at /contact. */
  cta: { ...PROJECTS.cta, label: "联系我们", href: zhPath(PROJECTS.cta.href) },
  openLabel: (project: string) => `查看${project}`,
  /* The client's own names for these six, not a translation of the English:
     they are the filenames the manufacturer's photographs were published
     under on the live site (DM106-系统窗, DM126-阳光房, DM27-全景门,
     DM112Pro-门联窗, DM10-联动吊门, 追光入户门). Same rule as the English —
     the model code is dropped. */
  images: PROJECTS.images.map((image, i) => ({
    ...image,
    label: PROJECT_LABELS_ZH[i],
  })),
};

/** Tile labels only; every photograph's `src`, `alt` and intrinsic size carry
    over from PROJECTS. Unlike the Chinese labels — which are the client's own
    names for these six shots — these are translations of the English, since
    there is no Malay set to take them from. */
const PROJECT_LABELS_BM = [
  "Tingkap Casement",
  "Sunroom",
  "Pintu Panoramik Nipis",
  "Sistem Pintu & Tingkap",
  "Pintu Gelangsar Dalaman",
  "Pintu Utama Chasing Light",
];

export const PROJECTS_BM: Partial<typeof PROJECTS> = {
  heading: "Projek Kami",
  blurb:
    "Daripada rumah hingga ruang komersial, terokai tingkap dan pintu aluminium yang direka untuk setiap projek yang unik.",
  /* The band at the head of /bm/our-projects — see the note on the Chinese. */
  banner: {
    heading: "Projek Kami",
    lede: "Tingkap, pintu, sunroom dan pintu utama daripada keseluruhan rangkaian MEVO, dirakam di ruang tempat ia dipasang. Ketik mana-mana foto untuk melihatnya bersaiz penuh.",
  },
  cta: { ...PROJECTS.cta, label: "Hubungi kami", href: bmPath(PROJECTS.cta.href) },
  openLabel: (project: string) => `Buka ${project}`,
  images: PROJECTS.images.map((image, i) => ({
    ...image,
    label: PROJECT_LABELS_BM[i],
  })),
};

export const FOOTER = {
  brand: "MEVO MALAYSIA",
  /**
   * This was "We are dedicated to providing innovative solutions that empower
   * businesses to excel in their respective industries" — WordPress-template
   * boilerplate that named neither the product, the material nor the country,
   * and addressed "businesses" when the services copy sells to homeowners and
   * architects. It sat in the footer of every page, so it was also the one
   * sentence every page repeated to a crawler.
   */
  blurb:
    "Aluminium window and door systems engineered for the Malaysian climate — supplied, installed and serviced by MEVO Malaysia from our Shah Alam showroom.",
  reachHeading: "Reach Out to Us",
  phone: "014 - 879 7371",
  /** The number as dialled: spaces and the leading zero are for reading, the
      country code is for the handset. */
  phoneHref: "tel:+60148797371",
  email: "info@paprojects.com.my",
  emailHref: "mailto:info@paprojects.com.my",
  company: "PA PROJECTS MARKETING SDN BHD (847136-X)",
  address:
    "19, Jalan 15/23, Taman Perindustrian Tiong Nam, Seksyen 15, 40200 Shah Alam, Selangor Darul Ehsan, Malaysia. (Showroom & Office)",
  connectHeading: "Connect with Us",
  /** Order is the order they are shown in. WhatsApp reuses the same link as
      the header's chat button, so there is one number to change, not two. */
  socials: [
    { name: "WhatsApp", url: WHATSAPP.url },
    { name: "Facebook", url: "https://www.facebook.com/MEVOMalaysia" },
    { name: "Instagram", url: "https://www.instagram.com/mevomalaysia" },
    { name: "TikTok", url: "https://www.tiktok.com/@mevomalaysia" },
    {
      name: "Xiaohongshu",
      url: "https://www.xiaohongshu.com/user/profile/Mevo_Malaysia",
    },
  ],
  copyright: "\u00a9 2026 MEVO MALAYSIA",
  privacy: "Privacy & Cookies",
  cookiePreferences: "Cookie preferences",
};

/** Only the standfirst. Everything else in the footer is a proper noun, an
    address or a number - the same in either language - and the legal links
    point at English pages, so translating their labels would promise a
    translation that is not there. */
export const FOOTER_ZH: Partial<typeof FOOTER> = {
  /** Rewritten alongside the English above, which it was a translation of.
      Flagged for the client to confirm rather than left describing a sentence
      the site no longer says. */
  blurb:
    "专为马来西亚气候打造的铝合金门窗系统 —— 由 MEVO 马来西亚莎阿南展厅提供供应、安装与售后服务。",
};

/** Only the standfirst, for the reason the Chinese overlay gives: everything
    else in the footer is a proper noun, an address or a number. */
export const FOOTER_BM: Partial<typeof FOOTER> = {
  blurb:
    "Sistem tingkap dan pintu aluminium yang direka untuk iklim Malaysia — dibekal, dipasang dan diselenggara oleh MEVO Malaysia dari bilik pameran kami di Shah Alam.",
};

/**
 * Cookie consent.
 *
 * The banner line is the client's own, and reads as the site's stated position
 * rather than as a description of the current build: no analytics or marketing
 * cookie is installed yet, and the categories below hold nothing. What is
 * enforced regardless is the mechanism — a script in either category stays
 * inert until that category is allowed.
 *
 * When a tracker does land, list its cookies under `autoClear` and bump
 * `REVISION` in components/site/CookieConsent.tsx, so everyone who has already
 * answered is asked again against what the categories then carry.
 *
 * `footer` and a few descriptions carry inline HTML because the library renders
 * these through innerHTML. Every string here is written by us; none is
 * user-supplied.
 */
export const CONSENT = {
  banner: {
    label: "Cookie notice",
    title: "Cookies",
    description:
      "We use cookies to improve your experience, analyse site traffic, and personalise content. By continuing to use this site, you agree to our use of cookies.",
    acceptAll: "Accept all",
    acceptNecessary: "Necessary only",
    showPreferences: "Manage",
    closeIconLabel: "Accept necessary cookies only",
    footer: '<a href="/privacy#cookies">Privacy &amp; cookies</a>',
  },
  preferences: {
    title: "Cookie preferences",
    acceptAll: "Accept all",
    acceptNecessary: "Necessary only",
    save: "Save preferences",
    closeIconLabel: "Close cookie preferences",
    serviceCounterLabel: "Service|Services",
    intro: {
      title: "How this site uses cookies",
      description:
        "MEVO Malaysia sets no analytics or advertising cookies. The categories below exist so that if any are ever added, they stay switched off until you say otherwise.",
    },
    necessary: {
      title: "Strictly necessary",
      description:
        "Required for the site to work. Today that is one cookie, <code>cc_cookie</code>, which stores this choice for 182 days and nothing else. It cannot be switched off.",
    },
    analytics: {
      title: "Analytics",
      description:
        "Used to understand which pages are read and how, so the site can be improved. Nothing in this category runs unless you allow it.",
    },
    marketing: {
      title: "Marketing",
      description:
        "Used to measure how advertising and social campaigns perform. Nothing in this category runs unless you allow it.",
    },
    more: {
      title: "More information",
      description:
        'The full disclosure is on the <a href="/privacy#cookies">privacy and cookies page</a>. Anything it does not answer: <a href="mailto:info@paprojects.com.my">info@paprojects.com.my</a>.',
    },
  },
};

/**
 * The /privacy page. Client-supplied text, carried verbatim.
 *
 * A section's `body` is a run of blocks: a plain string is a paragraph, a
 * `{ list }` is a bulleted set, and a `{ title, body }` is a labelled
 * sub-section, which section 7 uses for the three kinds of cookie. The cookies
 * section keeps `id: "cookies"` because the consent notice links straight at
 * it.
 *
 * The contact details are read from FOOTER by the page rather than repeated
 * here, so the number and address on this page cannot drift from the ones in
 * the footer.
 */
export const PRIVACY = {
  heading: "Privacy & Cookies",
  updated: "Last updated: 25 August 2026",
  intro: [
    'MEVO Malaysia ("MEVO", "we", "us" or "our") respects your privacy and is committed to protecting your personal data. This Privacy & Cookies Policy explains how we collect, use, store and protect your information when you visit and interact with our website.',
    "By using this website, you agree to the practices described in this policy.",
  ],
  sections: [
    {
      id: "information-we-collect",
      heading: "1. Information We Collect",
      body: [
        "We may collect personal information that you voluntarily provide to us, including:",
        {
          list: [
            "Name",
            "Email address",
            "Phone number",
            "Company name",
            "Project or enquiry details",
            "Any other information submitted through our contact or enquiry forms",
          ],
        },
        "We may also automatically collect certain technical information when you visit our website, such as your IP address, browser type, device information, pages visited and interactions with our website.",
      ],
    },
    {
      id: "how-we-use-your-information",
      heading: "2. How We Use Your Information",
      body: [
        "We may use your information to:",
        {
          list: [
            "Respond to your enquiries and quotation requests",
            "Provide information about our products and services",
            "Communicate with you regarding your project or request",
            "Improve our website, products and services",
            "Analyse website traffic and user behaviour",
            "Maintain the security and functionality of our website",
            "Comply with applicable legal and regulatory requirements",
          ],
        },
        "We will only use your personal information for legitimate business purposes and in accordance with applicable data protection laws.",
      ],
    },
    {
      id: "sharing-your-information",
      heading: "3. Sharing Your Information",
      body: [
        "We do not sell or rent your personal information to third parties.",
        "We may share your information with trusted service providers or partners who assist us in operating our website and providing our services. These parties are required to handle your information responsibly and only for the purposes necessary to provide their services.",
        "We may also disclose information where required by law or where necessary to protect our rights, property or safety.",
      ],
    },
    {
      id: "data-security",
      heading: "4. Data Security",
      body: [
        "We take reasonable technical and organisational measures to protect your personal information from unauthorised access, misuse, loss, alteration or disclosure.",
        "However, no method of transmitting or storing information online is completely secure. While we take appropriate steps to protect your information, we cannot guarantee absolute security.",
      ],
    },
    {
      id: "data-retention",
      heading: "5. Data Retention",
      body: [
        "We retain your personal information only for as long as necessary to fulfil the purposes for which it was collected, including responding to enquiries, providing our services and meeting legal or business requirements.",
        "When your information is no longer required, we will take reasonable steps to securely delete or anonymise it.",
      ],
    },
    {
      /** The consent notice links at this id. */
      id: "cookies",
      heading: "6. Cookies",
      body: [
        "Our website uses cookies and similar technologies to help provide, improve and personalise your browsing experience.",
        "Cookies are small text files stored on your device when you visit a website. They allow a website to recognise your device and remember certain information about your visit.",
      ],
    },
    {
      id: "how-we-use-cookies",
      heading: "7. How We Use Cookies",
      body: [
        "We may use cookies for the following purposes:",
        {
          title: "Essential Cookies",
          body: "These cookies are necessary for the website to function properly and enable core features such as security, navigation and accessibility.",
        },
        {
          title: "Analytics Cookies",
          body: "These cookies help us understand how visitors use our website, such as which pages are visited and how visitors interact with the website. This information helps us improve the performance and user experience of our website.",
        },
        {
          title: "Functional Cookies",
          body: "These cookies may remember your preferences and settings to provide a more convenient and personalised browsing experience.",
        },
      ],
    },
    {
      id: "managing-cookies",
      heading: "8. Managing Cookies",
      body: [
        "You can manage, restrict or delete cookies through your browser settings. Please note that disabling certain cookies may affect the functionality and performance of our website.",
        "Where required, we may also provide options for you to manage your cookie preferences directly through our website.",
      ],
    },
    {
      id: "third-party-services",
      heading: "9. Third-Party Services",
      body: [
        "Our website may use third-party services, such as analytics, embedded content or other tools. These third parties may collect information in accordance with their own privacy policies.",
        "We encourage you to review the privacy policies of relevant third-party providers for more information about how they handle your data.",
      ],
    },
    {
      id: "third-party-links",
      heading: "10. Third-Party Links",
      body: [
        "Our website may contain links to third-party websites. MEVO is not responsible for the privacy practices or content of these external websites. We encourage you to review the privacy policies of any third-party websites you visit.",
      ],
    },
    {
      id: "your-rights",
      heading: "11. Your Rights",
      body: [
        "Subject to applicable laws, you may have the right to request access to, correction of or deletion of your personal information held by us.",
        "You may also withdraw your consent to certain uses of your personal information, subject to any legal or contractual requirements.",
        "To make a request regarding your personal information, please contact us using the details below.",
      ],
    },
    {
      id: "changes-to-this-policy",
      heading: "12. Changes to This Policy",
      body: [
        "We may update this Privacy & Cookies Policy from time to time to reflect changes to our practices, website or applicable laws.",
        'Any updates will be posted on this page, and the "Last updated" date will be revised accordingly.',
      ],
    },
  ],
  /** Section 13. Held apart from the prose because it is a set of details, and
      because the details themselves are the footer's. */
  contact: {
    heading: "13. Contact Us",
    intro:
      "If you have any questions about this Privacy & Cookies Policy or how we handle your personal information, please contact us at:",
    name: "MEVO Malaysia",
  },
  /**
   * Typeface credits, and not decoration: the HarmonyOS Sans licence requires
   * "a prominent notice in the software to state that HarmonyOS Sans Fonts are
   * used". This is that notice. Geist is named beside it so the block reads as
   * a colophon rather than as a legal patch, and it sits outside `sections`
   * because it is a credit, not a fourteenth clause of the policy.
   *
   * If the Chinese font is ever swapped out, this goes with it.
   */
  colophon: {
    heading: "Typefaces",
    body: [
      "Latin text on this site is set in Geist, © Vercel, Inc., used under the SIL Open Font License 1.1.",
      "Chinese text is set in HarmonyOS Sans SC, © Huawei Device Co., Ltd., used under the HarmonyOS Sans Fonts License Agreement.",
    ],
  },
};

export const PRODUCTS_PAGE = {
  heading: "Our Products",
  /** The hero's headline (PageHero), under `heading` as its eyebrow: the
      home hero's Our Products slide, one phrase to a line. */
  headline: ["Twenty systems.", "One standard."],
  heroImage: "/products/15.jpg",
  heroAlt: "A run of full-height aluminium sliding doors opening a living room onto a rocky shore and the sea",
  /** The banner's one paragraph, under the heading.

      It is the whole range in a sentence — the four product families, who they
      go to, and where — followed by the two things that make the claim worth
      anything: the extrusion behind the systems and the team that fits them.
      Deliberately concrete. The catalogue below is a wall of model codes, and
      this is the only place on the page that says, in plain words, what MEVO
      actually supplies. */
  subheading:
    "Casement and sliding windows, panoramic and entry doors, and sunrooms — supplied and installed for residential developments, commercial buildings and high-rise facades across Malaysia. Backed by two decades of aluminium extrusion and a certified installation team.",
  /** Names the catalogue section for screen readers. The h1 above it already
      names the page, so this heading is not repeated visually. */
  catalogLabel: "Product catalog",
  /** Prefaces the thumbnail strip on products photographed more than once. */
  viewsLabel: "Views",
  /** Names the list/grid switch for screen readers. */
  viewLabel: "Catalog layout",
  /** Names the system filter for screen readers, and its three buttons. The
      ids are `System` in lib/products.ts, which owns what each one selects;
      only the words live here. The two product ones are the same words the
      header's Our Products submenu uses, deliberately — a reader who opened
      that menu and arrived here should find the halves called what they were
      called a click ago. */
  filterLabel: "Filter by system",
  filters: [
    { id: "all" as const, label: "All" },
    { id: "window" as const, label: "Window System" },
    { id: "door" as const, label: "Door System" },
  ],
  /** Closes every expanded product. The same words the projects strip ends on,
      so the one thing the site asks for is asked for in one way. `aria` names
      the product in the label, because twenty buttons all reading "Contact us"
      are twenty identical entries in a screen reader's list of links. */
  cta: {
    label: "Contact us",
    href: "/contact",
    aria: (product: string) => `Contact us about ${product}`,
  },
};

/**
 * The catalogue chrome in Chinese.
 *
 * The product data itself needs nothing here: lib/products.ts already carries a
 * `zh` on 85 of its 86 spec bullets and ProductCatalog prints both languages
 * together in either locale, which is the one part of the site that was already
 * bilingual before any of this.
 *
 * `cta.href` points at /zh/contact rather than /contact, so a reader who gets
 * to the enquiry form from the Chinese catalogue stays in Chinese.
 */
export const PRODUCTS_PAGE_ZH: Partial<typeof PRODUCTS_PAGE> = {
  heading: "我们的产品",
  headline: ["二十套系统，", "同一标准。"],
  subheading:
    "平开窗与推拉窗、全景门与入户门，以及阳光房——为马来西亚各地的住宅项目、商业建筑与高层幕墙供应并安装。背靠二十年铝型材挤压经验与持证安装团队。",
  catalogLabel: "产品目录",
  viewsLabel: "视图",
  viewLabel: "目录布局",
  filterLabel: "按系统筛选",
  filters: [
    { id: "all" as const, label: "全部" },
    { id: "window" as const, label: "窗系统" },
    { id: "door" as const, label: "门系统" },
  ],
  cta: {
    label: "联系我们",
    href: "/zh/contact",
    aria: (product: string) => `就 ${product} 联系我们`,
  },
};

/**
 * The catalogue chrome in Malay.
 *
 * The product data needs nothing here: lib/products.ts carries English and
 * Chinese on its spec bullets and ProductCatalog prints both in every locale.
 * That is the one part of the site that is not translated for Malay, and it is
 * a real gap rather than an oversight — see the note in lib/products.ts.
 *
 * `cta.href` points at /bm/contact, so a reader who reaches the enquiry form
 * from the Malay catalogue stays in Malay.
 */
export const PRODUCTS_PAGE_BM: Partial<typeof PRODUCTS_PAGE> = {
  heading: "Produk Kami",
  headline: ["Dua puluh sistem.", "Satu standard."],
  subheading:
    "Tingkap casement dan gelangsar, pintu panoramik dan pintu utama, serta sunroom — dibekal dan dipasang untuk projek kediaman, bangunan komersial dan fasad bangunan tinggi di seluruh Malaysia. Disokong oleh dua dekad ekstrusi aluminium dan pasukan pemasangan bertauliah.",
  catalogLabel: "Katalog produk",
  viewsLabel: "Paparan",
  viewLabel: "Susun atur katalog",
  filterLabel: "Tapis mengikut sistem",
  filters: [
    { id: "all" as const, label: "Semua" },
    { id: "window" as const, label: "Sistem Tingkap" },
    { id: "door" as const, label: "Sistem Pintu" },
  ],
  cta: {
    label: "Hubungi kami",
    href: "/bm/contact",
    aria: (product: string) => `Hubungi kami tentang ${product}`,
  },
};
