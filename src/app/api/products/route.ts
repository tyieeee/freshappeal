import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deserializeProduct } from "@/lib/utils";
import { seedShopProducts } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export async function GET() {
  let products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  if (products.length === 0) {
    try {
      await seedShopProducts();
      products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    } catch (err) {
      console.error("Seed failed:", err);
    }
  }
  return NextResponse.json(products.map(deserializeProduct));
}
