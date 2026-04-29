"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct, type ProductInput } from "@/app/admin/actions";
import { Upload, Camera, Trash2 } from "lucide-react";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "OS"];
const CATEGORIES: ProductInput["category"][] = ["men", "women", "caps", "new"];

export function ProductForm({
  initial,
  productId,
}: {
  initial?: ProductInput;
  productId?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priceDollars, setPriceDollars] = useState(
    initial ? (initial.price / 100).toFixed(2) : "",
  );
  const [category, setCategory] = useState<ProductInput["category"]>(
    initial?.category ?? "men",
  );
  const [sizes, setSizes] = useState<string[]>(initial?.sizes ?? ["S", "M", "L"]);
  const [stock, setStock] = useState<Record<string, number>>(initial?.stock ?? {});
  const [imageUrls, setImageUrls] = useState<string[]>(initial?.images ?? []);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function toggleSize(s: string) {
    setSizes((cur) =>
      cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s],
    );
    setStock((cur) => ({ ...cur, [s]: cur[s] ?? 0 }));
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageUrls((prev) => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });
  }

  function handleCameraCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImageUrls((prev) => [...prev, base64]);
    };
    reader.readAsDataURL(file);
  }

  function removeImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data: ProductInput = {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        description,
        price: Math.round(parseFloat(priceDollars) * 100),
        category,
        sizes,
        stock: Object.fromEntries(sizes.map((s) => [s, Number(stock[s] ?? 0)])),
        images: imageUrls,
        isFeatured,
      };
      if (productId) await updateProduct(productId, data);
      else await createProduct(data);
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setLoading(false);
    }
  }

  const inputCls = "w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={labelCls}>Name</label>
        <input className={inputCls} required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Slug (url)</label>
        <input
          className={inputCls}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="auto-generated from name if empty"
        />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea
          className={`${inputCls} min-h-[120px]`}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Price (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            className={inputCls}
            value={priceDollars}
            onChange={(e) => setPriceDollars(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <select
            className={inputCls}
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductInput["category"])}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Sizes & Stock</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {ALL_SIZES.map((s) => (
            <label
              key={s}
              className={`px-3 py-1.5 border rounded-lg cursor-pointer text-xs font-medium uppercase transition-colors ${
                sizes.includes(s)
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-700 hover:border-gray-400"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={sizes.includes(s)}
                onChange={() => toggleSize(s)}
              />
              {s}
            </label>
          ))}
        </div>
        {sizes.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-3">
            {sizes.map((s) => (
              <div key={s} className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase text-gray-600 w-10">{s}</span>
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  value={stock[s] ?? 0}
                  onChange={(e) => setStock({ ...stock, [s]: Number(e.target.value) })}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className={labelCls}>Product Images</label>
        <div className="flex gap-3 mb-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            <Upload size={18} />
            Upload Photo
          </button>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            <Camera size={18} />
            Take Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className="hidden"
          />
        </div>

        {imageUrls.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={url}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
          className="w-4 h-4 accent-gray-900"
        />
        <span className="text-sm text-gray-700">Feature on homepage</span>
      </label>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          disabled={loading}
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : productId ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
