"use client";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { ProductView } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Filter, X, Search, ChevronDown, Check } from "lucide-react";

const brands = [
  { id: 1, name: "Nike", logo: "🏃" },
  { id: 2, name: "Adidas", logo: "👟" },
  { id: 3, name: "Supreme", logo: "🔴" },
  { id: 4, name: "Stüssy", logo: "✍️" },
  { id: 5, name: "Off-White", logo: "⬜" },
  { id: 6, name: "Balenciaga", logo: "👜" },
  { id: 7, name: "Gucci", logo: "🎀" },
  { id: 8, name: "Fear of God", logo: "✝️" },
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

const STATIC_DATE = new Date("2024-01-01");

const mockProducts = [
  // HOODIES
  {
    id: "h1",
    name: "Beard Mafia Hoodie",
    slug: "beard-mafia-hoodie",
    description: "Premium heavyweight hoodie",
    price: 8500,
    category: "hoodies",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: { S: 8, M: 12, L: 10, XL: 8, XXL: 5 } as Record<string, number>,
    images: ["/jacket.jpeg"],
    isFeatured: true,
    createdAt: STATIC_DATE,
  },
  // TEES
  {
    id: "t1",
    name: "Fresh Logo Tee",
    slug: "fresh-logo-tee",
    description: "Premium cotton t-shirt",
    price: 3500,
    category: "tees",
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: { XS: 15, S: 20, M: 25, L: 20, XL: 15 } as Record<string, number>,
    images: ["/tshirt.png"],
    isFeatured: true,
    createdAt: STATIC_DATE,
  },
  // CAPS
  {
    id: "c1",
    name: "Fresh Snapback",
    slug: "fresh-snapback",
    description: "Six-panel structured cap",
    price: 2600,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 20 } as Record<string, number>,
    images: ["/cap1.jpeg"],
    isFeatured: true,
    createdAt: STATIC_DATE,
  },
  {
    id: "c2",
    name: "Culture Cap",
    slug: "culture-cap",
    description: "Low-profile dad cap",
    price: 2800,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 18 } as Record<string, number>,
    images: ["/cap2.jpeg"],
    isFeatured: true,
    createdAt: STATIC_DATE,
  },
  {
    id: "c3",
    name: "Classic Cap",
    slug: "classic-cap",
    description: "Low-profile dad cap with curved brim",
    price: 2600,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 35 } as Record<string, number>,
    images: ["/collection1.jpeg"],
    isFeatured: false,
    createdAt: STATIC_DATE,
  },
  {
    id: "c4",
    name: "Heritage Cap",
    slug: "heritage-cap",
    description: "Heritage embroidered six-panel cap",
    price: 3200,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 25 } as Record<string, number>,
    images: ["/collection2.jpeg"],
    isFeatured: true,
    createdAt: STATIC_DATE,
  },
  {
    id: "c5",
    name: "Street Cap",
    slug: "street-cap",
    description: "Adjustable street cap",
    price: 2400,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 30 } as Record<string, number>,
    images: ["/collection3.jpeg"],
    isFeatured: false,
    createdAt: STATIC_DATE,
  },
  {
    id: "c6",
    name: "Premium Cap",
    slug: "premium-cap",
    description: "Premium structured snapback",
    price: 2900,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 22 } as Record<string, number>,
    images: ["/collection4.jpeg"],
    isFeatured: false,
    createdAt: STATIC_DATE,
  },
];

