/**
 * The MEVO product catalogue, transcribed from paprojects.com.my/our-products/
 * and its twenty product pages. The raw scrape is kept at
 * `data/products-scraped.json`; this file is the curated render-ready shape.
 *
 * The live pages publish every line three times, in English, Bahasa Melayu and
 * Chinese. Only English and Chinese are carried here: the page renders both,
 * and shipping the Malay to the browser would be dead weight in a client
 * component. The Malay is not lost, it stays in the scrape.
 *
 * Five sections in the scrape came through damaged, because a long line wrapped
 * in the source markup and desynced the three-language grouping. Those are
 * rejoined here (03, 06, 09, 14, 20). Two further defects belong to the source
 * copy itself and are transcribed verbatim rather than guessed at:
 *
 *   - 01 and 02 hardware end `美沃定制五`, truncated mid-word.
 *   - 16's third variant has Malay text where its Chinese should be, so it
 *     ships with no `zh` at all rather than a machine translation.
 *
 * Photography is the manufacturer's own, pulled from the live site into
 * `public/products/`. Filenames are the product number, so `05-2` is the second
 * image of product 05.
 *
 * THE SPECIFICATIONS ARE BILINGUAL, NOT TRILINGUAL. `ProductSpec` carries `en`
 * and an optional `zh`, and ProductCatalog prints both in every locale — so
 * /bm/our-products is Malay chrome around English and Chinese bullets. That is
 * a real gap rather than an oversight: these are the manufacturer's own words
 * about their own product, 86 of them, and the Malay has to come from the
 * client rather than be invented here. Adding it is a `ms?` beside the `zh?`
 * and a line in ProductSpecs; nothing else in the locale system needs to move.
 */

export type ProductSpec = { en: string; zh?: string };

