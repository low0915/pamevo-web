import type { Locale } from "./paths";
import type { EnquiryModel } from "./enquiry";

/**
 * The MEVO product catalogue, transcribed from paprojects.com.my/our-products/
 * and its twenty product pages. The raw scrape is kept at
 * `data/products-scraped.json`; this file is the curated render-ready shape.
 *
 * The live pages publish every line three times, in English, Bahasa Melayu and
 * Chinese, and all three are carried here. Each locale renders ONLY its own
 * language: /our-products is English, /bm/our-products Malay, /zh/our-products
 * Chinese. A missing translation falls back to the English line.
 *
 * The Malay, the Chinese titles and the corrections below were checked against
 * the client's company profile e-catalogue (PA - Mevo (Materials), pages 6–20).
 * The catalogue's own Malay was transcribed with its obvious typos fixed
 * ('Million' for mullion, doubled quotes, 'berpretasi', 'gelangsor', 'German'
 * for Jerman), and DM15's interlock line, which the catalogue copied from DM27
 * as "27mm ... yang diperkukuh", is corrected to 15mm.
 *
 * Five sections in the scrape came through damaged, because a long line wrapped
 * in the source markup and desynced the three-language grouping. Those are
 * rejoined here (03, 06, 09, 14, 20). Two further defects in the live site's
 * copy (01/02 hardware truncated to `美沃定制五`; 16's third variant missing its
 * Chinese) were corrected against the client's company profile e-catalogue,
 * pages 6–20, which gives `美沃定制五金` and `铝包木平开门`.
 *
 * Photography is the manufacturer's own, pulled from the live site into
 * `public/products/`. Filenames are the product number, so `05-2` is the second
 * image of product 05.
 */

export type ProductSpec = { en: string; ms?: string; zh?: string };

export type ProductSpecGroup = {
  /** "Product Parameters" | "Hardware Configuration" | "Product Advantages" | "Variants" */
  title: string;
  titleMs?: string;
  titleZh?: string;
  items: ProductSpec[];
};

export type ProductImage = { src: string; alt: string };

export type Product = {
  /** "01" through "20". Rendered, and the stable key for rows and images. */
  no: string;
  /** The live page's slug. Prefixes the image-layer key. */
  slug: string;
  title: string;
  /** The catalogue's own Malay and Chinese names for the product. */
  titleMs?: string;
  titleZh?: string;
  /** One of CATEGORIES below. Drives the catalogue filter, the header's Our
      Products menu and the "More in" strip on a product page. */
  category: Category;
  /** [0] is the hero shot. 05 has two, 16 has three, the rest one. */
  images: ProductImage[];
  /** One to three groups, in the order the live page prints them. */
  groups: ProductSpecGroup[];
  /**
   * Two or three sentences for the product's own page, and its meta
   * description.
   *
   * Optional, and absent on most products: these are DERIVED from the
   * specification bullets above rather than written from new information —
   * the same facts as prose, so a page has something to be about besides a
   * list. Nothing here may claim anything the spec bullets do not.
   *
   * A product without one still gets a page; `describe()` falls back to
   * stitching the first bullets together. Prose is what lifts a page from
   * "indexed" to "ranks for something other than its model number", so it is
   * worth having the client confirm each one.
   */
  blurb?: string;
};

const PARAMETERS = "Product Parameters";
const PARAMETERS_MS = "Parameter Produk";
const PARAMETERS_ZH = "产品参数";
const HARDWARE = "Hardware Configuration";
const HARDWARE_MS = "Konfigurasi Perkakasan";
const HARDWARE_ZH = "五金配置";
const ADVANTAGES = "Product Advantages";
const ADVANTAGES_MS = "Kelebihan Produk";
const ADVANTAGES_ZH = "产品优势";

