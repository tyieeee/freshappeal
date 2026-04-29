"use client";
import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

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
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const filteredProducts = useMemo(() => {
    let filtered = cat ? mockProducts.filter((p) => p.category === cat) : mockProducts;

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
  }, [cat, selectedBrands, selectedSizes, priceRange, brands]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <span className="text-[11px] uppercase tracking-[0.3em] text-black/50">{pageSubtitle}</span>
        <h1 className="heading text-5xl sm:text-6xl mt-2">{pageTitle}</h1>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* FILTERS SIDEBAR */}
        <div className={`lg:col-span-1 transition-all duration-300 ${isFilterOpen ? "space-y-6" : "w-0 overflow-hidden"}`}>
          {isFilterOpen && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-sm uppercase tracking-widest">Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="lg:hidden p-1 hover:bg-black/5 rounded"
                  aria-label="Close filters"
                >
                  <ChevronLeft size={18} />
                </button>
              </div>
              {/* BRAND FILTER */}
              <div className="card p-5">
                <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Brand</h3>
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="input mb-3 text-sm"
                />
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredBrands.map((brand) => (
                    <label key={brand.id} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-black/5 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand.id)}
                        onChange={() => toggleBrand(brand.id)}
                        className="w-4 h-4 rounded border-black/20"
                      />
                      <span className="text-sm font-medium">{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* PRICE FILTER */}
              <div className="card p-5">
                <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Price Range</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="input text-sm w-full"
                      placeholder="Min"
                    />
                    <span className="text-black/40">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="input text-sm w-full"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              {/* SIZE FILTER */}
              <div className="card p-5">
                <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-2 rounded border text-sm transition-all ${
                        selectedSizes.includes(size)
                          ? "bg-black text-white border-black"
                          : "bg-white border-black/10 hover:border-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* CLEAR FILTERS */}
              <button
                onClick={() => {
                  setSelectedBrands([]);
                  setSelectedSizes([]);
                  setPriceRange([0, 200]);
                  setBrandSearch("");
                }}
                className="btn-outline w-full text-sm"
              >
                Clear All Filters
              </button>
            </>
          )}
        </div>

        {/* PRODUCTS GRID */}
        <div className={`lg:col-span-3 transition-all duration-300 ${!isFilterOpen ? "lg:col-span-4" : ""}`}>
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setIsFilterOpen(true)}
              className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest ${isFilterOpen ? "opacity-0 pointer-events-none" : "hover:text-black/70"}`}
              aria-label="Open filters"
            >
              <Filter size={18} />
              Filters
            </button>
          </div>

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
