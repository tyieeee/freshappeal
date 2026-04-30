"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "lowercase letters, numbers, hyphens only"),
  description: z.string().min(1),
  price: z.number().int().nonnegative(),
  category: z.enum(["hoodies", "tees", "caps", "men", "women", "new"]),
  sizes: z.array(z.string()).min(1),
  stock: z.record(z.string(), z.number().int().nonnegative()),
  // Allow both URLs and local paths (e.g. "/cap1.jpeg") and base64 data URIs
  images: z.array(z.string().min(1)).min(1),
  isFeatured: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;

export async function createProduct(input: ProductInput) {
  const data = productSchema.parse(input);
  await prisma.product.create({
    data: {
      ...data,
      sizes: JSON.stringify(data.sizes),
      stock: JSON.stringify(data.stock),
      images: JSON.stringify(data.images),
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function updateProduct(id: string, input: ProductInput) {
  const data = productSchema.parse(input);
  await prisma.product.update({
    where: { id },
    data: {
      ...data,
      sizes: JSON.stringify(data.sizes),
      stock: JSON.stringify(data.stock),
      images: JSON.stringify(data.images),
    },
  });
  revalidatePath("/admin/products");
  revalidatePath(`/product/${data.slug}`);
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function seedShopProducts() {
  const { DEFAULT_SHOP_PRODUCTS } = await import("@/lib/shop-products");
  let createdCount = 0;
  for (const p of DEFAULT_SHOP_PRODUCTS) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) continue;
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        category: p.category,
        sizes: JSON.stringify(p.sizes),
        stock: JSON.stringify(p.stock),
        images: JSON.stringify(p.images),
        isFeatured: p.isFeatured,
      },
    });
    createdCount++;
  }
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return { created: createdCount };
}

export async function setUserRole(userId: string, role: "admin" | "customer") {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth");
  const session = await getServerSession(authOptions);
  const me = session?.user as { id?: string; role?: string } | undefined;
  if (me?.role !== "admin") throw new Error("Forbidden");

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("User not found");

  // Prevent demoting yourself if you're the only admin
  if (role === "customer" && target.role === "admin") {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount <= 1) {
      throw new Error("Cannot demote the only admin. Promote another user first.");
    }
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth");
  const session = await getServerSession(authOptions);
  const me = session?.user as { id?: string; email?: string; role?: string } | undefined;
  if (me?.role !== "admin") throw new Error("Forbidden");

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("User not found");
  if (target.email === me.email) throw new Error("You cannot delete your own account");

  if (target.role === "admin") {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount <= 1) {
      throw new Error("Cannot delete the only admin");
    }
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}

export async function updateOrderStatus(id: string, status: string) {
  if (!["pending", "shipped", "delivered", "cancelled"].includes(status)) {
    throw new Error("Invalid status");
  }
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
}