export const PRODUCTS: Product[] = [
  {
    no: "01",
    slug: "dm106-casement-window",
    title: "DM106 Casement Window",
    titleMs: "DM106 Tingkap Casement",
    titleZh: "DM106 系统窗",
    category: "Windows Systems",
    /* Derived from this product's own three advantage bullets and its 1.8mm
       frame-and-sash thickness. No claim here is absent from those. */
    blurb:
      "The DM106 is a thermally broken aluminium casement window built on a 46.6mm topological heat insulation strip, with frame and sash profiles up to 1.8mm. A one-piece welded equal-pressure seal strip runs the perimeter unbroken, and the vertical isothermal line design keeps the temperature gradient consistent across the profile — the combination that holds heat out in a tropical climate without giving up the slim sightline. Hardware is ROTO, HOPPE or MEVO's own.",
    images: [
      {
        src: "/products/01.jpg",
        alt: "Living room with a tall dark-framed casement window opening onto a misty pine forest",
      },
    ],
    groups: [
      {
        title: PARAMETERS,
        titleMs: PARAMETERS_MS,
        titleZh: PARAMETERS_ZH,
        items: [
          {
            en: "Max. Profile Thickness: Frame & Sash 1.8mm",
            ms: "Ketebalan Maksimum: Bingkai & Daun 1.8mm",
            zh: "壁厚(MAX)：框扇 1.8mm",
          },
        ],
      },
      {
        title: HARDWARE,
        titleMs: HARDWARE_MS,
        titleZh: HARDWARE_ZH,
        items: [
          { en: "ROTO, HOPPE, MEVO Custom Hardware", ms: "ROTO, HOPPE, Perkakasan Khas MEVO", zh: "ROTO、HOPPE、美沃定制五金" },
        ],
      },
      {
        title: ADVANTAGES,
        titleMs: ADVANTAGES_MS,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "One-piece welded equal-pressure seal strip", ms: "Jalur pengedap tekanan sama kimpalan", zh: "一体式焊接等压胶条" },
          { en: "46.6mm topological heat insulation strip", ms: "Jalur penebat haba topologi 46.6mm", zh: "46.6拓扑型隔热条" },
          { en: "Vertical isothermal line design", ms: "Reka bentuk garisan isotermal menegak", zh: "垂直等温线设计" },
        ],
      },
    ],
  },
  {
    no: "02",
    slug: "dm1288-fixed-window",
    title: "DM1288 Fixed Window",
    titleMs: "DM1288 Tingkap Tetap",
    titleZh: "DM1288 幕墙固定窗",
    category: "Windows Systems",
    images: [
      {
        src: "/products/02.png",
        alt: "Double-height room glazed floor to ceiling onto a snow-capped mountain range, with one narrow opening vent and an insect screen",
      },
    ],
    groups: [
      {
        title: PARAMETERS,
        titleMs: PARAMETERS_MS,
        titleZh: PARAMETERS_ZH,
        items: [
          {
            en: "Max. Profile Thickness: Frame 3.0mm, Sash 2.9mm",
            ms: "Ketebalan Maksimum: Bingkai 3.0mm, Daun 2.9mm",
            zh: "壁厚 (MAX): 框3.0mm、扇2.9mm",
          },
        ],
      },
      {
        title: HARDWARE,
        titleMs: HARDWARE_MS,
        titleZh: HARDWARE_ZH,
        items: [
          { en: "ROTO, HOPPE, MEVO Custom Hardware", ms: "ROTO, HOPPE, Perkakasan Khas MEVO", zh: "ROTO、HOPPE、美沃定制五金" },
        ],
      },
      {
        title: ADVANTAGES,
        titleMs: ADVANTAGES_MS,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "Curtain-wall-grade bullet-head reinforced mullion", ms: "'Mullion' diperkukuh dengan reka bentuk kepala peluru", zh: "幕墙式弹子头加强中挺" },
          { en: "Supports 6-meter height window types", ms: "Menyokong pemasangan tingkap setinggi 6 meter", zh: "可做 6 米高窗型" },
          { en: "Square-edge closed small glazing beads", ms: "'Bead' berkaca jenis tertutup bertepi segi empat", zh: "直角闭口小压线" },
        ],
      },
    ],
  },
  {
    no: "03",
    slug: "dm126-sunroom",
    title: "DM126 Sunroom",
    titleMs: "DM126 Rumah Kaca",
    titleZh: "DM126 阳光房",
    category: "Sunroom & Special Systems",
    images: [
      {
        src: "/products/03.jpg",
        alt: "Freestanding glass sunroom with a dark aluminium gable frame, standing on lit stone steps in an evening garden",
      },
    ],
    groups: [
      {
        title: PARAMETERS,
        titleMs: PARAMETERS_MS,
        titleZh: PARAMETERS_ZH,
        items: [{ en: "Max. Profile Thickness: 3.0mm", ms: "Ketebalan Maksimum: 3.0mm", zh: "壁厚(MAX): 3.0mm" }],
      },
      {
        title: ADVANTAGES,
        titleMs: ADVANTAGES_MS,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "Main beam design with 3.0mm wall thickness", ms: "Reka bentuk rasuk utama dengan ketebalan dinding 3.0mm", zh: "3.0壁厚主梁设计" },
          // Source English reads "Flexible and diverse造型" - the noun was lost
          // in the original page, not in the scrape. Restored from the Chinese.
          { en: "Flexible and diverse shapes", ms: "Reka bentuk yang pelbagai dan fleksibel", zh: "百变造型" },
          { en: "150*150mm Noble Roman Column", ms: "Tiang hiasan kediaman 'Noble Roman' 150*150mm", zh: "150*150mm贵族罗马柱" },
        ],
      },
    ],
  },
  {
    no: "04",
    slug: "dm132-sliding-window",
    title: "DM132 Sliding Window",
    titleMs: "DM132 Tingkap Gelangsar",
    titleZh: "DM132 悬浮推拉窗",
    category: "Windows Systems",
    images: [
      {
        src: "/products/04.jpg",
        alt: "Pale living room with a wide sliding window, half of it covered by an insect screen, looking onto a forested hillside",
      },
    ],
    groups: [
      {
        title: PARAMETERS,
        titleMs: PARAMETERS_MS,
        titleZh: PARAMETERS_ZH,
        items: [
          {
            en: "Max. Profile Thickness: Frame 2.0mm, Sash 2.4mm",
            ms: "Ketebalan Maksimum: Bingkai 2.0mm, Daun 2.4mm",
            zh: "壁厚(MAX): 框2.0mm、扇2.4mm",
          },
        ],
      },
      {
        title: HARDWARE,
        titleMs: HARDWARE_MS,
        titleZh: HARDWARE_ZH,
        items: [
          {
            en: "MEVO Custom Side-mounted Automatic Double-hook Lock with Child Lock",
            ms: "Sistem kunci cangkuk sisi berkembar automatik MEVO dengan kunci keselamatan kanak-kanak",
            zh: "美沃定制侧装自动双钩锁，带儿童锁",
          },
        ],
      },
      {
        title: ADVANTAGES,
        titleMs: ADVANTAGES_MS,
        titleZh: ADVANTAGES_ZH,
        items: [
          {
            en: "Suspended Concealed Track + Six-track Stainless Steel Rail Core",
            ms: "Sistem trek gantung tersembunyi bersama trek rel keluli tahan karat enam salutan",
            zh: "悬浮式隐藏轨道 + 六轨不锈钢轨芯",
          },
          { en: "One-piece reinforced sliding stile", ms: "Batang gelangsar yang diperkukuh sepenuhnya", zh: "一体式加强勾企" },
          { en: "Foldable clothes drying rack", ms: "Rak pengering pakaian boleh lipat", zh: "折叠式晾衣架" },
        ],
      },
    ],
  },
  {
    no: "05",
    slug: "dm27-slimline-panoramic-door",
    title: "DM27 Slimline Panoramic Door",
    titleMs: "DM27 Pintu Panorama",
    titleZh: "DM27 全景门",
    category: "Door Systems",
    images: [
      {
        src: "/products/05-1.jpg",
        alt: "Minimal lounge with a full-height two-panel panoramic door opening onto a lake ringed by mountains",
      },
      {
        src: "/products/05-2.jpg",
        alt: "Cutaway render of the door's recessed floor track, showing the roller carriage and the drainage channel beside it",
      },
    ],
    groups: [
      {
        title: PARAMETERS,
        titleMs: PARAMETERS_MS,
        titleZh: PARAMETERS_ZH,
        items: [
          {
            en: "Max. Profile Thickness: Frame 2.5mm, Sash 5.0mm",
            ms: "Ketebalan Maksimum: Bingkai 2.5mm, Daun 5.0mm",
            zh: "壁厚(MAX): 框2.5mm, 扇5.0mm",
          },
          {
            en: "Glazing: 5mm+27A Black Aluminium Spacer+5mm Insulated Glass",
            ms: "Kaca: 5mm+27A pengasing aluminium hitam+5mm kaca penebat",
            zh: "玻璃：5mm+27A黑色铝条+ 5mm",
          },
        ],
      },
      {
        title: ADVANTAGES,
        titleMs: ADVANTAGES_MS,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "27mm ultra-slim reinforced interlock", ms: "'Interlock' ultra-nipis 27mm yang diperkukuh", zh: "27极窄加强勾企" },
          { en: "South Korean HYUNDAI motorized system", ms: "Sistem motor dari HYUNDAI Korea Selatan", zh: "韩国现代电动系统" },
          { en: "German Hörmann anti-theft hook lock", ms: "Kunci cangkuk anti-ceroboh Hörmann Jerman", zh: "德国霍曼防盗钩锁" },
        ],
      },
    ],
  },
  {
    no: "06",
    slug: "dm15-slimline-panoramic-window",
    title: "DM15 Slimline Panoramic Window",
    titleMs: "DM15 Tingkap Panorama",
    titleZh: "DM15 全景窗",
    category: "Windows Systems",
    images: [
      {
        src: "/products/06.jpg",
        alt: "Open bathroom with a freestanding tub beside a slimline panoramic sliding window looking over a coastal town",
      },
    ],
    groups: [
      {
        title: PARAMETERS,
        titleMs: PARAMETERS_MS,
        titleZh: PARAMETERS_ZH,
        items: [{ en: "Max. Profile Thickness: 2.8mm", ms: "Ketebalan Maksimum: 2.8mm", zh: "壁厚(MAX): 2.8mm" }],
      },
      {
        // The live page prints these three advantages with their languages
        // interleaved out of order, which the scrape reproduced faithfully.
        // Re-paired here against the Chinese.
        title: ADVANTAGES,
        titleMs: ADVANTAGES_MS,
        titleZh: ADVANTAGES_ZH,
        items: [
          {
            en: "Concealed linear track, embeddable around all sides",
            ms: "Trek linear tersembunyi, boleh benam di sekeliling",
            zh: "隐藏线性轨道，四周可预埋",
          },
          { en: "15mm ultra-slim interlock", ms: "'Interlock' ultra-nipis 15mm", zh: "15mm超窄勾企" },
          { en: "High-load-bearing stainless steel rollers", ms: "Roda keluli tahan karat beban tinggi", zh: "高承重不锈钢滑轮" },
        ],
      },
    ],
  },
  {
    no: "07",
    slug: "dm112-windowdoor-system",
    title: "DM112 Window & Door System",
    titleMs: "DM112 Sistem Tingkap & Pintu",
    titleZh: "DM112 门联窗",
    category: "Door Systems",
    images: [
      {
        src: "/products/07.jpg",
        alt: "Poolside living room with a combined door and window system, a screened side panel and a small opening casement",
      },
    ],
    groups: [
      {
        title: PARAMETERS,
        titleMs: PARAMETERS_MS,
        titleZh: PARAMETERS_ZH,
        items: [
          { en: "Max. Profile Thickness: 1.8mm", ms: "Ketebalan Maksimum: 1.8mm", zh: "壁厚(MAX): 1.8mm" },
          {
            en: "Standard Glazing: 5mm+20A Black Aluminium Spacer+5mm Insulated Glass",
            ms: "Kaca Standard: 5mm+20A pengasing aluminium hitam+5mm kaca penebat",
            zh: "标配：5mm+20A黑色铝条+5mm",
          },
        ],
      },
      {
        title: ADVANTAGES,
        titleMs: ADVANTAGES_MS,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "Opening safety guardrail with child lock", ms: "Pagar keselamatan boleh buka beserta kunci keselamatan kanak-kanak", zh: "开启安全护栏+儿童锁" },
          { en: "56mm L-shaped small square mullion corner", ms: "'Mullion' berbentuk L bersaiz 56mm", zh: "56mm L型小方立柱转角" },
          { en: "German VBH & Mtuosi hardware handle", ms: "Pemegang perkakasan VBH & Mtuosi Jerman", zh: "德国VBH + Mtuosi五金执手" },
        ],
      },
    ],
  },
  {
    no: "08",
    slug: "dm122-awning-window",
    title: "DM122 Awning Window",
    titleMs: "DM122 Tingkap Bukaan Luar (Awning)",
    titleZh: "DM122 外开上悬系统窗",
    category: "Windows Systems",
    images: [
      {
        src: "/products/08.jpg",
        alt: "Quiet living room with a large picture window and a narrow side awning vent over a misty lake",
      },
    ],
    groups: [
      {
        title: PARAMETERS,
        titleMs: PARAMETERS_MS,
        titleZh: PARAMETERS_ZH,
        items: [
          {
            en: "Max. Profile Thickness: Frame 3.0mm, Sash 2.9mm",
            ms: "Ketebalan Maksimum: Bingkai 3.0mm, Daun 2.9mm",
            zh: "壁厚 (MAX)：框3.0mm，扇2.9mm",
          },
          { en: "Glass: 5+27A+5 with Black Aluminium Spacer", ms: "Kaca: 5+27A+5 dengan pengasing aluminium hitam", zh: "玻璃：5+27A+5 黑色铝条" },
        ],
      },
      {
        title: ADVANTAGES,
        titleMs: ADVANTAGES_MS,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "German Wehag hardware, 30° micro-ventilation", ms: "Perkakasan Wehag Jerman dilengkapi dengan pengudaraan mikro 30°", zh: "维哈根五金，30°微通风" },
          { en: "One-piece welded gasket with 4-layer sealing", ms: "Jalur pengedap kimpalan sepenuhnya bersama pengedap 4 lapisan", zh: "一体焊接胶条 + 4道密封" },
          { en: "Diverter-type floor drain drainage system", ms: "Sistem saliran perangkap lantai jenis pengalih", zh: "分流式地漏排水系统" },
        ],
      },
    ],
  },
  {
    no: "09",
    slug: "dm105-awning-window",
    title: "DM105 Awning Window",
    titleMs: "DM105 Tingkap Bukaan Luar (Awning)",
    titleZh: "DM105 手摇外悬窗",
    category: "Windows Systems",
    images: [
      {
        src: "/products/09.jpg",
        alt: "Kitchen with a side awning window and insect screen above the counter, opening onto tropical planting",
      },
    ],
    groups: [
      {
        title: PARAMETERS,
        titleMs: PARAMETERS_MS,
        titleZh: PARAMETERS_ZH,
        items: [
          // The source prints this one line as EN / ZH / MS rather than
          // EN / MS / ZH, which put the Malay in the Chinese slot.
          { en: "Max. Profile Thickness: 1.6mm", ms: "Ketebalan Maksimum: 1.6mm", zh: "壁厚(MAX): 1.6mm" },
          {
            en: "Glazing: 5mm+16A Black Aluminium Spacer+5mm Insulated Glass",
            ms: "Kaca: 5mm+16A pengasing aluminium hitam+5mm kaca penebat",
            zh: "玻璃：5mm+16A黑色铝条+ 5mm",
          },
        ],
      },
      {
        title: ADVANTAGES,
        titleMs: ADVANTAGES_MS,
        titleZh: ADVANTAGES_ZH,
        items: [
          {
            en: "30° micro-ventilation outward bottom-hung opening",
            ms: "Pembuka bawah ke bukaan luar dilengkapi dengan pengudaraan mikro 30°",
            zh: "30°微通风口外下悬开启",
          },
          {
            en: "SS304 stainless steel chain security window opener",
            ms: "Pembuka tingkap keselamatan rantai keluli tahan karat SS304",
            zh: "304不锈钢链条安全开窗器",
          },
          { en: "Quick-release screen sash with US Phifer mesh", ms: "Bingkai jaring serangga US Phifer yang mudah tanggal dan bermutu tinggi", zh: "快拆纱扇，美国Phifer网" },
        ],
      },
    ],
  },
  {
    no: "10",
    slug: "dm122-132-side-pressure-sliding-window",
    title: "DM122/132 Side Pressure Sliding Window",
    titleMs: "DM122/132 Tingkap Gelangsar Tekanan Sisi",
    titleZh: "DM122/132 侧压窗",
    category: "Windows Systems",
    images: [
      {
        src: "/products/10.jpg",
        alt: "Coastal living room with a full-height sliding window looking straight out to open sea",
      },
    ],
    groups: [
      {
        title: PARAMETERS,
        titleMs: PARAMETERS_MS,
        titleZh: PARAMETERS_ZH,
        items: [
          {
            en: "Max. Profile Thickness: Frame 1.8mm, Sash 2.0mm",
            ms: "Ketebalan Maksimum: Bingkai 1.8mm, Daun 2.0mm",
            zh: "壁厚 (MAX)：框 1.8mm，扇 2.0mm",
          },
          { en: "Glass: 5+20A+5 with Black Aluminium Spacer", ms: "Kaca: 5+20A+5 dengan pengasing aluminium hitam", zh: "玻璃：5+20A+5 黑色铝条" },
        ],
      },
      {
        title: ADVANTAGES,
        titleMs: ADVANTAGES_MS,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "Double thermal break insulation design", ms: "Reka bentuk penebatan haba berkembar", zh: "双断桥隔热设计" },
          {
            en: "5 wind-resistant reinforcement ribs + one-piece reinforced mullion",
            ms: "5 tulang pengukuh rintangan angin beserta 'mullion' yang diperkukuh",
            zh: "五道防风加强筋 + 一体式加强中挺",
          },
          { en: "Ultra-large floor-to-ceiling opening", ms: "Pembukaan lantai ke siling yang sangat besar", zh: "超大落地开启" },
        ],
      },
    ],
  },
  {
    no: "11",
    slug: "dm80-bifold-door",
    title: "DM80 Bifold Door",
    titleMs: "DM80 Pintu Lipat",
    titleZh: "DM80 折叠门",
    category: "Door Systems",
    images: [
      {
        src: "/products/11.png",
        alt: "Six-panel grey bifold door folded shut across an interior opening, with sitting rooms visible through the glass",
      },
    ],
    groups: [
      {
        title: PARAMETERS,
        titleMs: PARAMETERS_MS,
        titleZh: PARAMETERS_ZH,
        items: [{ en: "Max. Profile Thickness: 2.0mm", ms: "Ketebalan Maksimum: 2.0mm", zh: "壁厚(MAX): 2.0mm" }],
      },
      {
        title: ADVANTAGES,
        titleMs: ADVANTAGES_MS,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "German KESENBERG hardware system", ms: "Sistem perkakasan KESENBERG Jerman", zh: "德国凯森贝格五金" },
          { en: "Double-sided handle with anti-theft key lock", ms: "Pemegang dua sisi bersama kunci anti-ceroboh", zh: "双面执手带防盗钥匙锁" },
          { en: "High-load-bearing smooth double-row rollers", ms: "Roda penggulung dua baris beban tinggi", zh: "高承重顺滑双排轮" },
        ],
      },
    ],
  },
  {
    no: "12",
    slug: "dm30-75-sliding-door",
    title: "DM30/75 Sliding Door",
    titleMs: "DM30/75 Pintu Gelangsar",
    titleZh: "DM30/75 推拉门",
    category: "Door Systems",
    images: [
      {
        src: "/products/12.jpg",
        alt: "Wide open-plan living room with a four-panel sliding door onto pine forest and distant mountains",
      },
    ],
    groups: [
      {
        title: ADVANTAGES,
        titleMs: ADVANTAGES_MS,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "Original 6-layer sealing design", ms: "Reka bentuk 6 lapisan pengedap yang asli", zh: "独创6道密封设计" },
          { en: "Anti-theft dual locking points & quadruple hook locks", ms: "Titik kunci berkembar bersama kunci 4 cangkuk anti-ceroboh", zh: "防盗双锁点和四钩锁" },
          { en: "German ROTO Lift-and-Slide system", ms: "Sistem Angkat-dan-Gelangsar ROTO Jerman", zh: "德国Roto提升系统" },
          { en: "Concealed drainage design", ms: "Reka bentuk saliran tersembunyi", zh: "隐藏式排水设计" },
        ],
      },
    ],
  },
  {
    no: "13",
    slug: "dm16-french-interior-sliding-door",
    title: "DM16 French Interior Sliding Door",
    titleMs: "DM16 Pintu Gelangsar Dalaman Perancis",
    titleZh: "DM16 复古推拉门",
    category: "Interior Door Systems",
    images: [
      {
        src: "/products/13.jpg",
        alt: "Living room with a black-framed arched-top French sliding door in reeded glass, closing off a kitchen",
      },
    ],
    groups: [
      {
        title: ADVANTAGES,
        titleMs: ADVANTAGES_MS,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "Classic square bar combination artistic style", ms: "Gaya seni gabungan bar segi empat klasik", zh: "经典方形格条组合艺术风格" },
          { en: "Concealed hardware + color-matched handle lock", ms: "Perkakasan tersembunyi beserta kunci pemegang sepadan warna", zh: "隐藏五金 + 同色拉手锁" },
          { en: "90° barrier-free corner sliding", ms: "Gelangsar sudut tanpa halangan 90°", zh: "90°无障碍转角推拉" },
        ],
      },
    ],
  },
  {
    no: "14",
    slug: "dm16-french-interior-door",
    title: "DM16 French Interior Door",
    titleMs: "DM16 Pintu Dalaman Perancis",
    titleZh: "DM16 复古平开门",
    category: "Interior Door Systems",
    images: [
      {
        src: "/products/14.jpg",
        alt: "Dark panelled interior with a slim arched-top French door glazed in frosted panes",
      },
    ],
    groups: [
      {
        title: ADVANTAGES,
        titleMs: ADVANTAGES_MS,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "Multiple artistic grille designs", ms: "Pelbagai reka bentuk gril berseni", zh: "多种艺术格栅设计" },
          { en: "Classical split key lock", ms: "Sistem kunci klasik yang berasingan", zh: "古典分体钥匙锁" },
          { en: "16mm ultra-slim door sash", ms: "Daun pintu ultra nipis 16mm", zh: "16mm极窄门扇" },
          { en: "High-load-bearing color-matched hinges", ms: "Engsel sepadan warna beban tinggi", zh: "高承重同色合页" },
        ],
      },
    ],
  },
  {
    no: "15",
    slug: "dm10-interior-sliding-door",
    title: "DM10 Interior Sliding Door",
    titleMs: "DM10 Pintu Gelangsar Dalaman",
    titleZh: "DM10 联动吊门",
    category: "Interior Door Systems",
    images: [
      {
        src: "/products/15.jpg",
        alt: "Pale seaside room with an ultra-slim four-panel sliding door framing a rocky shore",
      },
    ],
    groups: [
      {
        title: ADVANTAGES,
        titleMs: ADVANTAGES_MS,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "10mm ultra-slim door sash + full-screen view", ms: "Daun pintu ultra nipis 10mm dengan kesan skrin penuh", zh: "10mm极窄门扇 + 全面屏" },
          {
            en: "Equipped with OPK Perfect System multi-linkage hardware",
            ms: "Dilengkapi dengan perkakasan pautan berbilang sistem OPK Perfect",
            zh: "搭载完美系统多联动五金",
          },
          {
            en: "Concealed bottom spring rollers, bidirectional sliding",
            ms: "Roda spring bawah tersembunyi, gelangsar dua arah",
            zh: "隐藏式下弹簧轮，左右互推",
          },
          { en: "Bidirectional damping design", ms: "Reka bentuk redaman dua arah", zh: "双向阻尼设计" },
        ],
      },
    ],
  },
  {
    no: "16",
    slug: "aluminium-clad-wood-doors-windows",
    title: "Aluminium-Clad Wood Doors & Windows",
    titleMs: "Pintu & Tingkap Kayu Bersalut Aluminium",
    titleZh: "铝包木门窗",
    category: "Sunroom & Special Systems",
    images: [
      {
        src: "/products/16-1.jpeg",
        alt: "Bedroom with aluminium-clad wood casement windows, one sash tilted open, above a misty mountain valley",
      },
      {
        src: "/products/16-2.jpeg",
        alt: "Double-height living room with an aluminium-clad wood sliding door and screen onto a balcony above a valley",
      },
      {
        src: "/products/16-3.jpeg",
        alt: "Living room with a wide aluminium-clad wood swing door opening onto a landscaped courtyard",
      },
    ],
    groups: [
      {
        title: "Variants",
        titleMs: "Varian",
        titleZh: "款式",
        items: [
          { en: "Aluminium-clad Wood Casement Window", ms: "Tingkap Casement Kayu Bersalut Aluminium", zh: "铝包木平开窗" },
          { en: "Aluminium-clad Wood Sliding Door", ms: "Pintu Gelangsar Kayu Bersalut Aluminium", zh: "铝包木推拉门" },
          { en: "Aluminium-clad Wood Swing Door", ms: "Pintu Kuak / Pintu Ayun Kayu Bersalut Aluminium", zh: "铝包木平开门" },
        ],
      },
    ],
  },
  {
    no: "17",
    slug: "fortune-deer-entry-door",
    title: "Fortune Deer Entry Door",
    titleMs: "Pintu Masuk Fortune Deer",
    titleZh: "财鹿入户门",
    category: "Entrance Door Systems",
    images: [
      {
        src: "/products/17.jpg",
        alt: "Classical white villa entrance with a dark double entry door carrying a large round bronze medallion handle",
      },
    ],
    groups: [
      {
        title: ADVANTAGES,
        titleMs: ADVANTAGES_MS,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "European standard motorized integrated lock body", ms: "Kunci bermotor mengikut piawaian Eropah", zh: "欧标电机连体锁体" },
          {
            en: "Interior filled with High-Core-Performance flame-retardant boards",
            ms: "Ruang dalaman dipenuhi dengan teras papan kalis api berprestasi tinggi",
            zh: "内部填充高芯能阻燃板",
          },
          {
            en: "Raw aluminium with faux-copper spliced surface treatment",
            ms: "Aluminium tulen beserta kemasan tembaga tiruan",
            zh: "原生铝表面仿铜拼接处理",
          },
          { en: "Thermal break insulation system", ms: "Sistem penebatan haba", zh: "隔热保温断桥系统" },
        ],
      },
    ],
  },
  {
    no: "18",
    slug: "chasing-light-entry-door",
    title: "Chasing Light Entry Door",
    titleMs: "Pintu Masuk Chasing Light",
    titleZh: "追光入户门",
    category: "Entrance Door Systems",
    images: [
      {
        src: "/products/18.jpg",
        alt: "Modern white house entrance with a ribbed charcoal entry door, a slim sidelight and a lit wall sconce",
      },
    ],
    groups: [
      {
        title: ADVANTAGES,
        titleMs: ADVANTAGES_MS,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "Built-in ambient light strip handle", ms: "Pemegang pintu berjalur cahaya sedia ada", zh: "内嵌氛围灯带拉手" },
          {
            en: "Interior filled with High-Core-Performance flame-retardant boards",
            ms: "Ruang dalaman dipenuhi dengan teras papan kalis api berprestasi tinggi",
            zh: "内部填充高芯能阻燃板",
          },
          { en: "Automotive-grade sealing strips around all sides", ms: "Sistem pengedap gred automotif di sekeliling bingkai", zh: "四周包覆汽车级密封胶条" },
          { en: "Supports door-with-glass combined configurations", ms: "Menyokong konfigurasi gabungan pintu dengan kaca", zh: "可做门连玻门型" },
        ],
      },
    ],
  },
  {
    no: "19",
    slug: "bamboo-rhyme-entry-door",
    title: "Bamboo Rhyme Entry Door",
    titleMs: "Pintu Masuk Bamboo Rhyme",
    titleZh: "竹韵入户门",
    category: "Entrance Door Systems",
    images: [
      {
        src: "/products/19.jpg",
        alt: "Sage-green panelled entry door with a fanlight above it, set in a white classical porch",
      },
    ],
    groups: [
      {
        title: ADVANTAGES,
        titleMs: ADVANTAGES_MS,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "4.0mm precision-carved aluminium plate", ms: "Plat aluminium ukiran tepat 4.0mm", zh: "4.0mm精雕铝板" },
          { en: "Seamless no-clip-edge armored craft", ms: "Reka bentuk kemasan tepi tanpa klip", zh: "无卡边装甲工艺" },
          { en: "Interior filled with aerospace-grade aluminium foil", ms: "Ruang dalaman dipenuhi dengan lapisan aluminium aeroangkasa berketumpatan tinggi", zh: "内芯填充航空铝箔" },
          { en: "Phantom Grey sliding-cover compact handle", ms: "Pemegang penutup gelangsar berwarna 'Phantom Grey'", zh: "幻影灰滑盖小拉手" },
        ],
      },
    ],
  },
  {
    no: "20",
    slug: "ruyudeshui-entry-door",
    title: "RUYUDESHUI Entry Door",
    titleMs: "Pintu Masuk RUYUDESHUI",
    titleZh: "如鱼得水入户门",
    category: "Entrance Door Systems",
    images: [
      {
        src: "/products/20.jpg",
        alt: "Bronze double entry door carved in concentric rings around a gold koi medallion, at a modern white house at dusk",
      },
    ],
    groups: [
      {
        title: ADVANTAGES,
        titleMs: ADVANTAGES_MS,
        titleZh: ADVANTAGES_ZH,
        items: [
          {
            en: "6mm raw-textured precision-carved aluminium plate",
            ms: "Plat aluminium berukiran persis dengan tekstur kasar berukuran 6mm",
            zh: "6mm原生态精雕铝板",
          },
          {
            en: "Interior filled with High-Core-Performance flame-retardant boards",
            ms: "Ruang dalaman dipenuhi dengan teras papan kalis api berprestasi tinggi",
            zh: "内部填充高芯能阻燃板",
          },
          { en: "Ultra-weather-resistant fluorocarbon coating", ms: "Salutan fluorokarbon ultra tahan cuaca", zh: "超强耐候氟碳漆面" },
          { en: "Industrial-grade 180° wide-opening hinges", ms: "Engsel pembukaan lebar 180° gred industri", zh: "180°开启铰链" },
        ],
      },
    ],
  },
];

