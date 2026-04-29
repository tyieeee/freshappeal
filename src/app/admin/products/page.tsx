import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice, parseJSON } from "@/lib/utils";
import { Plus, Pencil } from "lucide-react";
import { DeleteProductButton } from "@/components/delete-product-button";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const q = searchParams.q ?? "";
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const pageSize = 20;

  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { slug: { contains: q } },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus size={16} /> New Product
        </Link>
      </div>

      <form className="mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or slug..."
          className="w-full max-w-sm bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
        />
      </form>

      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-600 border-b border-gray-200">
            <tr>
              <th className="text-left p-4">Image</th>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4">Stock</th>
              <th className="text-left p-4">Featured</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => {
              const stock = parseJSON<Record<string, number>>(p.stock, {});
              const totalStock = Object.values(stock).reduce((a, b) => a + b, 0);
              const images = parseJSON<string[]>(p.images, []);
              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      {images[0] && (
                        <Image
                          src={images[0]}
                          alt={p.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-gray-900">{p.name}</td>
                  <td className="p-4 capitalize text-gray-600">{p.category}</td>
                  <td className="p-4 text-gray-900">{formatPrice(p.price)}</td>
                  <td className="p-4 text-gray-600">{totalStock}</td>
                  <td className="p-4">
                    {p.isFeatured ? <span className="text-yellow-500">★</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <Link href={`/admin/products/${p.id}`} className="text-gray-600 hover:text-gray-900 inline-flex items-center">
                      <Pencil size={16} />
                    </Link>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">No products.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex gap-2 mt-4 justify-center">
          {Array.from({ length: pages }).map((_, i) => (
            <Link
              key={i}
              href={`/admin/products?page=${i + 1}${q ? `&q=${q}` : ""}`}
              className={`px-3 py-1.5 border ${
                page === i + 1 ? "border-white text-white" : "border-white/20"
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
