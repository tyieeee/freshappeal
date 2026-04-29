"use server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const orderSchema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string().min(1),
  shippingAddress: z.object({
    line1: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postal: z.string().min(1),
    country: z.string().min(1),
  }),
  items: z
    .array(
      z.object({
        productId: z.string(),
        name: z.string(),
        size: z.string(),
        qty: z.number().int().positive(),
        price: z.number().int().nonnegative(),
      }),
    )
    .min(1),
});

export type CreateOrderInput = z.infer<typeof orderSchema>;

export async function createOrder(input: CreateOrderInput) {
  const data = orderSchema.parse(input);

  const subtotal = data.items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 10000 ? 0 : 1000;
  const total = subtotal + shipping;

  const order = await prisma.order.create({
    data: {
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      shippingAddress: JSON.stringify(data.shippingAddress),
      items: JSON.stringify(data.items),
      totalAmount: total,
      status: "pending",
      stripeSessionId: `mock_${Math.random().toString(36).slice(2, 12)}`,
    },
  });

  // Decrement stock per item
  for (const it of data.items) {
    const p = await prisma.product.findUnique({ where: { id: it.productId } });
    if (!p) continue;
    let stock: Record<string, number> = {};
    try {
      stock = JSON.parse(p.stock);
    } catch {}
    stock[it.size] = Math.max(0, (stock[it.size] ?? 0) - it.qty);
    await prisma.product.update({
      where: { id: it.productId },
      data: { stock: JSON.stringify(stock) },
    });
  }

  return { id: order.id };
}
