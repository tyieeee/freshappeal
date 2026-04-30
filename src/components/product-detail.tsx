"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import { formatPrice, type ProductView } from "@/lib/utils";
import { ShoppingBag, Check, ArrowLeft, X, ChevronLeft, ChevronRight, ZoomIn, Star, Package } from "lucide-react";

// Stable hash so rating/sold counts stay the same across renders for a given product
function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function ratingFor(id: string) {
  const h = hashStr(id);
  // 4.2 - 4.9
  const r = 4.2 + (h % 80) / 100;
  const reviews = 24 + (h % 380);
  const sold = 120 + (h % 1880);
  return { rating: Number(r.toFixed(1)), reviews, sold };
}

export function ProductDetail({ p }: { p: ProductView }) {
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState(p.sizes[0] ?? "OS");
  const [zoom, setZoom] = useState(false);
  const [added, setAdded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const add = useCart((s) => s.add);
  const router = useRouter();

  const stockForSize = p.stock[size] ?? 0;
  const outOfStock = stockForSize <= 0;

  const nextImage = () => {
    setActiveImg((prev) => (prev + 1) % p.images.length);
  };

  const prevImage = () => {
    setActiveImg((prev) => (prev - 1 + p.images.length) % p.images.length);
  };

  function handleAdd() {
    if (outOfStock) return;
    add({
      productId: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images[0] ?? "",
      size,
      price: p.price,
      qty: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    if (outOfStock) return;
    add({
      productId: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images[0] ?? "",
      size,
      price: p.price,
      qty: 1,
    });
    router.push("/checkout");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs uppercase tracking-widest text-black/60 hover:text-black mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>
      <div className="grid lg:grid-cols-2 gap-10">
      <div>
        <div
          className="relative aspect-square bg-[#f4f4f4] rounded-2xl overflow-hidden cursor-pointer"
          onClick={() => setLightboxOpen(true)}
        >
          {p.images[activeImg] && (
            <Image
              src={p.images[activeImg]}
              alt={p.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(true);
            }}
            className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            aria-label="Open gallery"
          >
            <ZoomIn size={20} />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          {p.images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              onClick={() => {
                setActiveImg(i);
                setLightboxOpen(true);
              }}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                i === activeImg ? "border-black scale-105" : "border-transparent hover:border-black/30"
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" />
            </button>
          ))}
          {/* Placeholder thumbnails so the gallery row always feels complete */}
          {Array.from({ length: Math.max(0, 4 - p.images.length) }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              aria-hidden="true"
              className="w-20 h-20 rounded-xl bg-[#f4f4f4] border-2 border-transparent"
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-black/50">{p.category}</p>
        <h1 className="heading text-2xl sm:text-3xl lg:text-4xl mt-1">{p.name}</h1>
        <p className="text-lg sm:text-xl font-bold mt-2">{formatPrice(p.price)}</p>

        {/* Rating + sold count */}
        {(() => {
          const { rating, reviews, sold } = ratingFor(p.id);
          const fullStars = Math.floor(rating);
          const hasHalf = rating - fullStars >= 0.5;
          return (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const filled = i < fullStars;
                    const half = i === fullStars && hasHalf;
                    return (
                      <span key={i} className="relative inline-block w-4 h-4">
                        <Star
                          size={16}
                          className="absolute inset-0 text-amber-400"
                          fill={filled ? "currentColor" : "none"}
                          strokeWidth={filled ? 0 : 1.5}
                        />
                        {half && (
                          <span className="absolute inset-0 overflow-hidden w-1/2">
                            <Star size={16} className="text-amber-400" fill="currentColor" strokeWidth={0} />
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
                <span className="font-bold text-black">{rating.toFixed(1)}</span>
                <span className="text-black/50">({reviews.toLocaleString()})</span>
              </div>
              <span className="hidden sm:inline-block w-px h-4 bg-black/15" />
              <div className="flex items-center gap-1.5 text-black/60">
                <Package size={14} />
                <span>
                  <span className="font-bold text-black">{sold.toLocaleString()}</span> sold
                </span>
              </div>
            </div>
          );
        })()}

        <p className="mt-4 text-sm text-black/70 leading-relaxed">{p.description}</p>

        <div className="mt-6">
          <p className="label">Size</p>
          <div className="flex flex-wrap gap-2">
            {p.sizes.map((s) => {
              const avail = (p.stock[s] ?? 0) > 0;
              return (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  disabled={!avail}
                  className={`min-w-[3rem] px-4 py-2 rounded-full border text-sm uppercase tracking-widest transition-colors ${
                    size === s
                      ? "bg-black text-white border-black"
                      : "border-black/15 hover:border-black"
                  } ${!avail ? "opacity-30 line-through cursor-not-allowed" : ""}`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-black/40 mt-2">
            {outOfStock ? "Out of stock" : `${stockForSize} in stock`}
          </p>
        </div>

        <div className="flex gap-2 sm:gap-3 mt-6">
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="inline-flex items-center justify-center gap-2 border border-black/15 bg-white text-black font-bold uppercase tracking-wide rounded-full transition-colors hover:border-black flex-1 px-3 py-2 sm:px-6 sm:py-3 text-[10px] sm:text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {added ? (
              <>
                <Check size={14} /> Added
              </>
            ) : (
              <>
                <ShoppingBag size={14} /> {outOfStock ? "Out of stock" : "Add to Cart"}
              </>
            )}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={outOfStock}
            className="btn-neon flex-1 !px-3 !py-2 sm:!px-6 sm:!py-3 !text-[10px] sm:!text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {outOfStock ? "Out of stock" : "Buy Now"}
          </button>
        </div>

        <div className="mt-6 border-t border-black/10 pt-4 grid gap-3 text-xs text-black/70">
          <div>
            <p className="text-xs uppercase tracking-widest text-black/40 mb-1">Material</p>
            Premium heavyweight cotton, garment-washed.
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-black/40 mb-1">Shipping</p>
            Free shipping on orders over $100. Ships in 2–3 business days.
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-black/40 mb-1">Returns</p>
            30-day returns on unworn items.
          </div>
        </div>
      </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="mt-16 pt-10 border-t border-black/10">
        <h2 className="heading text-3xl mb-8">Customer Reviews</h2>
        <div className="grid gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center font-bold">
                JD
              </div>
              <div>
                <p className="font-bold text-sm">John Doe</p>
                <p className="text-xs text-black/50">Verified Buyer</p>
              </div>
              <div className="ml-auto flex gap-1">
                <span className="text-yellow-500">★</span>
                <span className="text-yellow-500">★</span>
                <span className="text-yellow-500">★</span>
                <span className="text-yellow-500">★</span>
                <span className="text-yellow-500">★</span>
              </div>
            </div>
            <p className="text-sm text-black/70">
              Amazing quality! The fabric feels premium and the fit is perfect. Definitely worth the price.
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center font-bold">
                SM
              </div>
              <div>
                <p className="font-bold text-sm">Sarah Miller</p>
                <p className="text-xs text-black/50">Verified Buyer</p>
              </div>
              <div className="ml-auto flex gap-1">
                <span className="text-yellow-500">★</span>
                <span className="text-yellow-500">★</span>
                <span className="text-yellow-500">★</span>
                <span className="text-yellow-500">★</span>
                <span className="text-black/20">★</span>
              </div>
            </div>
            <p className="text-sm text-black/70">
              Great product overall. Shipping was fast and the packaging was nice. Would recommend!
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center font-bold">
                MJ
              </div>
              <div>
                <p className="font-bold text-sm">Mike Johnson</p>
                <p className="text-xs text-black/50">Verified Buyer</p>
              </div>
              <div className="ml-auto flex gap-1">
                <span className="text-yellow-500">★</span>
                <span className="text-yellow-500">★</span>
                <span className="text-yellow-500">★</span>
                <span className="text-yellow-500">★</span>
                <span className="text-yellow-500">★</span>
              </div>
            </div>
            <p className="text-sm text-black/70">
              This is now my favorite piece in my wardrobe. The attention to detail is incredible.
            </p>
          </div>
        </div>
      </div>


      {/* LIGHTBOX OVERLAY */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            aria-label="Close gallery"
          >
            <X size={24} />
          </button>

          {p.images.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-4 w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center p-8">
            {p.images[activeImg] && (
              <Image
                src={p.images[activeImg]}
                alt={p.name}
                fill
                className="object-contain"
                priority
              />
            )}
          </div>

          {p.images.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {p.images.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {p.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === activeImg ? "bg-white scale-125" : "bg-white/50"
                  }`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
