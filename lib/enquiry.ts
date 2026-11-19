/**
 * The enquiry form's four dropdowns: where the work is, what stage it is at,
 * where the customer is, and which product range they are after.
 *
 * One table for the form and the API route both. The form shows the label in
 * the reader's language; what it sends is the `id`, which the route checks
 * against this same list and turns back into the English label for the inbox.
 * A value that is not here is refused, so the email only ever carries an
 * option the form actually offered.
 *
 * To change an option, change it here; the form, the validation and the email
 * all follow.
 */
export type EnquiryOption = { id: string; en: string; zh: string; bm: string };

export const ENQUIRY_OPTIONS = {
  installIn: [
    { id: "landed", en: "Landed house", zh: "有地住宅", bm: "Rumah bertanah" },
    { id: "condo", en: "Condominium / Apartment", zh: "公寓", bm: "Kondominium / Pangsapuri" },
    { id: "commercial", en: "Shop office / Commercial", zh: "店屋 / 商业空间", bm: "Kedai pejabat / Komersial" },
    { id: "development", en: "Property development", zh: "房地产发展项目", bm: "Pembangunan hartanah" },
    { id: "other", en: "Other", zh: "其他", bm: "Lain-lain" },
  ],
  projectStatus: [
    { id: "new-build", en: "New build / Under construction", zh: "新建 / 施工中", bm: "Binaan baharu / Dalam pembinaan" },
    { id: "renovation", en: "Renovation", zh: "翻新", bm: "Pengubahsuaian" },
    { id: "replacement", en: "Replacing existing windows or doors", zh: "更换现有门窗", bm: "Menggantikan tingkap atau pintu sedia ada" },
    { id: "planning", en: "Still planning", zh: "仍在规划中", bm: "Masih merancang" },
  ],
  location: [
    { id: "selangor", en: "Selangor", zh: "雪兰莪", bm: "Selangor" },
    { id: "kuala-lumpur", en: "Kuala Lumpur", zh: "吉隆坡", bm: "Kuala Lumpur" },
    { id: "putrajaya", en: "Putrajaya", zh: "布城", bm: "Putrajaya" },
    { id: "negeri-sembilan", en: "Negeri Sembilan", zh: "森美兰", bm: "Negeri Sembilan" },
    { id: "melaka", en: "Melaka", zh: "马六甲", bm: "Melaka" },
    { id: "johor", en: "Johor", zh: "柔佛", bm: "Johor" },
    { id: "pahang", en: "Pahang", zh: "彭亨", bm: "Pahang" },
    { id: "perak", en: "Perak", zh: "霹雳", bm: "Perak" },
    { id: "penang", en: "Penang", zh: "槟城", bm: "Pulau Pinang" },
    { id: "kedah", en: "Kedah", zh: "吉打", bm: "Kedah" },
    { id: "perlis", en: "Perlis", zh: "玻璃市", bm: "Perlis" },
    { id: "kelantan", en: "Kelantan", zh: "吉兰丹", bm: "Kelantan" },
    { id: "terengganu", en: "Terengganu", zh: "登嘉楼", bm: "Terengganu" },
    { id: "sabah", en: "Sabah", zh: "沙巴", bm: "Sabah" },
    { id: "sarawak", en: "Sarawak", zh: "砂拉越", bm: "Sarawak" },
    { id: "labuan", en: "Labuan", zh: "纳闽", bm: "Labuan" },
    { id: "outside", en: "Outside Malaysia", zh: "马来西亚境外", bm: "Luar Malaysia" },
  ],
  /** The catalogue's own five ranges, in the catalogue's own words. */
  product: [
    { id: "window", en: "Window Systems", zh: "窗系统", bm: "Sistem Tingkap" },
    { id: "door", en: "Door Systems", zh: "门系统", bm: "Sistem Pintu" },
    { id: "interior", en: "Interior Door Systems", zh: "室内门系统", bm: "Sistem Pintu Dalaman" },
    { id: "entrance", en: "Entrance Door Systems", zh: "入户门系统", bm: "Sistem Pintu Masuk" },
    { id: "special", en: "Sunroom & Special Systems", zh: "阳光房与特色系统", bm: "Sistem Rumah Kaca & Khas" },
    { id: "unsure", en: "Not sure yet", zh: "尚未确定", bm: "Belum pasti" },
  ],
} satisfies Record<string, EnquiryOption[]>;

export type EnquirySelect = keyof typeof ENQUIRY_OPTIONS;

/** The dropdowns in the order the form shows them. */
export const ENQUIRY_SELECTS: EnquirySelect[] = [
  "installIn",
  "projectStatus",
  "location",
  "product",
];

/**
 * One product, as the optional "which product" dropdown needs it: the slug it
 * sends, the range it belongs to (an id from `product` above) and its name in
 * each language.
 *
 * Built on the server by `enquiryModels()` in lib/products.ts and passed to the
 * form as a prop, so the browser gets twenty names rather than the whole
 * specification catalogue.
 */
export type EnquiryModel = {
  slug: string;
  range: string;
  en: string;
  zh: string;
  bm: string;
};

/** The English label for an id, or undefined when the id is not on the list. */
export function enquiryLabel(field: EnquirySelect, id: string) {
  return ENQUIRY_OPTIONS[field].find((option) => option.id === id)?.en;
}