/**
 * A product's meta description.
 *
 * Prefers the hand-written `blurb`, trimmed to what a result snippet shows.
 * Falls back to stitching the product's own first bullets together — mechanical,
 * but truthful and unique per product, which is the bar a description has to
 * clear. An absent description is the one case where Google has nothing to
 * rewrite a snippet from.
 */
/**
 * The five categories the client files the catalogue under, in their order.
 * Every product is in exactly one, so the counts add to twenty.
 *
 * `id` is the catalogue filter's value and its URL fragment
 * (/our-products#interior). The labels a reader sees live in lib/content.ts
 * with the rest of the catalogue chrome, in all three languages.
 *
 * Two placements are judgement calls rather than obvious:
 *  - DM112 Window & Door System is a doorset with windows beside it, so it is
 *    filed under Door Systems.
 *  - Aluminium-clad Wood Doors & Windows is a different material system from
 *    the all-aluminium ranges, and is both doors and windows, so it sits under
 *    Sunroom & Special Systems.
 */
export const CATEGORIES = [
  { id: "window", name: "Windows Systems" },
  { id: "door", name: "Door Systems" },
  { id: "interior", name: "Interior Door Systems" },
  { id: "entrance", name: "Entrance Door Systems" },
  { id: "special", name: "Sunroom & Special Systems" },
] as const;

