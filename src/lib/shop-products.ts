import type { ProductInput } from "@/app/admin/actions";

/**
 * Default catalog used to seed the database. Once products exist in the DB,
 * the admin / shop / product pages all read from the DB so changes persist.
 */
export const DEFAULT_SHOP_PRODUCTS: (ProductInput & { slug: string })[] = [
  {
    name: "Beard Mafia Hoodie",
    slug: "beard-mafia-hoodie",
    description:
      "Premium heavyweight hoodie with oversized fit. Garment-washed for that broken-in feel from day one. Drop-shoulder cut for an effortless street silhouette.",
    price: 8500,
    category: "hoodies",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: { S: 8, M: 12, L: 10, XL: 8, XXL: 5 },
    images: ["/jacket.jpeg"],
    isFeatured: true,
  },
  {
    name: "Fresh Logo Tee",
    slug: "fresh-logo-tee",
    description:
      "Premium 400gsm cotton t-shirt with screen-printed logo. Pre-shrunk and garment-washed for comfort. Limited numbered run.",
    price: 3500,
    category: "tees",
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: { XS: 15, S: 20, M: 25, L: 20, XL: 15 },
    images: ["/tshirt.png"],
    isFeatured: true,
  },
  {
    name: "Fresh Snapback",
    slug: "fresh-snapback",
    description:
      "Six-panel structured cap with raised embroidery. Adjustable snapback closure. One size fits all.",
    price: 2600,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 20 },
    images: ["/cap1.jpeg"],
    isFeatured: true,
  },
  {
    name: "Culture Cap",
    slug: "culture-cap",
    description:
      "Low-profile dad cap with curved brim. Embroidered logo. Adjustable strap closure.",
    price: 2800,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 18 },
    images: ["/cap2.jpeg"],
    isFeatured: true,
  },
  {
    name: "Classic Cap",
    slug: "classic-cap",
    description:
      "Low-profile dad cap with curved brim. Classic silhouette with premium construction.",
    price: 2600,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 35 },
    images: ["/collection1.jpeg"],
    isFeatured: false,
  },
  {
    name: "Heritage Cap",
    slug: "heritage-cap",
    description:
      "Heritage embroidered six-panel cap. Premium build with structured crown.",
    price: 3200,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 25 },
    images: ["/collection2.jpeg"],
    isFeatured: true,
  },
  {
    name: "Street Cap",
    slug: "street-cap",
    description:
      "Adjustable street cap with flat brim. Clean minimal branding.",
    price: 2400,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 30 },
    images: ["/collection3.jpeg"],
    isFeatured: false,
  },
  {
    name: "Premium Cap",
    slug: "premium-cap",
    description: "Premium structured snapback with raised embroidery detail.",
    price: 2900,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 22 },
    images: ["/collection4.jpeg"],
    isFeatured: false,
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  hoodies: "Hoodies",
  tees: "Tees",
  caps: "Caps",
  men: "Men",
  women: "Women",
  new: "New Drops",
};
