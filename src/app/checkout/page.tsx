"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/cart-store";
import { useProfile } from "@/lib/profile-store";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "./actions";
import {
  ChevronLeft,
  Pencil,
  Plus,
  Minus,
  Truck,
  Wallet,
  Building2,
  Sparkles,
  Mail,
  User as UserIcon,
  Home,
  Phone,
} from "lucide-react";

type PaymentMethod = "card" | "bank" | "cod";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, total, clear, setQty } = useCart();
  const { fullName, phone, address } = useProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [useSaved, setUseSaved] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>("cod");

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && address) setUseSaved(true);
  }, [mounted, address]);

  const subtotal = total();
  const shipping = subtotal >= 10000 ? 0 : 1000;
  const grand = subtotal + shipping;

  // Estimated delivery date (3-5 days)
  const deliveryDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  })();

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

  const itemCount = items.reduce((s, i) => s + i.qty, 0);

  // Avoid hydration mismatch — cart is persisted in localStorage so SSR has 0 items
  if (!mounted) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <h1 className="heading text-3xl sm:text-5xl mb-6 sm:mb-8">Checkout</h1>
        <div className="card p-8 text-center text-black/50">Loading...</div>
      </div>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="heading text-3xl mb-3">Your cart is empty</h1>
        <p className="text-black/60 mb-6">Add something before checking out.</p>
        <Link href="/shop" className="btn-neon">Browse Shop</Link>
      </div>
    );
  }

  const inputCls =
    "w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all";
  const inputWithIcon = `${inputCls} pl-11`;
  const labelCls = "block text-xs font-semibold text-black/50 mb-1.5";

  return (
    <div className="bg-gray-50 pb-28 lg:pb-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5 sm:mb-7">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-center flex-1 -ml-10">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-5 lg:gap-8 items-start">
          {/* LEFT: Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ADDRESS CARD */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold">Address</h2>
                {address && useSaved ? (
                  <button
                    type="button"
                    onClick={() => setUseSaved(false)}
                    className="text-violet-600 hover:text-violet-700 p-1"
                    aria-label="Edit address"
                  >
                    <Pencil size={16} />
                  </button>
                ) : null}
              </div>

              {address && useSaved ? (
                <div className="space-y-1.5">
                  <p className="text-sm text-black/80 leading-relaxed">
                    {address.line1},
                    <br />
                    {address.city}, {address.state}, {address.country}. {address.postal}
                  </p>
                  {phone && (
                    <p className="text-sm text-black/60 pt-1">
                      <span className="text-black/50">Phone</span>
                      <span className="text-black/30 mx-1.5">:</span>
                      {phone}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Email</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                      <input
                        name="email"
                        type="email"
                        required
                        className={inputWithIcon}
                        placeholder="you@example.com"
                        defaultValue={session?.user?.email ?? ""}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Full name</label>
                    <div className="relative">
                      <UserIcon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                      <input
                        name="name"
                        required
                        className={inputWithIcon}
                        placeholder="Juan dela Cruz"
                        defaultValue={fullName || session?.user?.name || ""}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Phone (optional)</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                      <input
                        type="tel"
                        className={inputWithIcon}
                        placeholder="+63 9XX XXX XXXX"
                        defaultValue={phone}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Street address</label>
                    <div className="relative">
                      <Home size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                      <input name="line1" required className={inputWithIcon} placeholder="123 Main St, Unit 4B" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>City</label>
                      <input name="city" required className={inputCls} placeholder="Manila" />
                    </div>
                    <div>
                      <label className={labelCls}>State / Region</label>
                      <input name="state" required className={inputCls} placeholder="NCR" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Postal code</label>
                      <input name="postal" required className={inputCls} placeholder="1000" />
                    </div>
                    <div>
                      <label className={labelCls}>Country</label>
                      <input value="Philippines" disabled className={`${inputCls} bg-black/[0.03] text-black/50 cursor-not-allowed`} />
                    </div>
                  </div>
                  <input type="hidden" name="country" value="Philippines" />
                  {address && (
                    <button
                      type="button"
                      onClick={() => setUseSaved(true)}
                      className="text-xs text-violet-600 hover:text-violet-700 font-semibold"
                    >
                      ← Use saved address
                    </button>
                  )}
                </div>
              )}

              {/* hidden inputs when using saved */}
              {useSaved && address && (
                <>
                  <input type="hidden" name="email" value={session?.user?.email ?? ""} />
                  <input type="hidden" name="name" value={fullName || session?.user?.name || ""} />
                  <input type="hidden" name="line1" value={address.line1} />
                  <input type="hidden" name="city" value={address.city} />
                  <input type="hidden" name="state" value={address.state} />
                  <input type="hidden" name="postal" value={address.postal} />
                  <input type="hidden" name="country" value={address.country} />
                </>
              )}
            </div>

            {/* CART ITEMS */}
            <div className="space-y-3">
              {items.map((i) => (
                <div
                  key={`${i.productId}-${i.size}`}
                  className="bg-white rounded-2xl border border-black/5 shadow-sm p-4 flex items-center gap-4"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    {i.image && (
                      <Image src={i.image} alt={i.name} fill sizes="80px" className="object-cover" unoptimized />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-black/50">Fresh Appeal</p>
                    <p className="font-bold text-sm leading-tight truncate">{i.name}</p>
                    <p className="text-[11px] text-black/50 mt-0.5 mb-2">
                      Size: <span className="text-black/80 font-medium">{i.size}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQty(i.productId, i.size, Math.max(1, i.qty - 1))}
                        disabled={i.qty <= 1}
                        className="w-7 h-7 rounded-lg border border-black/15 text-black hover:border-black hover:bg-black hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="font-bold text-sm w-6 text-center tabular-nums">{i.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(i.productId, i.size, i.qty + 1)}
                        className="w-7 h-7 rounded-lg bg-black text-white hover:bg-black/85 flex items-center justify-center transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right shrink-0 self-start">
                    <p className="font-bold text-sm">{formatPrice(i.price * i.qty)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* SHIPPING */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Truck size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Shipping</h3>
                    <p className="text-sm text-black/70 mt-0.5">
                      {shipping === 0 ? "Free" : formatPrice(shipping)} · Standard
                    </p>
                    <p className="text-xs text-black/50">Delivery by {deliveryDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5">
              <h3 className="text-sm font-bold mb-3">Payment Method</h3>
              <div className="space-y-2">
                {[
                  { id: "cod" as const, label: "Cash on Delivery", desc: "Pay when you receive", icon: <Sparkles size={18} className="text-amber-500" />, disabled: false },
                  { id: "card" as const, label: "Pay with Card", desc: "Coming soon", icon: <Wallet size={18} className="text-violet-600" />, disabled: true },
                  { id: "bank" as const, label: "Pay with Bank Transfer", desc: "Coming soon", icon: <Building2 size={18} className="text-emerald-600" />, disabled: true },
                ].map((opt) => {
                  const active = payment === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => !opt.disabled && setPayment(opt.id)}
                      disabled={opt.disabled}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        active
                          ? "border-black bg-black/[0.03]"
                          : opt.disabled
                            ? "border-transparent opacity-50 cursor-not-allowed"
                            : "border-transparent hover:bg-black/[0.02]"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          active ? "border-black" : "border-black/20"
                        }`}
                      >
                        {active && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-white border border-black/5 flex items-center justify-center shrink-0">
                        {opt.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{opt.label}</p>
                        <p className="text-[11px] text-black/50">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* DESKTOP submit */}
            <button
              disabled={loading || items.length === 0}
              className="hidden lg:flex w-full items-center justify-center gap-2 bg-black hover:bg-black/85 text-white font-bold px-6 py-4 rounded-xl text-sm transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-black/15"
            >
              {loading ? "Placing order..." : `Checkout · ${formatPrice(grand)}`}
            </button>
          </form>

          {/* RIGHT: Sticky desktop order summary */}
          <aside className="hidden lg:block sticky top-6 bg-white rounded-2xl border border-black/5 shadow-sm p-6">
            <h2 className="text-sm font-bold mb-4">Product Summary</h2>
            <div className="space-y-2.5 text-sm">
              <Row label="Items" value={`${itemCount} ${itemCount === 1 ? "item" : "items"}`} />
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              <Row label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} />
              <div className="border-t border-black/10 pt-3 mt-3">
                <Row label="Total" value={formatPrice(grand)} bold />
              </div>
            </div>
            <p className="text-[10px] text-black/40 text-center mt-4">
              Mock checkout for local development. No real charge.
            </p>
          </aside>
        </div>
      </div>

      {/* MOBILE: sticky bottom checkout button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-black/5 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-black/50">Total</span>
          <span className="text-lg font-bold">{formatPrice(grand)}</span>
        </div>
        <button
          form=""
          onClick={(e) => {
            // submit the visible form
            const form = (e.currentTarget.closest("body") as HTMLElement | null)?.querySelector("form");
            if (form) (form as HTMLFormElement).requestSubmit();
          }}
          disabled={loading || items.length === 0}
          className="w-full inline-flex items-center justify-center gap-2 bg-black hover:bg-black/85 text-white font-bold px-6 py-4 rounded-2xl text-sm transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-black/15"
        >
          {loading ? "Placing order..." : "Checkout"}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-bold text-base" : ""}`}>
      <span className={bold ? "" : "text-black/60"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