export type Category = (typeof CATEGORIES)[number]["name"];

export type System = "all" | (typeof CATEGORIES)[number]["id"];

/**
 * The catalogue filter as a URL, so a system can be linked to.
 *
 * A HASH rather than a query parameter, and that is a search decision as much
 * as an ergonomic one. `?system=door` would be a second crawlable URL serving
 * a subset of the same twenty products — a near-duplicate of /our-products that
 * would need a canonical to suppress, on a page whose whole design (see the
 * note in lib/schema.ts) is that the catalogue is ONE document. A fragment is
 * never fetched by a crawler and never indexed separately, so /our-products
 * stays the single URL it is meant to be while still being linkable per system.
 *
 * The cost is that the server cannot see it: a fragment is client-only, so the
 * filter can only be applied after hydration. That is why ProductCatalog starts
 * at "all" and moves in an effect rather than initialising from the hash —
 * initialising from it would render one thing on the server and another in the
 * browser, which React treats as a hydration error.
 *
 * Plurals are accepted because people type them, and an unknown fragment falls
 * back to "all" rather than to an empty list — /our-products#anything is still
 * the catalogue.
 */
export function systemFromHash(hash: string): System {
  const key = hash.replace(/^#/, "").toLowerCase();
  /* Plurals and a few obvious synonyms, because people type them. */
  const ALIASES: Record<string, System> = {
    windows: "window",
    doors: "door",
    "interior-door": "interior",
    "interior-doors": "interior",
    entry: "entrance",
    "entry-door": "entrance",
    "entry-doors": "entrance",
    "entrance-door": "entrance",
    "entrance-doors": "entrance",
    sunroom: "special",
  };
  const match = CATEGORIES.find((c) => c.id === key);
  return match ? match.id : (ALIASES[key] ?? "all");
}

/** The inverse, for writing the URL back as the reader filters. "all" is the
    absence of a fragment rather than `#all`, so the unfiltered catalogue keeps
    the clean URL it had before this existed. */
export function systemHash(system: System) {
  return system === "all" ? "" : `#${system}`;
}

/**
 * The product a fragment names, if it names one.
 *
 * Every catalogue row already carries `id={p.slug}`, so a slug is an address
 * the page can be sent to — the same vocabulary `systemFromHash` gives the two
 * filters, in the same fragment. The two cannot collide: no product slug is a
 * category id, and anything matching neither falls through to the
 * unfiltered catalogue rather than to an empty list.
 *
 * Declared above PRODUCTS and referring to it, which is legal because the body
 * only runs long after the module has finished evaluating.
 */
export function productFromHash(hash: string): Product | undefined {
  const slug = hash.replace(/^#/, "").toLowerCase();
  return PRODUCTS.find((p) => p.slug === slug);
}

/**
 * Every product for the enquiry form's optional product dropdown: slug, range
 * id and name in each language, in catalogue order. Server-side, so the form
 * receives these few strings rather than the whole catalogue.
 */
export function enquiryModels(): EnquiryModel[] {
  return PRODUCTS.map((product) => ({
    slug: product.slug,
    range: CATEGORIES.find((c) => c.name === product.category)!.id,
    en: productTitle(product, "EN"),
    zh: productTitle(product, "ZH"),
    bm: productTitle(product, "BM"),
  }));
}

export function inSystem(product: Product, system: System) {
  if (system === "all") return true;
  return CATEGORIES.find((c) => c.id === system)?.name === product.category;
}

/** A spec line, heading or title in one language, falling back to English. */
export function inLocale(
  text: { en: string; ms?: string; zh?: string },
  locale: Locale,
): string {
  if (locale === "BM") return text.ms ?? text.en;
  if (locale === "ZH") return text.zh ?? text.en;
  return text.en;
}

export function productTitle(product: Product, locale: Locale): string {
  return inLocale(
    { en: product.title, ms: product.titleMs, zh: product.titleZh },
    locale,
  );
}

export function groupTitle(group: ProductSpecGroup, locale: Locale): string {
  return inLocale(
    { en: group.title, ms: group.titleMs, zh: group.titleZh },
    locale,
  );
}

export function describe(product: Product, limit = 155): string {
  const source =
    product.blurb ??
    [
      `${product.title}.`,
      ...product.groups.flatMap((group) => group.items.map((item) => item.en)),
    ].join(" ");

  if (source.length <= limit) return source;
  /* Cut on a word, not mid-word, and drop a trailing comma or full stop so the
     ellipsis does not follow punctuation. */
  const cut = source.slice(0, limit - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:]$/, "") + "…";
}

/**
 * The product page's meta description: who sells it, where, and as many of
 * its selling points as fit - never cut mid-phrase, never an ellipsis.
 *
 * Separate from `describe()`, which stitches every bullet together and cuts at
 * a length: fine for structured data, but as a search snippet it read as a
 * run-on spec sheet with no brand and no place in it. This leads with PA
 * Projects (MEVO named only as the partner), ends on Malaysia, and fills the
 * middle with the Advantages bullets, whole ones only. Parameter rows
 * ("Max. Profile Thickness: 2.0mm") are left out - figures, not reasons.
 */
export function metaDescription(product: Product, limit = 155): string {
  const lead = product.title;
  const tail = "Supplied and installed by PA Projects, MEVO's partner in Malaysia.";
  const points = product.groups
    .filter((group) => group.title !== PARAMETERS)
    .flatMap((group) => group.items.map((item) => item.en.trim()))
    .filter((point) => !/^(max\.|glass|glazing)/i.test(point));

  let picked: string[] = [];
  for (const point of points) {
    const next = [...picked, point];
    // Too long to fit whole: skip it and try a shorter one after it.
    if (`${lead}: ${next.join("; ")}. ${tail}`.length > limit) continue;
    picked = next;
  }
  return picked.length ? `${lead}: ${picked.join("; ")}. ${tail}` : `${lead}. ${tail}`;
}

/** The other products in a product's category, for the related strip. */
export function related(product: Product, limit = 4): Product[] {
  return PRODUCTS.filter(
    (other) => other.category === product.category && other.slug !== product.slug,
  ).slice(0, limit);
}

/** Position in PRODUCTS, for the previous/next pair on a detail page. */
export function neighbours(product: Product) {
  const i = PRODUCTS.findIndex((p) => p.slug === product.slug);
  return {
    previous: i > 0 ? PRODUCTS[i - 1] : null,
    next: i < PRODUCTS.length - 1 ? PRODUCTS[i + 1] : null,
  };
}
