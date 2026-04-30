import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { ProductView } from "@/lib/utils";

export function ProductCard({ p }: { p: ProductView }) {
  const img = p.images[0];
  return (
    <Link
      href={`/product/${p.slug}`}
      className="group block"
    >
      <div className="relative aspect-square bg-[#f4f4f4] rounded-xl sm:rounded-2xl overflow-hidden">
        {img && (
          <Image
            src={img}
            alt={p.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        {p.isFeatured && (
          <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
            Featured
          </span>
        )}
      </div>
      <div className="px-1 pt-2 sm:pt-3 flex justify-between items-start gap-1 sm:gap-2">
        <div className="min-w-0">
          <p className="font-bold uppercase text-[10px] sm:text-xs md:text-sm truncate group-hover:underline">
            {p.name}
          </p>
          <p className="text-[10px] sm:text-xs text-black/50">{formatPrice(p.price)}</p>
        </div>
        <div className="flex gap-0.5 mt-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-black" />
          <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
          <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
        </div>
      </div>
    </Link>
  );
}
