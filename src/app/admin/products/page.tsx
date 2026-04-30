import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice, parseJSON } from "@/lib/utils";
import { Plus, Pencil } from "lucide-react";
import { DeleteProductButton } from "@/components/delete-product-button";
import { SyncShopButton } from "@/components/sync-shop-button";
import { seedShopProducts } from "@/app/admin/actions";
import { CATEGORY_LABELS } from "@/lib/shop-products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; cat?: string; page?: string };
}) {
  const q = searchParams.q ?? "";
  const cat = searchParams.cat ?? "";
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const pageSize = 20;

  // Auto-seed default catalog if DB is empty
  let totalCount = await prisma.product.count();
  if (totalCount === 0) {
    try {
      await seedShopProducts();
      totalCount = await prisma.product.count();
    } catch (err) {
      console.error("Auto-seed failed:", err);
    }
  }

  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { slug: { contains: q } },
          ],
        }
      : {}),
    ...(cat ? { category: cat } : {}),
  };

  const [products, total, allCategories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
    }),
  ]);

  const categories = Array.from(new Set(allCategories.map((c) => c.category))).sort();
  const pages = Math.max(1, Math.ceil(total / pageSize));

  function buildHref(nextCat: string) {
    const params = new URLSearchParams();
    if (nextCat) params.set("cat", nextCat);
    if (q) params.set("q", q);
    const qs = params.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-5 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SyncShopButton />
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Plus size={16} /> <span className="hidden sm:inline">New Product</span><span className="sm:hidden">New</span>
          </Link>
        </div>
      </div>

      <form className="mb-4">
        {cat && <input type="hidden" name="cat" value={cat} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or slug..."
          className="w-full max-w-sm bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
        />
      </form>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
          <Link
            href={buildHref("")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
              !cat
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
            }`}
          >
            All ({totalCount})
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={buildHref(c)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors capitalize ${
                cat === c
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
              }`}
            >
              {CATEGORY_LABELS[c] ?? c}
            </Link>
          ))}
        </div>
      )}

      {/* MOBILE: card list */}
      <div className="sm:hidden space-y-3">
        {products.map((p) => {
          const stock = parseJSON<Record<string, number>>(p.stock, {});
          const totalStock = Object.values(stock).reduce((a, b) => a + b, 0);
          const images = parseJSON<string[]>(p.images, []);
          return (
            <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-3 flex gap-3">
              <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                {images[0] && (
                  <Image src={images[0]} alt={p.name} fill sizes="64px" className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-sm text-gray-900 truncate">{p.name}</p>
                  {p.isFeatured && <span className="text-yellow-500 text-sm shrink-0">★</span>}
                </div>
                <p className="text-xs text-gray-500 capitalize mt-0.5">{p.category}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-semibold text-gray-900">{formatPrice(p.price)}</span>
                    <span className="text-gray-500">Stock: {totalStock}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Link href={`/admin/products/${p.id}`} className="text-gray-600 hover:text-gray-900">
                      <Pencil size={15} />
                    </Link>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {products.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-400 text-sm">
            No products.
          </div>
        )}
      </div>

      {/* DESKTOP: table */}
      <div className="hidden sm:block border border-gray-200 rounded-lg overflow-hidden bg-white overflow-x-auto">
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