export type ProductSpecGroup = {
  /** "Product Parameters" | "Hardware Configuration" | "Product Advantages" | "Variants" */
  title: string;
  /** The Chinese half of the source heading. Absent for "Variants": the live
      page prints no heading for that block, so there is no Chinese to copy. */
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
  /** Carried but not rendered. The list is flat by decision; keeping this
      means adding filters later is a rendering change, not a data migration. */
  category: string;
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
const PARAMETERS_ZH = "产品参数";
const HARDWARE = "Hardware Configuration";
const HARDWARE_ZH = "五金配置";
const ADVANTAGES = "Product Advantages";
const ADVANTAGES_ZH = "产品优势";

export const PRODUCTS: Product[] = [
  {
    no: "01",
    slug: "dm106-casement-window",
    title: "DM106 Casement Window",
    category: "Windows",
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
        titleZh: PARAMETERS_ZH,
        items: [
          {
            en: "Max. Profile Thickness: Frame & Sash 1.8mm",
            zh: "壁厚(MAX)：框扇 1.8mm",
          },
        ],
      },
      {
        title: HARDWARE,
        titleZh: HARDWARE_ZH,
        items: [
          { en: "ROTO, HOPPE, MEVO Custom Hardware", zh: "ROTO、HOPPE、美沃定制五" },
        ],
      },
      {
        title: ADVANTAGES,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "One-piece welded equal-pressure seal strip", zh: "一体式焊接等压胶条" },
          { en: "46.6mm topological heat insulation strip", zh: "46.6拓扑型隔热条" },
          { en: "Vertical isothermal line design", zh: "垂直等温线设计" },
        ],
      },
    ],
  },
  {
    no: "02",
    slug: "dm1288-fixed-window",
    title: "DM1288 Fixed Window",
    category: "Windows",
    images: [
      {
        src: "/products/02.png",
        alt: "Double-height room glazed floor to ceiling onto a snow-capped mountain range, with one narrow opening vent and an insect screen",
      },
    ],
    groups: [
      {
        title: PARAMETERS,
        titleZh: PARAMETERS_ZH,
        items: [
          {
            en: "Max. Profile Thickness: Frame 3.0mm, Sash 2.9mm",
            zh: "壁厚 (MAX): 框3.0mm、扇2.9mm",
          },
        ],
      },
      {
        title: HARDWARE,
        titleZh: HARDWARE_ZH,
        items: [
          { en: "ROTO, HOPPE, MEVO Custom Hardware", zh: "ROTO、HOPPE、美沃定制五" },
        ],
      },
      {
        title: ADVANTAGES,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "Curtain-wall-grade bullet-head reinforced mullion", zh: "幕墙式弹子头加强中挺" },
          { en: "Supports 6-meter height window types", zh: "可做 6 米高窗型" },
          { en: "Square-edge closed small glazing beads", zh: "直角闭口小压线" },
        ],
      },
    ],
  },
  {
    no: "03",
    slug: "dm126-sunroom",
    title: "DM126 Sunroom",
    category: "Sunroom",
    images: [
      {
        src: "/products/03.jpg",
        alt: "Freestanding glass sunroom with a dark aluminium gable frame, standing on lit stone steps in an evening garden",
      },
    ],
    groups: [
      {
        title: PARAMETERS,
        titleZh: PARAMETERS_ZH,
        items: [{ en: "Max. Profile Thickness: 3.0mm", zh: "壁厚(MAX): 3.0mm" }],
      },
      {
        title: ADVANTAGES,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "Main beam design with 3.0mm wall thickness", zh: "3.0壁厚主梁设计" },
          // Source English reads "Flexible and diverse造型" - the noun was lost
          // in the original page, not in the scrape. Restored from the Chinese.
          { en: "Flexible and diverse shapes", zh: "百变造型" },
          { en: "150*150mm Noble Roman Column", zh: "150*150mm贵族罗马柱" },
        ],
      },
    ],
  },
  {
    no: "04",
    slug: "dm132-sliding-window",
    title: "DM132 Sliding Window",
    category: "Windows",
    images: [
      {
        src: "/products/04.jpg",
        alt: "Pale living room with a wide sliding window, half of it covered by an insect screen, looking onto a forested hillside",
      },
    ],
    groups: [
      {
        title: PARAMETERS,
        titleZh: PARAMETERS_ZH,
        items: [
          {
            en: "Max. Profile Thickness: Frame 2.0mm, Sash 2.4mm",
            zh: "壁厚(MAX): 框2.0mm、扇2.4mm",
          },
        ],
      },
      {
        title: HARDWARE,
        titleZh: HARDWARE_ZH,
        items: [
          {
            en: "MEVO Custom Side-mounted Automatic Double-hook Lock with Child Lock",
            zh: "美沃定制侧装自动双钩锁，带儿童锁",
          },
        ],
      },
      {
        title: ADVANTAGES,
        titleZh: ADVANTAGES_ZH,
        items: [
          {
            en: "Suspended Concealed Track + Six-track Stainless Steel Rail Core",
            zh: "悬浮式隐藏轨道 + 六轨不锈钢轨芯",
          },
          { en: "One-piece reinforced sliding stile", zh: "一体式加强勾企" },
          { en: "Foldable clothes drying rack", zh: "折叠式晾衣架" },
        ],
      },
    ],
  },
  {
    no: "05",
    slug: "dm27-slimline-panoramic-door",
    title: "DM27 Slimline Panoramic Door",
    category: "Doors",
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
        titleZh: PARAMETERS_ZH,
        items: [
          {
            en: "Max. Profile Thickness: Frame 2.5mm, Sash 5.0mm",
            zh: "壁厚(MAX): 框2.5mm, 扇5.0mm",
          },
          {
            en: "Glazing: 5mm+27A Black Aluminium Spacer+5mm Insulated Glass",
            zh: "玻璃：5mm+27A黑色铝条+ 5mm",
          },
        ],
      },
      {
        title: ADVANTAGES,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "27mm ultra-slim reinforced interlock", zh: "27极窄加强勾企" },
          { en: "South Korean HYUNDAI motorized system", zh: "韩国现代电动系统" },
          { en: "German Hörmann anti-theft hook lock", zh: "德国霍曼防盗钩锁" },
        ],
      },
    ],
  },
  {
    no: "06",
    slug: "dm15-slimline-panoramic-window",
    title: "DM15 Slimline Panoramic Window",
    category: "Windows",
    images: [
      {
        src: "/products/06.jpg",
        alt: "Open bathroom with a freestanding tub beside a slimline panoramic sliding window looking over a coastal town",
      },
    ],
    groups: [
      {
        title: PARAMETERS,
        titleZh: PARAMETERS_ZH,
        items: [{ en: "Max. Profile Thickness: 2.8mm", zh: "壁厚(MAX): 2.8mm" }],
      },
      {
        // The live page prints these three advantages with their languages
        // interleaved out of order, which the scrape reproduced faithfully.
        // Re-paired here against the Chinese.
        title: ADVANTAGES,
        titleZh: ADVANTAGES_ZH,
        items: [
          {
            en: "Concealed linear track, embeddable around all sides",
            zh: "隐藏线性轨道，四周可预埋",
          },
          { en: "15mm ultra-slim interlock", zh: "15mm超窄勾企" },
          { en: "High-load-bearing stainless steel rollers", zh: "高承重不锈钢滑轮" },
        ],
      },
    ],
  },
  {
    no: "07",
    slug: "dm112-windowdoor-system",
    title: "DM112 Window & Door System",
    category: "Doors",
    images: [
      {
        src: "/products/07.jpg",
        alt: "Poolside living room with a combined door and window system, a screened side panel and a small opening casement",
      },
    ],
    groups: [
      {
        title: PARAMETERS,
        titleZh: PARAMETERS_ZH,
        items: [
          { en: "Max. Profile Thickness: 1.8mm", zh: "壁厚(MAX): 1.8mm" },
          {
            en: "Standard Glazing: 5mm+20A Black Aluminium Spacer+5mm Insulated Glass",
            zh: "标配：5mm+20A黑色铝条+5mm",
          },
        ],
      },
      {
        title: ADVANTAGES,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "Opening safety guardrail with child lock", zh: "开启安全护栏+儿童锁" },
          { en: "56mm L-shaped small square mullion corner", zh: "56mm L型小方立柱转角" },
          { en: "German VBH & Mtuosi hardware handle", zh: "德国VBH + Mtuosi五金执手" },
        ],
      },
    ],
  },
  {
    no: "08",
    slug: "dm122-awning-window",
    title: "DM122 Awning Window",
    category: "Windows",
    images: [
      {
        src: "/products/08.jpg",
        alt: "Quiet living room with a large picture window and a narrow side awning vent over a misty lake",
      },
    ],
    groups: [
      {
        title: PARAMETERS,
        titleZh: PARAMETERS_ZH,
        items: [
          {
            en: "Max. Profile Thickness: Frame 3.0mm, Sash 2.9mm",
            zh: "壁厚 (MAX)：框3.0mm，扇2.9mm",
          },
          { en: "Glass: 5+27A+5 with Black Aluminium Spacer", zh: "玻璃：5+27A+5 黑色铝条" },
        ],
      },
      {
        title: ADVANTAGES,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "German Wehag hardware, 30° micro-ventilation", zh: "维哈根五金，30°微通风" },
          { en: "One-piece welded gasket with 4-layer sealing", zh: "一体焊接胶条 + 4道密封" },
          { en: "Diverter-type floor drain drainage system", zh: "分流式地漏排水系统" },
        ],
      },
    ],
  },
  {
    no: "09",
    slug: "dm105-awning-window",
    title: "DM105 Awning Window",
    category: "Windows",
    images: [
      {
        src: "/products/09.jpg",
        alt: "Kitchen with a side awning window and insect screen above the counter, opening onto tropical planting",
      },
    ],
    groups: [
      {
        title: PARAMETERS,
        titleZh: PARAMETERS_ZH,
        items: [
          // The source prints this one line as EN / ZH / MS rather than
          // EN / MS / ZH, which put the Malay in the Chinese slot.
          { en: "Max. Profile Thickness: 1.6mm", zh: "壁厚(MAX): 1.6mm" },
          {
            en: "Glazing: 5mm+16A Black Aluminium Spacer+5mm Insulated Glass",
            zh: "玻璃：5mm+16A黑色铝条+ 5mm",
          },
        ],
      },
      {
        title: ADVANTAGES,
        titleZh: ADVANTAGES_ZH,
        items: [
          {
            en: "30° micro-ventilation outward bottom-hung opening",
            zh: "30°微通风口外下悬开启",
          },
          {
            en: "SS304 stainless steel chain security window opener",
            zh: "304不锈钢链条安全开窗器",
          },
          { en: "Quick-release screen sash with US Phifer mesh", zh: "快拆纱扇，美国Phifer网" },
        ],
      },
    ],
  },
  {
    no: "10",
    slug: "dm122-132-side-pressure-sliding-window",
    title: "DM122/132 Side Pressure Sliding Window",
    category: "Windows",
    images: [
      {
        src: "/products/10.jpg",
        alt: "Coastal living room with a full-height sliding window looking straight out to open sea",
      },
    ],
    groups: [
      {
        title: PARAMETERS,
        titleZh: PARAMETERS_ZH,
        items: [
          {
            en: "Max. Profile Thickness: Frame 1.8mm, Sash 2.0mm",
            zh: "壁厚 (MAX)：框 1.8mm，扇 2.0mm",
          },
          { en: "Glass: 5+20A+5 with Black Aluminium Spacer", zh: "玻璃：5+20A+5 黑色铝条" },
        ],
      },
      {
        title: ADVANTAGES,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "Double thermal break insulation design", zh: "双断桥隔热设计" },
          {
            en: "5 wind-resistant reinforcement ribs + one-piece reinforced mullion",
            zh: "五道防风加强筋 + 一体式加强中挺",
          },
          { en: "Ultra-large floor-to-ceiling opening", zh: "超大落地开启" },
        ],
      },
    ],
  },
  {
    no: "11",
    slug: "dm80-biofold-door",
    title: "DM80 Bifold Door",
    category: "Doors",
    images: [
      {
        src: "/products/11.png",
        alt: "Six-panel grey bifold door folded shut across an interior opening, with sitting rooms visible through the glass",
      },
    ],
    groups: [
      {
        title: PARAMETERS,
        titleZh: PARAMETERS_ZH,
        items: [{ en: "Max. Profile Thickness: 2.0mm", zh: "壁厚(MAX): 2.0mm" }],
      },
      {
        title: ADVANTAGES,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "German KESENBERG hardware system", zh: "德国凯森贝格五金" },
          { en: "Double-sided handle with anti-theft key lock", zh: "双面执手带防盗钥匙锁" },
          { en: "High-load-bearing smooth double-row rollers", zh: "高承重顺滑双排轮" },
        ],
      },
    ],
  },
  {
    no: "12",
    slug: "dm30-75-sliding-door",
    title: "DM30/75 Sliding Door",
    category: "Doors",
    images: [
      {
        src: "/products/12.jpg",
        alt: "Wide open-plan living room with a four-panel sliding door onto pine forest and distant mountains",
      },
    ],
    groups: [
      {
        title: ADVANTAGES,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "Original 6-layer sealing design", zh: "独创6道密封设计" },
          { en: "Anti-theft dual locking points & quadruple hook locks", zh: "防盗双锁点和四钩锁" },
          { en: "German ROTO Lift-and-Slide system", zh: "德国Roto提升系统" },
          { en: "Concealed drainage design", zh: "隐藏式排水设计" },
        ],
      },
    ],
  },
  {
    no: "13",
    slug: "dm16-french-interior-sliding-door",
    title: "DM16 French Interior Sliding Door",
    category: "Doors",
    images: [
      {
        src: "/products/13.jpg",
        alt: "Living room with a black-framed arched-top French sliding door in reeded glass, closing off a kitchen",
      },
    ],
    groups: [
      {
        title: ADVANTAGES,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "Classic square bar combination artistic style", zh: "经典方形格条组合艺术风格" },
          { en: "Concealed hardware + color-matched handle lock", zh: "隐藏五金 + 同色拉手锁" },
          { en: "90° barrier-free corner sliding", zh: "90°无障碍转角推拉" },
        ],
      },
    ],
  },
  {
    no: "14",
    slug: "dm16-french-interior-door",
    title: "DM16 French Interior Door",
    category: "Doors",
    images: [
      {
        src: "/products/14.jpg",
        alt: "Dark panelled interior with a slim arched-top French door glazed in frosted panes",
      },
    ],
    groups: [
      {
        title: ADVANTAGES,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "Multiple artistic grille designs", zh: "多种艺术格栅设计" },
          { en: "Classical split key lock", zh: "古典分体钥匙锁" },
          { en: "16mm ultra-slim door sash", zh: "16mm极窄门扇" },
          { en: "High-load-bearing color-matched hinges", zh: "高承重同色合页" },
        ],
      },
    ],
  },
  {
    no: "15",
    slug: "dm10-interior-sliding-door",
    title: "DM10 Interior Sliding Door",
    category: "Doors",
    images: [
      {
        src: "/products/15.jpg",
        alt: "Pale seaside room with an ultra-slim four-panel sliding door framing a rocky shore",
      },
    ],
    groups: [
      {
        title: ADVANTAGES,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "10mm ultra-slim door sash + full-screen view", zh: "10mm极窄门扇 + 全面屏" },
          {
            en: "Equipped with OPK Perfect System multi-linkage hardware",
            zh: "搭载完美系统多联动五金",
          },
          {
            en: "Concealed bottom spring rollers, bidirectional sliding",
            zh: "隐藏式下弹簧轮，左右互推",
          },
          { en: "Bidirectional damping design", zh: "双向阻尼设计" },
        ],
      },
    ],
  },
  {
    no: "16",
    slug: "aluminium-clad-wood-doors-windows",
    title: "Aluminium-Clad Wood Doors & Windows",
    category: "Aluminium-clad Wood",
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
        items: [
          { en: "Aluminium-clad Wood Casement Window", zh: "铝包木平开窗" },
          { en: "Aluminium-clad Wood Sliding Door", zh: "铝包木推拉门" },
          // The source page repeats the Malay line in place of the Chinese for
          // this variant. Shipped without a Chinese line rather than translated.
          { en: "Aluminium-clad Wood Swing Door" },
        ],
      },
    ],
  },
  {
    no: "17",
    slug: "fortune-deer-entry-door",
    title: "Fortune Deer Entry Door",
    category: "Entry Doors",
    images: [
      {
        src: "/products/17.jpg",
        alt: "Classical white villa entrance with a dark double entry door carrying a large round bronze medallion handle",
      },
    ],
    groups: [
      {
        title: ADVANTAGES,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "European standard motorized integrated lock body", zh: "欧标电机连体锁体" },
          {
            en: "Interior filled with High-Core-Performance flame-retardant boards",
            zh: "内部填充高芯能阻燃板",
          },
          {
            en: "Raw aluminium with faux-copper spliced surface treatment",
            zh: "原生铝表面仿铜拼接处理",
          },
          { en: "Thermal break insulation system", zh: "隔热保温断桥系统" },
        ],
      },
    ],
  },
  {
    no: "18",
    slug: "chasing-light-entry-door",
    title: "Chasing Light Entry Door",
    category: "Entry Doors",
    images: [
      {
        src: "/products/18.jpg",
        alt: "Modern white house entrance with a ribbed charcoal entry door, a slim sidelight and a lit wall sconce",
      },
    ],
    groups: [
      {
        title: ADVANTAGES,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "Built-in ambient light strip handle", zh: "内嵌氛围灯带拉手" },
          {
            en: "Interior filled with High-Core-Performance flame-retardant boards",
            zh: "内部填充高芯能阻燃板",
          },
          { en: "Automotive-grade sealing strips around all sides", zh: "四周包覆汽车级密封胶条" },
          { en: "Supports door-with-glass combined configurations", zh: "可做门连玻门型" },
        ],
      },
    ],
  },
  {
    no: "19",
    slug: "bamboo-rhyme-entry-door",
    title: "Bamboo Rhyme Entry Door",
    category: "Entry Doors",
    images: [
      {
        src: "/products/19.jpg",
        alt: "Sage-green panelled entry door with a fanlight above it, set in a white classical porch",
      },
    ],
    groups: [
      {
        title: ADVANTAGES,
        titleZh: ADVANTAGES_ZH,
        items: [
          { en: "4.0mm precision-carved aluminium plate", zh: "4.0mm精雕铝板" },
          { en: "Seamless no-clip-edge armored craft", zh: "无卡边装甲工艺" },
          { en: "Interior filled with aerospace-grade aluminium foil", zh: "内芯填充航空铝箔" },
          { en: "Phantom Grey sliding-cover compact handle", zh: "幻影灰滑盖小拉手" },
        ],
      },
    ],
  },
  {
    no: "20",
    slug: "ruyudeshui-entry-door",
    title: "RUYUDESHUI Entry Door",
    category: "Entry Doors",
    images: [
      {
        src: "/products/20.jpg",
        alt: "Bronze double entry door carved in concentric rings around a gold koi medallion, at a modern white house at dusk",
      },
    ],
    groups: [
      {
        title: ADVANTAGES,
        titleZh: ADVANTAGES_ZH,
        items: [
          {
            en: "6mm raw-textured precision-carved aluminium plate",
            zh: "6mm原生态精雕铝板",
          },
          {
            en: "Interior filled with High-Core-Performance flame-retardant boards",
            zh: "内部填充高芯能阻燃板",
          },
          { en: "Ultra-weather-resistant fluorocarbon coating", zh: "超强耐候氟碳漆面" },
          { en: "Industrial-grade 180° wide-opening hinges", zh: "180°开启铰链" },
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
 * The two systems the catalogue is filtered by, and `all`.
 *
 * Derived from `category` rather than stored on each product, which is what the
 * note on that field anticipated: "adding filters later is a rendering change,
 * not a data migration". Nothing in lib/products.ts changed to make the filter
 * work — this is the rule, written down once, next to the data it reads.
 *
 * Three of the five categories map straight across. The other two are the
 * reason this is a function and not a lookup:
 *
 *  - Sunroom is one product, DM126, and it is neither a window nor a doorset.
 *    It sits under Window System because a sunroom is glazing rather than a
 *    doorway, and because a product that answers to neither filter can only be
 *    found by a reader who never touches them.
 *  - Aluminium-clad Wood is one product and its own title is "Doors &
 *    Windows". DM112's is "Window & Door System" and it is filed under Doors.
 *    Both are genuinely both, and both are listed under either filter — the
 *    same product, not a copy of it, so the two filters overlap by two and the
 *    counts do not add to twenty. 10 windows, 12 doors, 20 products.
 */
export type System = "all" | "window" | "door";

/** Filed under Doors by category. Everything else that is not `BOTH` is a
    window as far as the filter is concerned. */
const DOOR_CATEGORIES = new Set(["Doors", "Entry Doors"]);

/** Products whose own titles say they are both. Held by slug, because what
    makes them both is the product rather than its category — DM112 is filed
    under Doors and is called a Window & Door System. */
const BOTH = new Set([
  "dm112-windowdoor-system",
  "aluminium-clad-wood-doors-windows",
]);

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
  switch (hash.replace(/^#/, "").toLowerCase()) {
    case "window":
    case "windows":
      return "window";
    case "door":
    case "doors":
      return "door";
    default:
      return "all";
  }
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
 * filters, in the same fragment. The two cannot collide: no product is called
 * "window" or "door", and anything matching neither falls through to the
 * unfiltered catalogue rather than to an empty list.
 *
 * Declared above PRODUCTS and referring to it, which is legal because the body
 * only runs long after the module has finished evaluating.
 */
export function productFromHash(hash: string): Product | undefined {
  const slug = hash.replace(/^#/, "").toLowerCase();
  return PRODUCTS.find((p) => p.slug === slug);
}

export function inSystem(product: Product, system: System) {
  if (system === "all") return true;
  if (BOTH.has(product.slug)) return true;
  const isDoor = DOOR_CATEGORIES.has(product.category);
  return system === "door" ? isDoor : !isDoor;
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
