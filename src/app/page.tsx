import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { deserializeProduct, formatPrice, type ProductView } from "@/lib/utils";
import { ProductCard } from "@/components/product-card";
import { ScrollAnimation } from "@/components/scroll-animation";
import { InitialLoader } from "@/components/initial-loader";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Maximize2,
  UserCheck,
  Droplets,
  Laptop,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const all = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    const products = all.map(deserializeProduct);
    const featured = products.filter((p) => p.isFeatured);
    const caps = products.filter((p) => p.category === "caps");
    const lineup = featured.slice(0, 4);
    const star = featured[0] ?? products[0] ?? null;

  return (
    <div className="bg-white">
      <InitialLoader />
      {/* HERO — Editorial split-text with model overlay */}
      <section className="relative bg-white overflow-hidden">
        {/* Mobile layout — logo centered with background effects */}
        <div className="sm:hidden relative flex flex-col items-center justify-center min-h-[90vh] px-6 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            {/* Decorative circles */}
            <div className="absolute top-[15%] right-[10%] w-32 h-32 rounded-full border border-black/[0.04]" />
            <div className="absolute bottom-[20%] left-[5%] w-48 h-48 rounded-full border border-black/[0.04]" />
            <div className="absolute top-[40%] left-[15%] w-16 h-16 rounded-full bg-black/[0.02]" />

            {/* we.png leaf icons scattered */}
            {[
              { top: '6%', left: '8%', rotate: -20, size: 48 },
              { top: '20%', left: '75%', rotate: 15, size: 40 },
              { top: '50%', left: '3%', rotate: 30, size: 36 },
              { top: '68%', left: '78%', rotate: -10, size: 44 },
              { top: '82%', left: '15%', rotate: 25, size: 32 },
            ].map((item, i) => (
              <Image
                key={`leaf-${i}`}
                src="/we.png"
                alt=""
                width={item.size}
                height={item.size}
                className="absolute opacity-[0.15] grayscale"
                style={{ top: item.top, left: item.left, transform: `rotate(${item.rotate}deg)`, imageRendering: 'pixelated' }}
              />
            ))}

            {/* Pixelated cigarettes — gray */}
            {[
              { top: '12%', left: '60%', rotate: 35, size: 44 },
              { top: '42%', left: '82%', rotate: -25, size: 38 },
              { top: '75%', left: '45%', rotate: 10, size: 36 },
              { top: '30%', left: '2%', rotate: -40, size: 40 },
            ].map((item, i) => (
              <svg key={`cig-${i}`} className="absolute opacity-[0.2]" style={{ top: item.top, left: item.left, transform: `rotate(${item.rotate}deg)`, width: item.size, height: item.size * 0.4 }} viewBox="0 0 24 8" fill="none" shapeRendering="crispEdges">
                {/* Smoke pixels */}
                <rect x="1" y="0" width="1" height="1" fill="#bbb"/>
                <rect x="3" y="0" width="1" height="1" fill="#bbb"/>
                <rect x="0" y="1" width="1" height="1" fill="#bbb"/>
                <rect x="2" y="1" width="1" height="1" fill="#bbb"/>
                <rect x="1" y="2" width="1" height="1" fill="#bbb"/>
                <rect x="3" y="2" width="1" height="1" fill="#bbb"/>
                <rect x="2" y="3" width="1" height="1" fill="#bbb"/>
                {/* Filter */}
                <rect x="3" y="4" width="4" height="3" fill="#bbb"/>
                {/* Body */}
                <rect x="7" y="4" width="1" height="3" fill="#999"/>
                <rect x="8" y="4" width="12" height="3" fill="#ccc"/>
                {/* Tip */}
                <rect x="20" y="4" width="4" height="3" fill="#aaa"/>
              </svg>
            ))}
          </div>

          {/* Logo */}
          <div className="relative w-52 h-52 mb-5 z-10">
            <Image
              src="/logo.png"
              alt="Fresh Appeal"
              fill
              sizes="208px"
              className="object-contain drop-shadow-sm"
              priority
            />
          </div>

          {/* Brand name */}
          <h1 className="heading text-[12vw] leading-[0.85] tracking-tight text-black text-center z-10">
            FRESH APPEAL
          </h1>

          {/* Tagline */}
          <p className="text-[10px] uppercase tracking-[0.3em] text-black/50 mt-3 text-center z-10">
            Since 2024 — Streetwear Elegance
          </p>

          {/* CTA */}
          <Link href="/shop" className="btn-neon text-xs inline-flex mt-6 z-10">
            Shop Now <ArrowRight size={14} />
          </Link>

          {/* Scroll indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 animate-bounce">
            <p className="text-[9px] uppercase tracking-[0.25em] text-black/30">Scroll to explore</p>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-black/30">
              <path d="M8 2v10M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Desktop layout — absolute positioned */}
        <div className="relative max-w-[1400px] mx-auto min-h-[680px] lg:min-h-[740px] px-8 hidden sm:block">
          {/* Massive headline behind models */}
          <h1 className="absolute top-4 left-1/2 -translate-x-1/2 w-full text-center heading text-[14vw] lg:text-[12vw] leading-[0.85] tracking-tight text-black select-none pointer-events-none whitespace-nowrap">
            FRESH APPEAL
          </h1>

          {/* Right side nav */}
          <div className="absolute top-24 right-16 z-20 hidden md:flex flex-col items-end gap-6">
            <Link href="/shop" className="text-[11px] uppercase tracking-[0.3em] text-black/80 hover:text-black">
              Stores
            </Link>
            <Link href="/shop" className="text-[11px] uppercase tracking-[0.3em] text-black/80 hover:text-black">
              Collection
            </Link>
            <Link href="/login" className="text-[11px] uppercase tracking-[0.3em] text-black/80 hover:text-black">
              Log In
            </Link>
          </div>

          {/* Models image overlapping the headline */}
          <div className="absolute inset-x-0 bottom-0 top-[18%] flex items-end justify-center z-10 pointer-events-none">
            <div className="relative w-full max-w-[1100px] h-[88%]">
              <Image
                src="/hero.png"
                alt="Fresh Appeal — Streetwear collection"
                fill
                sizes="(max-width: 1400px) 100vw, 1100px"
                className="object-contain object-bottom"
                priority
              />
            </div>
          </div>

          {/* Bottom-left tagline */}
          <div className="absolute bottom-10 left-10 z-20">
            <p className="heading text-xl md:text-2xl leading-[1.05] tracking-tight">
              SINCE 2024<br />STREETWEAR ELEGANCE
            </p>
          </div>

          {/* Bottom-right description */}
          <div className="absolute bottom-10 right-10 z-20 max-w-[260px] text-right">
            <p className="text-[11px] uppercase tracking-[0.2em] text-black/80 leading-relaxed font-bold">
              Fresh Appeal proposes well-<br />
              developed, thoughtful<br />
              clothes with a discerning<br />
              point-of-view.
            </p>
            <Link href="/shop" className="btn-neon mt-5 text-xs inline-flex">
              Shop Now <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* BEST PRODUCT — center image with 4 surrounding tiles */}
      <ScrollAnimation direction="up">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="text-center max-w-2xl mx-auto px-2">
            <span className="text-[11px] uppercase tracking-[0.3em] text-black/50">
              Best Product
            </span>
            <h2 className="heading text-3xl sm:text-5xl lg:text-6xl mt-3">
              GO-TO STREET PIECE
            </h2>
            <p className="mt-4 text-black/60">
              Designed for the everyday and the after-hours. Heavyweight,
              structured, and built to live in.
            </p>
          </div>

          <div className="mt-8 sm:mt-12 grid sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_1fr] gap-4 sm:gap-6 items-center">
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-4 sm:gap-6 order-2 lg:order-1">
              <FeatureTile icon={<Maximize2 size={20} />} title="Oversized Fit" text="Drop-shoulder cut for that effortless street silhouette." />
              <FeatureTile icon={<Droplets size={20} />} title="Garment Washed" text="Pre-shrunk and broken-in for day-one comfort." />
            </div>

            <div className="order-1 lg:order-2 sm:col-span-2 lg:col-span-1 relative aspect-square max-h-[300px] sm:max-h-[400px] lg:max-h-none">
              <div className="relative w-full h-full">
                <Image
                  src="/cap.png"
                  alt="Fresh Appeal Cap"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-contain hover:scale-105 transition-transform duration-700"
                  style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.3))" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-1 gap-4 sm:gap-6 order-3">
              <FeatureTile icon={<UserCheck size={20} />} title="Premium Cotton" text="400gsm heavyweight cotton, made to outlast trends." />
              <FeatureTile icon={<Laptop size={20} />} title="Limited Run" text="Numbered drops. Once they're gone, they're gone." />
            </div>
          </div>
        </section>
      </ScrollAnimation>

      {/* GET READY OVERLAY + 4-PRODUCT GRID */}
      <ScrollAnimation direction="left" delay={0.1}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20 grid lg:grid-cols-2 gap-4">
          <div className="relative rounded-2xl overflow-hidden min-h-[320px] sm:min-h-[460px] bg-[#f4f4f4]">
            <Image
              src="/man.jpeg"
              alt="New collection"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-auto sm:max-w-xs bg-black/85 text-white rounded-2xl p-4 sm:p-6 backdrop-blur">
              <h3 className="heading text-xl sm:text-3xl">GET FRESH FOR THE NEW SEASON</h3>
              <p className="text-sm text-white/70 mt-2">
                Layer up with the new arrivals — built for the city and beyond.
              </p>
              <Link href="/shop?cat=new" className="mt-4 inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-black hover:text-white transition-colors">
                Explore <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { id: "m1", name: "Fresh Snapback", slug: "fresh-snapback", description: "Six-panel structured cap", price: 2600, category: "caps", sizes: ["OS"], stock: { OS: 20 }, images: ["/cap1.jpeg"], isFeatured: false, createdAt: new Date("2024-01-01") },
              { id: "m2", name: "Beard Mafia", slug: "beard-mafia", description: "Premium jacket", price: 8500, category: "men", sizes: ["S", "M", "L", "XL"], stock: { S: 10, M: 12, L: 8, XL: 6 } as Record<string, number>, images: ["/jacket.jpeg"], isFeatured: false, createdAt: new Date("2024-01-01") },
              { id: "m3", name: "Fresh Logo", slug: "fresh-logo", description: "Premium cotton t-shirt", price: 3500, category: "women", sizes: ["XS", "S", "M", "L", "XL"], stock: { XS: 15, S: 20, M: 25, L: 20, XL: 15 } as Record<string, number>, images: ["/tshirt.png"], isFeatured: false, createdAt: new Date("2024-01-01") },
              { id: "m4", name: "Culture Cap", slug: "culture-cap", description: "Low-profile dad cap", price: 2800, category: "caps", sizes: ["OS"], stock: { OS: 18 }, images: ["/cap2.jpeg"], isFeatured: false, createdAt: new Date("2024-01-01") },
            ].map((p) => (
              <MiniProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      </ScrollAnimation>

      {/* GEAR ESSENTIALS */}
      <ScrollAnimation direction="up" delay={0.2}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          <div className="flex items-end justify-between mb-6 sm:mb-8 flex-wrap gap-3">
            <div>
              <span className="text-[11px] uppercase tracking-[0.3em] text-black/50">
                Caps
              </span>
              <h2 className="heading text-2xl sm:text-4xl lg:text-5xl mt-2">CAP COLLECTION</h2>
              <p className="text-sm text-black/60 mt-2 max-w-lg">
                Six-panel structured caps with raised embroidery — finishing
                touches that complete the fit.
              </p>
            </div>
            <Link href="/shop?cat=caps" className="btn-light text-xs">
              Show More
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { id: "c1", name: "Fresh Snapback", slug: "fresh-snapback", description: "Six-panel structured cap", price: 2600, category: "caps", sizes: ["OS"], stock: { OS: 20 }, images: ["/collection1.jpeg"], isFeatured: false, createdAt: new Date("2024-01-01") },
              { id: "c2", name: "Beard Mafia", slug: "beard-mafia", description: "Premium jacket", price: 8500, category: "men", sizes: ["S", "M", "L", "XL"], stock: { S: 10, M: 12, L: 8, XL: 6 } as Record<string, number>, images: ["/collection2.jpeg"], isFeatured: false, createdAt: new Date("2024-01-01") },
              { id: "c3", name: "Fresh Logo", slug: "fresh-logo", description: "Premium cotton t-shirt", price: 3500, category: "women", sizes: ["XS", "S", "M", "L", "XL"], stock: { XS: 15, S: 20, M: 25, L: 20, XL: 15 } as Record<string, number>, images: ["/collection3.jpeg"], isFeatured: false, createdAt: new Date("2024-01-01") },
              { id: "c4", name: "Culture Cap", slug: "culture-cap", description: "Low-profile dad cap", price: 2800, category: "caps", sizes: ["OS"], stock: { OS: 18 }, images: ["/collection4.jpeg"], isFeatured: false, createdAt: new Date("2024-01-01") },
            ].map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      </ScrollAnimation>

      {/* FEATURED LINEUP */}
      <ScrollAnimation direction="up" delay={0.3}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20">
          <div className="flex items-end justify-between mb-6 sm:mb-8">
            <div>
              <span className="text-[11px] uppercase tracking-[0.3em] text-black/50">
                The Lineup
              </span>
              <h2 className="heading text-2xl sm:text-4xl lg:text-5xl mt-2">FRESH COLLECTION</h2>
            </div>
            <Link href="/shop" className="btn-ghost text-xs uppercase tracking-widest">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: "f1", name: "Fresh Snapback", slug: "fresh-snapback", description: "Six-panel structured cap", price: 2600, category: "caps", sizes: ["OS"], stock: { OS: 20 }, images: ["/cap1.jpeg"], isFeatured: false, createdAt: new Date("2024-01-01") },
              { id: "f2", name: "Beard Mafia", slug: "beard-mafia", description: "Premium jacket", price: 8500, category: "men", sizes: ["S", "M", "L", "XL"], stock: { S: 10, M: 12, L: 8, XL: 6 } as Record<string, number>, images: ["/jacket.jpeg"], isFeatured: false, createdAt: new Date("2024-01-01") },
              { id: "f3", name: "Fresh Logo", slug: "fresh-logo", description: "Premium cotton t-shirt", price: 3500, category: "women", sizes: ["XS", "S", "M", "L", "XL"], stock: { XS: 15, S: 20, M: 25, L: 20, XL: 15 } as Record<string, number>, images: ["/tshirt.png"], isFeatured: false, createdAt: new Date("2024-01-01") },
              { id: "f4", name: "Culture Cap", slug: "culture-cap", description: "Low-profile dad cap", price: 2800, category: "caps", sizes: ["OS"], stock: { OS: 18 }, images: ["/cap2.jpeg"], isFeatured: false, createdAt: new Date("2024-01-01") },
            ].map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      </ScrollAnimation>

    </div>
  );
  } catch (error) {
    console.error("Error fetching products:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="heading text-2xl mb-4">Loading Error</h1>
          <p className="text-black/60 mb-4">Unable to load products. Please try again later.</p>
          <p className="text-xs text-black/40 font-mono">{errorMessage}</p>
        </div>
      </div>
    );
  }
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="card p-6">
      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center mb-4 shadow-sm">
        {icon}
      </div>
      <h3 className="font-bold uppercase tracking-wide">{title}</h3>
      <p className="text-sm text-black/60 mt-1">{text}</p>
    </div>
  );
}

function FeatureTile({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="card p-6 text-center">
      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center mx-auto mb-3 shadow-sm">
        {icon}
      </div>
      <h4 className="font-bold uppercase tracking-wide text-sm">{title}</h4>
      <p className="text-xs text-black/60 mt-2 leading-relaxed">{text}</p>
    </div>
  );
}

function MiniProductCard({ p }: { p: ProductView }) {
  return (
    <Link href={`/product/${p.slug}`} className="card p-2 sm:p-4 flex flex-col group">
      <div className="relative aspect-square bg-[#f4f4f4] rounded-lg sm:rounded-xl overflow-hidden">
        {p.images[0] && (
          <Image src={p.images[0]} alt={p.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
        )}
      </div>
      <div className="mt-2 sm:mt-3 flex items-start justify-between gap-1 sm:gap-2">
        <div className="min-w-0">
          <p className="font-bold uppercase text-[10px] sm:text-xs md:text-sm truncate">{p.name}</p>
          <p className="text-[10px] sm:text-xs text-black/50">{formatPrice(p.price)}</p>
        </div>
        <div className="flex gap-0.5 mt-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-black" />
          <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
          <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
        </div>
      </div>
    </Link>
  );
}
