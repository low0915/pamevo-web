/**
 * Single source of truth for every visible string on the page.
 * Copy is taken verbatim from paprojects.com.my, including its own casing
 * and spelling. Lorem Ipsum and template attributions are deliberately absent.
 */

import { zhPath } from "./paths";

/** `href` is set only on pages that actually exist. Everything else stays an
    inert placeholder until its route is built. */
export type NavItem = { label: string; href?: string; children?: { label: string }[] };

export const NAV: NavItem[] = [
  { label: "Our Products", href: "/our-products" },
  { label: "Contact", href: "/contact" },
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
 * "联系我们" rather than a bare "联系": the English "Contact" stands alone as
 * a noun, the Chinese verb does not, and it is the same phrase the projects
 * strip already ends on. No NAV entry has `children` today - if one ever does,
 * its sub-labels need translating here too, since this only rewrites the top
 * level.
 */
const NAV_LABELS_ZH = ["我们的产品", "联系我们"];

export const NAV_ZH: NavItem[] = NAV.map((item, i) => ({
  ...item,
  label: NAV_LABELS_ZH[i],
  href: item.href ? zhPath(item.href) : undefined,
}));

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
};

export const HERO = {
  tagline: "Innovation. Performance. Affordable.",
  /** The tagline split for the scroll-driven reveal. Same words, same order. */
  taglineWords: ["Innovation.", "Performance.", "Affordable."],
  subheading:
    "Redefining Modern Living Through High-Performance Window & Door Systems",
  /**
   * The page’s real <h1>. What is visible in that slot is the logo image, so
   * the heading text is rendered sr-only beside it: screen readers and
   * crawlers get one unambiguous statement of who this is and what they sell,
   * and the layout is untouched. Kept in sync with SEO.home.title by hand -
   * they are the same claim written for two different readers.
   */
  heading:
    "P.A. Projects x MEVO Malaysia — specialists in aluminium windows and doors",
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
  /** Split on the same three beats the English words are, so the scrubbed
      hero timeline needs no change: three words in, three words out. */
  taglineWords: ["创新。", "性能。", "实惠。"],
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

export const BACKGROUND = {
  heading: "Industry Leadership & Background",
  /** One photograph per paragraph, swapped as the pinned section scrolls. */
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
  paragraphs: [
    "Established in 2004 and listed on the Main Market of Bursa Malaysia in 2006; P.A. Resources Berhad (P.A. Group) is a leading Malaysian company in aluminium architectural and industrial applications. With over two decades of proven expertise, the Group has grown from a specialised aluminium extruder into a vertically integrated industrial group. Our operations encompass billet smelting, tool and die design, precision extrusion, surface treatment, and solar energy solutions. Headquartered in Kuala Selangor, P.A. Group is widely recognised across the region for its quality, leadership, and expertise in the aluminium industry.",
    "In addition, P.A. Group has established an in-depth strategic partnership with MEVO Doors & Windows, a renowned Chinese window and door brand, which serves as our key overseas supplier for window and door products. Specialised in the R&D and manufacturing of energy-saving and low-carbon windows and doors, MEVO operates two major operational centres in East China and South China, providing strong support for the Group's global window and door business.",
  ],
};

/** The Chinese panel copy is the client's own, not a translation of the two
    English paragraphs above: it makes the brand case rather than reciting the
    corporate history. Same two steps, so the pinned swap is unchanged. */
export const BACKGROUND_ZH: Partial<typeof BACKGROUND> = {
  heading: "行业领导地位与背景",
  paragraphs: [
    "在 MEVO 马来西亚，我们坚信门窗不仅仅是建筑构件——它们塑造着人们的生活、工作以及体验环境的方式。",
    "作为 MEVO 优质系统的独家总经销商和战略合作伙伴，我们提供集美观、舒适、耐用、节能和长期价值于一体的综合解决方案。结合先进的工程技术、现代建筑美学与可靠的性能，MEVO 通过专为现代生活方式设计的创新门窗和建筑解决方案，打造舒适、节能且时尚的居住空间。",
  ],
};

/**
 * Why Choose MEVO Malaysia. Copy supplied by the client.
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
      title: "Why Choose MEVO Malaysia",
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
    {
      title: "6 Engineering Performance Highlights",
      items: [
        "Wind Resistance Level 9 (≥5000 Pa = 500 kgf/m²)",
        "Air Tightness Level 8 (-67% to 96% Airflow Leakage)",
        "Water Tightness Level 6 (≥700 Pa)",
        "Thermal Insulation Level 8 (1.5 W/m²K, CRF ≥75)",
        "Acoustic Insulation Level 5 (Sound Reduction 43dB)",
        "Superior German Hardware System",
      ],
      note: "German Roto Hardware System, HOPPE Handle, TECTUS / TPEO Transmission Rod System",
    },
  ],
  tagline: [
    "Our commitment is simple:",
    "Innovation Meets Performance. Premium Living Made Affordable.",
  ],
};

/** All three parts and the closing commitment. The performance grades keep
    their English level names and SI units - "Level 8", "1.5W/m²K", "43dB" -
    because those are the standard's own notation and are read as figures rather
    than as words. The photograph and its alt text stay English; see the note on
    HERO_ZH. */
export const WHY_CHOOSE_ZH: Partial<typeof WHY_CHOOSE> = {
  parts: [
    {
      title: "为什么选择 MEVO Malaysia",
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
      title: "6 大工程性能亮点",
      items: [
        "抗风压性能 Level 9（≥5000 Pa = 500 kgf/m²）",
        "气密性能 Level 8（空气渗漏减少 67% 至 96%）",
        "水密性能 Level 6（≥700 Pa）",
        "隔热性能 Level 8（1.5 W/m²K，CRF ≥75）",
        "隔音性能 Level 5（降噪达 43dB）",
        "卓越德国五金系统",
      ],
      note: "德国 Roto 五金系统、HOPPE 把手、TECTUS / TPEO 传动杆系统",
    },
  ],
  tagline: ["我们的承诺很简单：", "创新与性能交融。尊贵生活，触手可及。"],
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

/** The three figures the band carries, in reading order: the layout gives the
    first two the upper row and the third the row below, with the fourth cell
    left to the photograph. A fourth figure - 98% customer retention - is not
    shown here; there is no cell for it. */
export const STATS = [
  {
    value: 20,
    suffix: "",
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
];

/** The heading keeps its two-line break: the comma is where the layout draws
    the line, in either language. The standfirst is the same claim, not a
    literal rendering - Chinese marketing copy carries "小至...大至" where the
    English runs "ranging from...to". */
export const STATS_INTRO_ZH: Partial<typeof STATS_INTRO> = {
  heading: ["工程创新，", "经各类建筑项目验证"],
  body: "P.A. Group 自 2004 年起从事铝型材挤压生产，与 MEVO 的合作则带来了与之匹配的门窗系统。这一组合已在马来西亚完成超过 10,000 个项目，小至单栋住宅，大至整幢建筑幕墙，并由一支在交付后仍持续跟进的服务团队提供支持。",
};

/** Label and supporting line only. `value` and `suffix` are carried over from
    STATS rather than repeated: the figures are the same figures, and the
    counter in Stats.tsx animates to them in either language. "10k+" is left as
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
];

/** A whole replacement array rather than a partial overlay: STATS is a bare
    array, so there is no key for `useCopy` to merge on. Stats.tsx picks between
    the two on the locale directly. */
export const STATS_ZH: typeof STATS = STATS.map((stat, i) => ({
  ...stat,
  ...STATS_TEXT_ZH[i],
}));

/** Was "To Get More Details", which is not idiomatic and read as a sentence
    fragment where /contact uses it as an <h2>. */
export const CTA = "Speak to our team";
export const CTA_ZH = "联系我们的团队";

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

export const SERVICES = {
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
  /* Was untranslated, so the ZH panel labels read "Our Services [01]". */
  heading: "我们的服务",
  items: SERVICES.items.map((item, i) => ({ ...item, ...SERVICES_ITEMS_ZH[i] })),
};

export const PROJECTS = {
  heading: "Our Projects",
  blurb:
    "From homes to commercial spaces, explore aluminium windows and doors crafted for every unique project.",
  /** Points at a page that does not exist yet; the link ships ahead of it. */
  cta: { label: "Contact us", href: "/contact" },
  /** Names each tile's lightbox trigger. Held here rather than written into the
      markup because it is a sentence, and a sentence half in the component and
      half in a data file cannot be translated. Same pattern as
      PRODUCTS_PAGE.cta.aria. */
  openLabel: (project: string) => `Open ${project}`,
  /** Six photographs, and the live site's own tile names for them: PROJECT 1
      through PROJECT 6, no captions.

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
    { src: "/products/01.jpg", label: "Project 1", alt: "Living room with a tall dark-framed casement window opening onto a misty pine forest", width: 2560, height: 1706 },
    { src: "/products/03.jpg", label: "Project 2", alt: "Freestanding glass sunroom with a dark aluminium gable frame, standing on lit stone steps in an evening garden", width: 2560, height: 1792 },
    { src: "/products/05-1.jpg", label: "Project 3", alt: "Minimal lounge with a full-height two-panel panoramic door opening onto a lake ringed by mountains", width: 2560, height: 1844 },
    { src: "/products/07.jpg", label: "Project 4", alt: "Poolside living room with a combined door and window system, a screened side panel and a small opening casement", width: 2560, height: 1785 },
    { src: "/products/15.jpg", label: "Project 5", alt: "Pale seaside room with an ultra-slim four-panel sliding door framing a rocky shore", width: 2048, height: 1536 },
    { src: "/products/18.jpg", label: "Project 6", alt: "Modern white house entrance with a ribbed charcoal entry door, a slim sidelight and a lit wall sconce", width: 2560, height: 1920 },
  ],
};

/** Tile labels only. Each photograph's `src`, `alt` and intrinsic size are
    carried over from PROJECTS: the alt text describes the picture and is held
    in step with lib/products.ts by hand, so it stays in one place and in one
    language rather than being copied into a second list that could drift.
    `openLabel` reads "查看" - view - rather than a literal "open", which is
    what a Chinese reader expects of a control that enlarges a photograph. */
export const PROJECTS_ZH: Partial<typeof PROJECTS> = {
  heading: "我们的项目",
  blurb:
    "从住宅到商业空间，探索为每一个独特项目量身打造的铝合金门窗。",
  /* href too, not just the label: this pointed a Chinese reader at /contact. */
  cta: { ...PROJECTS.cta, label: "联系我们", href: zhPath(PROJECTS.cta.href) },
  openLabel: (project: string) => `查看${project}`,
  images: PROJECTS.images.map((image, i) => ({
    ...image,
    label: `项目 ${i + 1}`,
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
  /** Names the catalogue section for screen readers. The h1 above it already
      names the page, so this heading is not repeated visually. */
  catalogLabel: "Product catalog",
  /** Prefaces the thumbnail strip on products photographed more than once. */
  viewsLabel: "Views",
  /** Names the list/grid switch for screen readers. */
  viewLabel: "Catalog layout",
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
  catalogLabel: "产品目录",
  viewsLabel: "视图",
  viewLabel: "目录布局",
  cta: {
    label: "联系我们",
    href: "/zh/contact",
    aria: (product: string) => `就 ${product} 联系我们`,
  },
};
