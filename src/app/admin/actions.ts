"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "lowercase letters, numbers, hyphens only"),
  description: z.string().min(1),
  price: z.number().int().nonnegative(),
  category: z.enum(["men", "women", "caps", "new"]),
  sizes: z.array(z.string()).min(1),
  stock: z.record(z.string(), z.number().int().nonnegative()),
  images: z.array(z.string().url()).min(1),
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

export async function updateOrderStatus(id: string, status: string) {
  if (!["pending", "shipped", "delivered", "cancelled"].includes(status)) {
    throw new Error("Invalid status");
  }
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
}
