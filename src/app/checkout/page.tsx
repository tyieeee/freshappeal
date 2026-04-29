"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "./actions";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = total();
  const shipping = subtotal >= 10000 ? 0 : 1000;
  const grand = subtotal + shipping;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const { id } = await createOrder({
        customerEmail: String(fd.get("email")),
        customerName: String(fd.get("name")),
        shippingAddress: {
          line1: String(fd.get("line1")),
          city: String(fd.get("city")),
          state: String(fd.get("state")),
          postal: String(fd.get("postal")),
          country: String(fd.get("country")),
        },
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          size: i.size,
          qty: i.qty,
          price: i.price,
        })),
      });
      clear();
      router.push(`/checkout/success?id=${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-2 gap-8">
      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
        <h1 className="heading text-4xl mb-4">Checkout</h1>
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" required className="input" />
        </div>
        <div>
          <label className="label">Full name</label>
          <input name="name" required className="input" />
        </div>
        <div>
          <label className="label">Address</label>
          <input name="line1" required className="input" placeholder="Street address" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">City</label>
            <input name="city" required className="input" />
          </div>
          <div>
            <label className="label">State / Region</label>
            <input name="state" required className="input" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Postal code</label>
            <input name="postal" required className="input" />
          </div>
          <div>
            <label className="label">Country</label>
            <input name="country" required defaultValue="US" className="input" />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          disabled={loading || items.length === 0}
          className="btn-neon w-full disabled:opacity-40"
        >
          {loading ? "Placing order..." : `Pay ${formatPrice(grand)}`}
        </button>
        <p className="text-xs text-black/40">
          Mock checkout for local development. No real charge is made.
        </p>
      </form>

      <aside className="card p-6 sm:p-8 h-fit">
        <h2 className="heading text-2xl mb-4">Order Summary</h2>
        <div className="space-y-4">
          {items.map((i) => (
            <div key={`${i.productId}-${i.size}`} className="flex gap-4">
              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={i.image}
                  alt={i.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{i.name}</p>
                <p className="text-sm text-black/60">Size: {i.size}</p>
                <p className="text-sm text-black/60">Qty: {i.qty}</p>
                <p className="text-sm font-bold mt-1">{formatPrice(i.price * i.qty)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-black/10 mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-black/60">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-black/60">Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-black/10">
            <span>Total</span><span>{formatPrice(grand)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