const CATEGORY_TITLES: Record<string, string> = {
  hoodies: "HOODIES",
  tees: "TEES",
  caps: "CAPS",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center text-black/50">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const cat = searchParams.get("cat") || "";
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [brandSearch, setBrandSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dbProducts, setDbProducts] = useState<ProductView[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((data: ProductView[]) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setDbProducts(data);
        } else if (!cancelled) {
          setDbProducts(mockProducts as unknown as ProductView[]);
        }
      })
      .catch(() => {
        if (!cancelled) setDbProducts(mockProducts as unknown as ProductView[]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sourceProducts = (dbProducts ?? (mockProducts as unknown as ProductView[]));

  const filteredProducts = useMemo(() => {
    let filtered = cat ? sourceProducts.filter((p) => p.category === cat) : sourceProducts;

    // Filter by brands (simulated - using product name as proxy)
    if (selectedBrands.length > 0) {
      const brandNames = selectedBrands.map(id => {
        const brand = brands.find(b => b.id === id);
        return brand?.name.toLowerCase() || "";
      });
      filtered = filtered.filter(p => brandNames.some(name => p.name.toLowerCase().includes(name)));
    }

    // Filter by sizes
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(p => p.sizes.some(size => selectedSizes.includes(size)));
    }

    // Filter by price range
    filtered = filtered.filter(p => p.price >= priceRange[0] * 100 && p.price <= priceRange[1] * 100);

    return filtered;
  }, [cat, selectedBrands, selectedSizes, priceRange, sourceProducts]);

  const pageTitle = cat ? CATEGORY_TITLES[cat] || "FRESH COLLECTION" : "LATEST DROPS";
  const pageSubtitle = cat ? "Shop" : "All Products";

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const toggleBrand = (brandId: number) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size]
    );
  };

  const activeFilterCount =
    selectedBrands.length +
    selectedSizes.length +
    (priceRange[0] !== 0 || priceRange[1] !== 200 ? 1 : 0);

  const FilterPanel = () => (
    <div className="space-y-4">
      {/* Active filter pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedBrands.map((id) => {
            const b = brands.find((x) => x.id === id);
            if (!b) return null;
            return (
              <span
                key={`b-${id}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-black text-white rounded-full text-[11px] font-medium"
              >
                {b.name}
                <button
                  type="button"
                  onClick={() => toggleBrand(id)}
                  className="hover:bg-white/20 rounded-full p-0.5"
                  aria-label={`Remove ${b.name}`}
                >
                  <X size={10} />
                </button>
              </span>
            );
          })}
          {selectedSizes.map((s) => (
            <span
              key={`s-${s}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-black text-white rounded-full text-[11px] font-medium"
            >
              {s}
              <button
                type="button"
                onClick={() => toggleSize(s)}
                className="hover:bg-white/20 rounded-full p-0.5"
                aria-label={`Remove size ${s}`}
              >
                <X size={10} />
              </button>
            </span>
          ))}
          {(priceRange[0] !== 0 || priceRange[1] !== 200) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black text-white rounded-full text-[11px] font-medium">
              ${priceRange[0]} - ${priceRange[1]}
              <button
                type="button"
                onClick={() => setPriceRange([0, 200])}
                className="hover:bg-white/20 rounded-full p-0.5"
                aria-label="Reset price"
              >
                <X size={10} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* BRAND FILTER */}
      <details open className="group bg-white rounded-2xl border border-black/10 overflow-hidden">
        <summary className="list-none cursor-pointer px-5 py-4 flex items-center justify-between hover:bg-black/[0.02] transition-colors">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm">Brand</h3>
            {selectedBrands.length > 0 && (
              <span className="bg-black text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {selectedBrands.length}
              </span>
            )}
          </div>
          <ChevronDown size={16} className="text-black/40 transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-5 pb-4 space-y-3 border-t border-black/5">
          <div className="relative pt-3">
            <Search size={14} className="absolute left-3 top-1/2 mt-1.5 text-black/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search brands..."
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              className="w-full bg-black/[0.03] border border-transparent rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-black/40 focus:outline-none focus:border-black focus:bg-white transition-all"
            />
          </div>
          <div className="space-y-0.5 max-h-52 overflow-y-auto -mx-2 px-2 scrollbar-hide">
            {filteredBrands.map((brand) => {
              const checked = selectedBrands.includes(brand.id);
              return (
                <label
                  key={brand.id}
                  className={`flex items-center gap-3 cursor-pointer px-2 py-2 rounded-lg transition-colors ${
                    checked ? "bg-black/[0.04]" : "hover:bg-black/[0.03]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBrand(brand.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      checked ? "bg-black border-black" : "border-black/25 bg-white"
                    }`}
                  >
                    {checked && <Check size={11} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-sm font-medium flex-1">{brand.name}</span>
                </label>
              );
            })}
            {filteredBrands.length === 0 && (
              <p className="text-xs text-black/40 text-center py-4">No brands found.</p>
            )}
          </div>
        </div>
      </details>

      {/* PRICE FILTER */}
      <details open className="group bg-white rounded-2xl border border-black/10 overflow-hidden">
        <summary className="list-none cursor-pointer px-5 py-4 flex items-center justify-between hover:bg-black/[0.02] transition-colors">
          <h3 className="font-bold text-sm">Price Range</h3>
          <ChevronDown size={16} className="text-black/40 transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-5 pb-5 pt-3 space-y-4 border-t border-black/5">
          {/* Range slider */}
          <div className="relative h-10 flex items-center">
            <div className="absolute inset-x-0 h-1.5 bg-black/10 rounded-full">
              <div
                className="absolute h-1.5 bg-black rounded-full"
                style={{
                  left: `${(priceRange[0] / 200) * 100}%`,
                  right: `${100 - (priceRange[1] / 200) * 100}%`,
                }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={200}
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange([Math.min(Number(e.target.value), priceRange[1] - 1), priceRange[1]])
              }
              style={{ zIndex: priceRange[0] > 200 - 20 ? 5 : 3 }}
              className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing"
            />
            <input
              type="range"
              min={0}
              max={200}
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0] + 1)])
              }
              style={{ zIndex: 4 }}
              className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/50 mb-1">Min</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black/40">$</span>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([Math.max(0, Number(e.target.value)), priceRange[1]])
                  }
                  className="w-full bg-white border border-black/10 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-black/50 mb-1">Max</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black/40">$</span>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Math.min(200, Number(e.target.value))])
                  }
                  className="w-full bg-white border border-black/10 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </details>

      {/* SIZE FILTER */}
      <details open className="group bg-white rounded-2xl border border-black/10 overflow-hidden">
        <summary className="list-none cursor-pointer px-5 py-4 flex items-center justify-between hover:bg-black/[0.02] transition-colors">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm">Size</h3>
            {selectedSizes.length > 0 && (
              <span className="bg-black text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {selectedSizes.length}
              </span>
            )}
          </div>
          <ChevronDown size={16} className="text-black/40 transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-5 pb-5 pt-3 border-t border-black/5">
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => {
              const active = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`py-2.5 rounded-lg border-2 text-sm font-bold transition-all ${
                    active
                      ? "bg-black text-white border-black"
                      : "bg-white border-black/10 hover:border-black/40"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      </details>

      {/* CLEAR FILTERS */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={() => {
            setSelectedBrands([]);
            setSelectedSizes([]);
            setPriceRange([0, 200]);
            setBrandSearch("");
          }}
          className="w-full py-3 text-sm font-semibold text-black/60 hover:text-black hover:bg-black/[0.03] rounded-xl transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <span className="text-[11px] uppercase tracking-[0.3em] text-black/50">{pageSubtitle}</span>
        <h1 className="heading text-3xl sm:text-5xl lg:text-6xl mt-2">{pageTitle}</h1>
      </div>

      {/* Mobile Filter Trigger */}
      <div className="lg:hidden mb-6 flex justify-end">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 border border-black/15 rounded-full text-sm font-bold uppercase tracking-widest hover:border-black"
          aria-label="Open filters"
        >
          <Filter size={16} />
          Filters
          {(selectedBrands.length + selectedSizes.length) > 0 && (
            <span className="bg-black text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
              {selectedBrands.length + selectedSizes.length}
            </span>
          )}
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* DESKTOP FILTERS SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Filter size={16} /> Filters
              </h2>
              {activeFilterCount > 0 && (
                <span className="text-[11px] text-black/50">{activeFilterCount} active</span>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* MOBILE FILTER DRAWER */}
        <div
          className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
            isFilterOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
          />
          {/* Drawer */}
          <div
            className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              isFilterOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-black/10">
              <h2 className="font-bold text-sm uppercase tracking-widest">Filters</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-1.5 hover:bg-black/5 rounded-full transition-colors"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 bg-gray-50 min-h-full">
              <FilterPanel />
            </div>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className="lg:col-span-3">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} p={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 card">
              <p className="text-black/50">No products found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
