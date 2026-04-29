import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const sampleProducts = [
  {
    name: "Neon Pulse Hoodie",
    slug: "neon-pulse-hoodie",
    description:
      "Heavyweight 400gsm cotton hoodie with embroidered neon green logo. Drop shoulder, oversized fit. Built for the streets.",
    price: 8900,
    category: "men",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: { S: 8, M: 12, L: 15, XL: 10, XXL: 4 },
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200",
    ],
    isFeatured: true,
  },
  {
    name: "Fresh Logo Tee — Black",
    slug: "fresh-logo-tee-black",
    description:
      "Premium 240gsm boxy-fit tee. Screen-printed logo at chest. 100% organic cotton.",
    price: 3500,
    category: "men",
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 20, M: 25, L: 18, XL: 9 },
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200",
    ],
    isFeatured: true,
  },
  {
    name: "Culture Cap",
    slug: "culture-cap",
    description:
      "Six-panel structured cap with raised neon embroidery. Adjustable strap back.",
    price: 2800,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 30 },
    images: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=1200",
    ],
    isFeatured: true,
  },
  {
    name: "Street Crop Tee",
    slug: "street-crop-tee",
    description:
      "Cropped boxy fit, raw hem. Heavyweight cotton with reflective back graphic.",
    price: 4200,
    category: "women",
    sizes: ["XS", "S", "M", "L"],
    stock: { XS: 6, S: 14, M: 11, L: 7 },
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200",
    ],
    isFeatured: false,
  },
  {
    name: "Beard Mafia Hoodie",
    slug: "beard-mafia-hoodie",
    description:
      "Signature drop. Front and back bearded silhouette graphic. Limited run of 200.",
    price: 9900,
    category: "new",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: { S: 3, M: 5, L: 4, XL: 2, XXL: 1 },
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200",
    ],
    isFeatured: true,
  },
  {
    name: "Fresh Snapback",
    slug: "fresh-snapback",
    description:
      "Flat-brim snapback with embroidered Fresh wordmark. Six-panel structured crown, adjustable plastic snap closure.",
    price: 3200,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 40 },
    images: [
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=1200",
    ],
    isFeatured: true,
  },
  {
    name: "Dad Cap — Washed Black",
    slug: "dad-cap-washed-black",
    description:
      "Low-profile washed cotton dad cap. Curved brim, fabric strap with metal slider buckle. Soft, broken-in fit.",
    price: 2600,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 35 },
    images: [
      "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=1200",
    ],
    isFeatured: false,
  },
  {
    name: "Trucker Cap — Mesh Back",
    slug: "trucker-cap-mesh-back",
    description:
      "Classic five-panel trucker with foam front and mesh back. Snap closure. Embroidered logo patch.",
    price: 2800,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 28 },
    images: [
      "https://images.unsplash.com/photo-1620231150891-29d62fdb6f6b?w=1200",
    ],
    isFeatured: false,
  },
  {
    name: "Beanie — Heavy Knit",
    slug: "beanie-heavy-knit",
    description:
      "Heavyweight ribbed knit beanie with woven label. Cuffed for that street-ready slouch.",
    price: 2400,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 22 },
    images: [
      "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=1200",
    ],
    isFeatured: false,
  },
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@fresh.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const hashed = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { hashedPassword: hashed, role: "admin" },
    create: {
      email: adminEmail,
      name: "Fresh Admin",
      hashedPassword: hashed,
      role: "admin",
    },
  });
  console.log(`✓ Admin seeded: ${adminEmail} / ${adminPassword}`);

  for (const p of sampleProducts) {
    const data = {
      ...p,
      sizes: JSON.stringify(p.sizes),
      stock: JSON.stringify(p.stock),
      images: JSON.stringify(p.images),
    };
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: data,
    });
  }
  console.log(`✓ ${sampleProducts.length} products seeded`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
