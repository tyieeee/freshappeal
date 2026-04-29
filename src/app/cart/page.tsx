"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, setQty, remove, total } = useCart();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="heading text-5xl mb-10">Your Bag</h1>
      {items.length === 0 ? (
        <div className="text-center py-20 card">
          <p className="text-black/50 mb-6">Your bag is empty.</p>
          <Link href="/shop" className="btn-neon">Shop Now</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map((i) => (
              <div
                key={`${i.productId}-${i.size}`}
                className="card p-4 flex gap-4"
              >
                <div className="relative w-24 h-32 bg-white rounded-xl overflow-hidden shrink-0">
                  {i.image && <Image src={i.image} alt={i.name} fill className="object-cover" />}
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between gap-2">
                    <Link href={`/product/${i.slug}`} className="font-bold hover:underline">
                      {i.name}
                    </Link>
                    <button
                      onClick={() => remove(i.productId, i.size)}
                      className="text-black/40 hover:text-black"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-black/50 mt-1">Size: {i.size}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center bg-white border border-black/10 rounded-full">
                      <button onClick={() => setQty(i.productId, i.size, i.qty - 1)} className="p-2 hover:text-black/60">
                        <Minus size={14} />
                      </button>
                      <span className="px-4">{i.qty}</span>
                      <button onClick={() => setQty(i.productId, i.size, i.qty + 1)} className="p-2 hover:text-black/60">
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="font-bold text-lg">{formatPrice(i.price * i.qty)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="card p-6 h-fit space-y-4">
            <h2 className="heading text-2xl">Summary</h2>
            <div className="flex justify-between text-sm">
              <span className="text-black/60">Subtotal</span>
              <span>{hasMounted ? formatPrice(total()) : formatPrice(0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-black/60">Shipping</span>
              <span>{hasMounted && total() >= 10000 ? "Free" : "$10.00"}</span>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-4 text-lg font-bold">
              <span>Total</span>
              <span>{hasMounted ? formatPrice(total() >= 10000 ? total() : total() + 1000) : formatPrice(0)}</span>
            </div>
            <Link href="/checkout" className="btn-neon w-full">Checkout</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
