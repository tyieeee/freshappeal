import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { deserializeProduct } from "@/lib/utils";
import { ProductDetail } from "@/components/product-detail";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const p = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!p) return { title: "Not found" };
  return {
    title: `${p.name} — Fresh Appeal Store`,
    description: p.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });
  if (!product) notFound();
  return <ProductDetail p={deserializeProduct(product)} />;
}
