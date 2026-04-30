import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const orders = await prisma.order.findMany({
    where: { customerEmail: email },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(
    orders.map((o) => ({
      id: o.id,
      status: o.status,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt.toISOString(),
      items: (() => {
        try {
          return JSON.parse(o.items) as Array<{
            productId: string;
            name: string;
            size: string;
            qty: number;
            price: number;
          }>;
        } catch {
          return [];
        }
      })(),
      shippingAddress: (() => {
        try {
          return JSON.parse(o.shippingAddress);
        } catch {
          return null;
        }
      })(),
    })),
  );
}
