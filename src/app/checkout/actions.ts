"use server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendMail } from "@/lib/mailer";

const ADMIN_NOTIFY_EMAIL =
  process.env.ADMIN_NOTIFY_EMAIL ?? "delacruzarchie21@gmail.com";

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

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

  // Send email notifications (non-blocking on failure)
  try {
    const itemsHtml = data.items
      .map(
        (i) =>
          `<tr><td style="padding:6px 0;border-bottom:1px solid #eee">${i.name} <span style="color:#888">· Size ${i.size} · Qty ${i.qty}</span></td><td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;font-weight:600">${fmt(i.price * i.qty)}</td></tr>`,
      )
      .join("");
    const addr = data.shippingAddress;
    const html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
        <h1 style="margin:0 0 4px;font-size:22px">New order received</h1>
        <p style="margin:0 0 20px;color:#666">Order <code>#${order.id.slice(-8)}</code></p>
        <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:.1em;color:#666;margin:16px 0 8px">Customer</h2>
        <p style="margin:0">${data.customerName}<br/><span style="color:#666">${data.customerEmail}</span></p>
        <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:.1em;color:#666;margin:20px 0 8px">Shipping</h2>
        <p style="margin:0;line-height:1.5">${addr.line1}<br/>${addr.city}, ${addr.state} ${addr.postal}<br/>${addr.country}</p>
        <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:.1em;color:#666;margin:20px 0 8px">Items</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">${itemsHtml}</table>
        <table style="width:100%;margin-top:16px;font-size:14px">
          <tr><td style="color:#666">Subtotal</td><td style="text-align:right">${fmt(subtotal)}</td></tr>
          <tr><td style="color:#666">Shipping</td><td style="text-align:right">${shipping === 0 ? "Free" : fmt(shipping)}</td></tr>
          <tr><td style="font-weight:700;font-size:16px;padding-top:8px;border-top:2px solid #111">Total</td><td style="font-weight:700;font-size:16px;text-align:right;padding-top:8px;border-top:2px solid #111">${fmt(total)}</td></tr>
        </table>
        <p style="margin:24px 0 0;color:#888;font-size:12px">Payment: Cash on Delivery</p>
      </div>`;
    const text = `New order #${order.id.slice(-8)}\nCustomer: ${data.customerName} <${data.customerEmail}>\nTotal: ${fmt(total)}\nItems: ${data.items.map((i) => `${i.name} (${i.size}) x${i.qty}`).join(", ")}`;

    // Notify admin (you)
    await sendMail({
      to: ADMIN_NOTIFY_EMAIL,
      subject: `New order #${order.id.slice(-8)} — ${fmt(total)}`,
      html,
      text,
    });

    // Receipt for customer
    if (data.customerEmail && data.customerEmail !== ADMIN_NOTIFY_EMAIL) {
      await sendMail({
        to: data.customerEmail,
        subject: `Your Fresh Appeal order #${order.id.slice(-8)}`,
        html: html.replace("New order received", "Thanks for your order!"),
        text,
      });
    }
  } catch (err) {
    console.error("[order] email notify failed:", err);
  }

  return { id: order.id };
}
