import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/product-form";
import { deserializeProduct } from "@/lib/utils";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();
  const p = deserializeProduct(product);

  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to Products
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-500 mt-1">Update product details</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <ProductForm
          productId={product.id}
          initial={{
            name: p.name,
            slug: p.slug,
            description: p.description,
            price: p.price,
            category: p.category as "men" | "women" | "caps" | "new",
            sizes: p.sizes,
            stock: p.stock,
            images: p.images,
            isFeatured: p.isFeatured,
          }}
        />
      </div>
    </div>
  );
}
