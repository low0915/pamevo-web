/**
 * Single source of truth for every visible string on the page.
 * Copy is taken verbatim from paprojects.com.my, including its own casing
 * and spelling. Lorem Ipsum and template attributions are deliberately absent.
 */

/** `href` is set only on pages that actually exist. Everything else stays an
    inert placeholder until its route is built. */
export type NavItem = { label: string; href?: string; children?: { label: string }[] };

export const NAV: NavItem[] = [
  { label: "Our Products", href: "/our-products" },
  { label: "Contact" },
];

export const LOCALES = ["EN", "ZH"] as const;

/** Deep link to the sales WhatsApp. Same number as FOOTER.phone, written in the
    international format the api.whatsapp.com endpoint expects. */
export const WHATSAPP = {
  url: "https://api.whatsapp.com/send/?phone=60148797371",
  label: "Chat on WhatsApp",
};

/** The logo is a co-branded lockup: P.A. PROJECTS x MEVO. */
export const LOGO_ALT = "P.A. Projects and MEVO";

/**
 * Head copy: the browser tab and the search result, not the page body. It sits
 * with the rest of the copy because it is still copy, and because a title that
 * drifts from the page it names is worse than one written in the wrong file.
 *
 * Titles stay under ~60 characters, where Google truncates them, and lead
 * with what people actually search for — aluminium windows and doors, in
 * Malaysia — rather than with the brand, which has no search volume yet.
 *
 * home.description is the client's own sentence and runs well past the ~160
 * characters a result snippet shows. It is carried whole rather than cut:
 * Google rewrites snippets per query regardless, and the full claim is the
 * one the client wants quoted. products.description is written to fit.
 */
export const SEO = {
  /** Pages supply their own half; this appends the brand. See app/layout.tsx. */
  titleTemplate: "%s | MEVO Malaysia",
  home: {
    title: "Aluminium Windows & Doors Malaysia | MEVO Malaysia",
    description:
      "MEVO Malaysia isn’t just another window brand — it’s the result of pairing one of China’s Top 10 Aluminium Window & Door Systems with Malaysia’s aluminium manufacturing leader, P.A. Projects, a member of the publicly listed P.A. Resources Group.",
  },
  products: {
    title: "Aluminium Window & Door Systems",
    description:
      "Browse 20 MEVO window and door systems: casement, awning, sliding and panoramic windows, bifold and entry doors, sunrooms and aluminium-clad wood. Full specs.",
  },
};

