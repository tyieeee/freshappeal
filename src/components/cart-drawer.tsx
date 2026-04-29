"use client";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export function CartDrawer() {
  const { items, isOpen, close, setQty, remove, total } = useCart();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-white border-l border-black/10 flex flex-col transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-black/10">
          <h2 className="heading text-xl tracking-widest">Your Bag</h2>
          <button onClick={close} className="hover:text-black/60" aria-label="Close cart">
            <X size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 && (
            <p className="text-black/50 text-sm">Your bag is empty. Go grab something fresh.</p>
          )}
          {items.map((i) => (
            <div key={`${i.productId}-${i.size}`} className="flex gap-3 border-b border-black/5 pb-4">
              <div className="relative w-20 h-24 bg-[#f4f4f4] rounded-lg overflow-hidden shrink-0">
                {i.image && <Image src={i.image} alt={i.name} fill className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <p className="font-bold text-sm truncate">{i.name}</p>
                  <button
                    onClick={() => remove(i.productId, i.size)}
                    className="text-black/40 hover:text-black"
                    aria-label="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-xs text-black/50 mt-0.5">Size: {i.size}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-black/15 rounded-full">
                    <button
                      onClick={() => setQty(i.productId, i.size, i.qty - 1)}
                      className="px-3 py-1 hover:text-black/60"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-3 text-sm">{i.qty}</span>
                    <button
                      onClick={() => setQty(i.productId, i.size, i.qty + 1)}
                      className="px-3 py-1 hover:text-black/60"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="font-bold">{formatPrice(i.price * i.qty)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-black/10 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-black/60">Subtotal</span>
            <span className="font-bold text-lg">{hasMounted ? formatPrice(total()) : formatPrice(0)}</span>
          </div>
          <Link
            href="/checkout"
            onClick={close}
            className={`btn-neon w-full ${items.length === 0 ? "pointer-events-none opacity-40" : ""}`}
          >
            Checkout
          </Link>
        </div>
      </aside>
    </>
  );
}
