import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJSON } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const [recentOrders, products] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.product.findMany(),
  ]);

  const lowStock = products
    .map((p) => {
      const stock = parseJSON<Record<string, number>>(p.stock, {});
      const lowSizes = Object.entries(stock)
        .filter(([, v]) => v <= 3)
        .map(([k, v]) => ({ size: k, qty: v }));
      return lowSizes.length > 0
        ? { id: p.id, name: p.name, slug: p.slug, lowSizes }
        : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return NextResponse.json({
    orders: recentOrders.map((o) => ({
      id: o.id,
      customerName: o.customerName,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    })),
    lowStock,
  });
}