export const HERO = {
  wordmark: "MEVO MALAYSIA",
  tagline: "Innovation. Performance. Affordable.",
  /** The tagline split for the scroll-driven reveal. Same words, same order. */
  taglineWords: ["Innovation.", "Performance.", "Affordable."],
  subheading:
    "Redefining Modern Living Through High-Performance Window & Door Systems",
  imageAlt: "Modern architecture with a white geometric facade against the sky",
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
  paragraphs: [
    "Established in 2004 and listed on the Main Market of Bursa Malaysia in 2006; P.A. Resources Berhad (P.A. Group) is a leading Malaysian company in aluminium architectural and industrial applications. With over 30 years of proven expertise, the Group has grown from a specialised aluminium extruder into a vertically integrated industrial group. Our operations encompass billet smelting, tool and die design, precision extrusion, surface treatment, and solar energy solutions. Headquartered in Kuala Selangor, P.A. Group is widely recognised across the region for its quality, leadership, and expertise in the aluminium industry.",
    "In addition, P.A. Group has established an in-depth strategic partnership with MEVO Doors & Windows, a renowned Chinese window and door brand, which serves as our key overseas supplier for window and door products. Specialized in the R&D and manufacturing of energy-saving and low-carbon windows and doors, MEVO operates two major operational centres in East China and South China, providing strong support for the Group's global window and door business",
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
        "First Local Manufacturer & Seller",
        "Trusted & Reliable After-Sales Services",
        "Try before You Buy",
        "Up to 15 Years Warranty",
      ],
    },
    {
      /** Exactly ten items, matching the nav entry of the same name. */
      title: "Our 10 Core USP",
      items: [
        "Silent Living Lifestyle (Sound Reduction 43dB)",
        "Heat Reduction Lifestyle (Level 8 1.5W / m²K)",
        "Energy Efficiency",
        "Superior Water Tightness (Level 6, ≥700 Pa)",
        "UV Protection Technology",
        "Superior Safety Performance",
        "Innovation & Modern Design",
        "Premium Quality with Up to 15 - Years Warranty",
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
        "Thermal Insulation Level 8 (1.5W/ m²k, CRF ≥75)",
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

export const CTA = "To Get More Details";

/**
 * Retained, not rendered. The eleven-point bento section that used this was
 * removed once the Why Choose panel took over that role. Kept so the copy is
 * not lost with it.
 */
export const USP = {
  heading: "Why Choose MEVO Malaysia",
  clusters: [
    {
      name: "Quality & Systems",
      items: [
        "Reliable Quality Standards",
        "Premium International Window & Door Systems",
        "Modern Architectural Design Solutions",
        "Complete Architectural Living Solutions",
      ],
    },
    {
      name: "Performance & Climate",
      items: [
        "Heat Reduction & Energy Efficiency Performance",
        "Tropical climate performance",
        "Affordable Luxury Without Compromise",
      ],
    },
    {
      name: "Delivery & Support",
      items: [
        "Professional Design-to-Installation Services",
        "Residential, Commercial & Industrial Expertise",
        "Trusted Project Delivery & Technical Support",
        "End-to-End Solution Provider",
      ],
    },
  ],
};

export const SERVICES = {
  heading: "our Services",
  /** One photograph per service. The pinned runway shows exactly one pair at a
      time, so each image has to carry its service on its own. */
  items: [
    {
      title: "architectural consultation",
      body: "We provide professional consultation to understand your design requirements, project needs, and performance expectations for homeowners, architects, interior designers and developers.",
      image: {
        src: "/services/01.jpg",
        alt: "Two people reading a printed floor plan across a table",
      },
    },
    {
      title: "custom Design & system Selection",
      body: "Every project is unique. Our team provides customized solutions to match architectural concepts and lifestyle requirements.",
      image: {
        src: "/services/02.jpg",
        alt: "A window system held open at its cross-section while a hand points at the profile",
      },
    },
    {
      title: "Supply & project Solution",
      body: "From small residential projects to large developments, MEVO MALAYSIA provides reliable supply solutions with professional project coordination.",
      image: {
        src: "/services/03.jpg",
        alt: "Racked lengths of extruded metal stock in an industrial warehouse",
      },
    },
    {
      title: "Installation & Technical Support",
      body: "Our professional installation team which is Certified MEVO Installers ensures every system performs according to design expectations.",
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

export const PROJECTS = {
  heading: "Our Projects",
  /** Six curated photographs. The live site shows six untitled tiles and adds no captions. */
  /** Labels are the live site's own tile names: PROJECT 1 through PROJECT 6. */
  images: [
    { src: "/projects/01.jpg", label: "Project 1", alt: "Geometric facade of a modern skyscraper" },
    { src: "/projects/02.jpg", label: "Project 2", alt: "Glass building facade with a repeating geometric pattern" },
    { src: "/projects/03.jpg", label: "Project 3", alt: "Modern building with a glazed facade and columns" },
    { src: "/projects/04.jpg", label: "Project 4", alt: "Black framed windows in a minimalist interior" },
    { src: "/projects/05.jpg", label: "Project 5", alt: "Angular facade of a tower with reflective glazing" },
    { src: "/projects/06.jpg", label: "Project 6", alt: "Close view of a building elevation with many windows" },
  ],
};

export const TESTIMONIALS = {
  heading: "testimonial",
  /** The live quotes are template content with placeholder names and invented roles,
      so the section ships as a composed empty state instead. */
  emptyState: {
    line: "Client testimonials are being collected.",
    detail:
      "Completed project references will be published here as they are approved.",
  },
};

export const FOOTER = {
  brand: "MEVO MALAYSIA",
  blurb:
    "We are dedicated to providing innovative solutions that empower businesses to excel in their respective industries.",
  reachHeading: "Reach Out to Us",
  phone: "014 - 879 7371",
  email: "info@paprojects.com.my",
  company: "PA PROJECTS MARKETING SDN BHD (847136-X)",
  address:
    "19, Jalan 15/23, Taman Perindustrian Tiong Nam, Seksyen 15, 40200 Shah Alam, Selangor Darul Ehsan, Malaysia. (Showroom & Office)",
  connectHeading: "Connect with Us",
  socials: ["WhatsApp", "Facebook", "Instagram", "TikTok", "Xiaohongshu"],
  copyright: "\u00a9 2026 MEVO MALAYSIA",
  terms: "Terms and Conditions",
};

/**
 * The /our-products page. The slogan and subheading are the hero's own strings
 * rather than copies: the same two lines carry the brand on both pages, and one
 * source means they can never drift apart.
 */
export const PRODUCTS_PAGE = {
  heading: "Our Products",
  slogan: HERO.tagline,
  subheading: HERO.subheading,
  /** Names the catalogue section for screen readers. The h1 above it already
      names the page, so this heading is not repeated visually. */
  catalogLabel: "Product catalog",
  /** Prefaces the thumbnail strip on products photographed more than once. */
  viewsLabel: "Views",
  /** Names the list/grid switch for screen readers. */
  viewLabel: "Catalog layout",
};
