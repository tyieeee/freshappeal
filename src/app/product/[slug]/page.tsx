import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { deserializeProduct, type ProductView } from "@/lib/utils";
import { ProductDetail } from "@/components/product-detail";

export const dynamic = "force-dynamic";

const STATIC_DATE = new Date("2024-01-01");

const mockProducts: ProductView[] = [
  { id: "h1", name: "Beard Mafia Hoodie", slug: "beard-mafia-hoodie", description: "Premium heavyweight hoodie with oversized fit. Garment-washed for that broken-in feel from day one. Drop-shoulder cut for an effortless street silhouette.", price: 8500, category: "hoodies", sizes: ["S", "M", "L", "XL", "XXL"], stock: { S: 8, M: 12, L: 10, XL: 8, XXL: 5 }, images: ["/jacket.jpeg"], isFeatured: true, createdAt: STATIC_DATE },
  { id: "t1", name: "Fresh Logo Tee", slug: "fresh-logo-tee", description: "Premium 400gsm cotton t-shirt with screen-printed logo. Pre-shrunk and garment-washed for comfort. Limited numbered run.", price: 3500, category: "tees", sizes: ["XS", "S", "M", "L", "XL"], stock: { XS: 15, S: 20, M: 25, L: 20, XL: 15 }, images: ["/tshirt.png"], isFeatured: true, createdAt: STATIC_DATE },
  { id: "c1", name: "Fresh Snapback", slug: "fresh-snapback", description: "Six-panel structured cap with raised embroidery. Adjustable snapback closure. One size fits all.", price: 2600, category: "caps", sizes: ["OS"], stock: { OS: 20 }, images: ["/cap1.jpeg"], isFeatured: true, createdAt: STATIC_DATE },
  { id: "c2", name: "Culture Cap", slug: "culture-cap", description: "Low-profile dad cap with curved brim. Embroidered logo. Adjustable strap closure.", price: 2800, category: "caps", sizes: ["OS"], stock: { OS: 18 }, images: ["/cap2.jpeg"], isFeatured: true, createdAt: STATIC_DATE },
  { id: "c3", name: "Classic Cap", slug: "classic-cap", description: "Low-profile dad cap with curved brim. Classic silhouette with premium construction.", price: 2600, category: "caps", sizes: ["OS"], stock: { OS: 35 }, images: ["/collection1.jpeg"], isFeatured: false, createdAt: STATIC_DATE },
  { id: "c4", name: "Heritage Cap", slug: "heritage-cap", description: "Heritage embroidered six-panel cap. Premium build with structured crown.", price: 3200, category: "caps", sizes: ["OS"], stock: { OS: 25 }, images: ["/collection2.jpeg"], isFeatured: true, createdAt: STATIC_DATE },
  { id: "c5", name: "Street Cap", slug: "street-cap", description: "Adjustable street cap with flat brim. Clean minimal branding.", price: 2400, category: "caps", sizes: ["OS"], stock: { OS: 30 }, images: ["/collection3.jpeg"], isFeatured: false, createdAt: STATIC_DATE },
  { id: "c6", name: "Premium Cap", slug: "premium-cap", description: "Premium structured snapback with raised embroidery detail.", price: 2900, category: "caps", sizes: ["OS"], stock: { OS: 22 }, images: ["/collection4.jpeg"], isFeatured: false, createdAt: STATIC_DATE },
  { id: "m1", name: "Fresh Snapback", slug: "fresh-snapback-m", description: "Six-panel structured cap with raised embroidery.", price: 2600, category: "caps", sizes: ["OS"], stock: { OS: 20 }, images: ["/cap1.jpeg"], isFeatured: false, createdAt: STATIC_DATE },
  { id: "m2", name: "Beard Mafia", slug: "beard-mafia", description: "Premium jacket with oversized fit.", price: 8500, category: "men", sizes: ["S", "M", "L", "XL"], stock: { S: 10, M: 12, L: 8, XL: 6 }, images: ["/jacket.jpeg"], isFeatured: false, createdAt: STATIC_DATE },
  { id: "m3", name: "Fresh Logo", slug: "fresh-logo", description: "Premium cotton t-shirt with screen-printed logo.", price: 3500, category: "women", sizes: ["XS", "S", "M", "L", "XL"], stock: { XS: 15, S: 20, M: 25, L: 20, XL: 15 }, images: ["/tshirt.png"], isFeatured: false, createdAt: STATIC_DATE },
  { id: "m4", name: "Culture Cap", slug: "culture-cap-m", description: "Low-profile dad cap.", price: 2800, category: "caps", sizes: ["OS"], stock: { OS: 18 }, images: ["/cap2.jpeg"], isFeatured: false, createdAt: STATIC_DATE },
];

function findMock(slug: string): ProductView | undefined {
  return mockProducts.find((p) => p.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const p = await prisma.product.findUnique({ where: { slug: params.slug } });
    if (p) return { title: `${p.name} — Fresh Appeal Store`, description: p.description };
  } catch {}
  const mock = findMock(params.slug);
  if (mock) return { title: `${mock.name} — Fresh Appeal Store`, description: mock.description };
  return { title: "Not found" };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  // Prefer database (admin edits), fall back to mock data
  try {
    const dbProduct = await prisma.product.findUnique({ where: { slug: params.slug } });
    if (dbProduct) return <ProductDetail p={deserializeProduct(dbProduct)} />;
  } catch {}

  const mock = findMock(params.slug);
  if (mock) return <ProductDetail p={mock} />;

  notFound();
}
