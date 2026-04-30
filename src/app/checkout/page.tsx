"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/cart-store";
import { useProfile } from "@/lib/profile-store";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "./actions";
import { ChevronDown, ChevronUp, MapPin, Check } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, total, clear } = useCart();
  const { fullName, address } = useProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [useSaved, setUseSaved] = useState(false);

  useEffect(() => setMounted(true), []);

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

  const OrderSummary = () => (
    <>
      <div className="space-y-3">
        {items.map((i) => (
          <div key={`${i.productId}-${i.size}`} className="flex gap-3">
            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              {i.image && (
                <Image src={i.image} alt={i.name} fill sizes="64px" className="object-cover" unoptimized />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{i.name}</p>
              <p className="text-xs text-black/60">Size: {i.size} · Qty: {i.qty}</p>
              <p className="text-sm font-bold mt-0.5">{formatPrice(i.price * i.qty)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-black/10 mt-4 pt-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-black/60">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
        <div className="flex justify-between"><span className="text-black/60">Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
        <div className="flex justify-between text-base font-bold pt-2 border-t border-black/10">
          <span>Total</span><span>{formatPrice(grand)}</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <h1 className="heading text-3xl sm:text-5xl mb-6 sm:mb-8">Checkout</h1>

      {/* MOBILE: Collapsible order summary at top */}
      <div className="lg:hidden mb-5">
        <button
          onClick={() => setSummaryOpen(!summaryOpen)}
          className="w-full card p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {/* Stack of product image previews */}
            <div className="flex -space-x-2">
              {items.slice(0, 3).map((i) => (
                <div key={`${i.productId}-${i.size}`} className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border-2 border-white">
                  {i.image && <Image src={i.image} alt={i.name} fill sizes="40px" className="object-cover" unoptimized />}
                </div>
              ))}
              {items.length > 3 && (
                <div className="w-10 h-10 rounded-lg bg-black text-white text-xs flex items-center justify-center border-2 border-white font-bold">
                  +{items.length - 3}
                </div>
              )}
            </div>
            <div className="text-left">
              <p className="text-xs text-black/60 uppercase tracking-widest">{itemCount} {itemCount === 1 ? "item" : "items"}</p>
              <p className="font-bold text-sm">{summaryOpen ? "Hide details" : "Show details"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">{formatPrice(grand)}</span>
            {summaryOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>

        {summaryOpen && (
          <div className="card p-5 mt-2">
            <OrderSummary />
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 min-w-0">
        <form onSubmit={handleSubmit} className="card p-5 sm:p-8 space-y-4 sm:space-y-5 min-w-0 overflow-hidden">
          <h2 className="heading text-xl sm:text-2xl">Shipping Details</h2>

          {/* Saved address banner */}
          {mounted && address && (
            <div className={`rounded-xl border p-4 transition-colors overflow-hidden ${useSaved ? "border-black bg-black/[0.03]" : "border-black/15"}`}>
              <div className="flex items-start gap-3 min-w-0">
                <MapPin size={18} className="text-black/50 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-black/50 mb-1">Saved address</p>
                  <p className="text-sm font-bold break-words">{address.line1}</p>
                  <p className="text-xs text-black/60 break-words">
                    {address.city}, {address.state} {address.postal}, {address.country}
                  </p>
                </div>
                {useSaved && <Check size={18} className="text-black shrink-0" />}
              </div>
              <button
                type="button"
                onClick={() => setUseSaved(!useSaved)}
                className={`mt-3 w-full text-xs uppercase tracking-widest font-bold py-2 rounded-full border transition-colors ${
                  useSaved
                    ? "border-black/20 text-black/60 hover:text-black"
                    : "border-black bg-black text-white hover:bg-black/90"
                }`}
              >
                {useSaved ? "Enter different address" : "Use saved address"}
              </button>
            </div>
          )}

          {/* Form fields — hidden when using saved address (still rendered as hidden inputs to submit values) */}
          {mounted && useSaved && address ? (
            <>
              <input type="hidden" name="email" value={session?.user?.email ?? ""} />
              <input type="hidden" name="name" value={fullName || session?.user?.name || ""} />
              <input type="hidden" name="line1" value={address.line1} />
              <input type="hidden" name="city" value={address.city} />
              <input type="hidden" name="state" value={address.state} />
              <input type="hidden" name="postal" value={address.postal} />
              <input type="hidden" name="country" value={address.country} />
              <div>
                <label className="label">Email for receipt</label>
                <input
                  type="email"
                  required
                  className="input"
                  defaultValue={session?.user?.email ?? ""}
                  onChange={(e) => {
                    const hidden = e.currentTarget.form?.elements.namedItem("email") as HTMLInputElement | null;
                    if (hidden) hidden.value = e.currentTarget.value;
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="label">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="input"
                  defaultValue={mounted ? session?.user?.email ?? "" : ""}
                  key={`email-${mounted}`}
                />
              </div>
              <div>
                <label className="label">Full name</label>
                <input
                  name="name"
                  required
                  className="input"
                  defaultValue={mounted ? fullName || session?.user?.name || "" : ""}
                  key={`name-${mounted}`}
                />
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
              <div>
                <label className="label">Postal code</label>
                <input name="postal" required className="input" />
              </div>
              <input type="hidden" name="country" value="Philippines" />
              {!address && mounted && (
                <p className="text-xs text-black/50">
                  Tip: Save your address on your <Link href="/dashboard" className="underline">dashboard</Link> for faster checkout next time.
                </p>
              )}
            </>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            disabled={loading || items.length === 0}
            className="btn-neon w-full disabled:opacity-40"
          >
            {loading ? "Placing order..." : `Pay ${formatPrice(grand)}`}
          </button>
          <p className="text-[10px] text-black/40">
            Mock checkout for local development. No real charge is made.
          </p>
        </form>

        {/* DESKTOP: Order Summary sidebar */}
        <aside className="card p-6 sm:p-8 h-fit hidden lg:block">
          <h2 className="heading text-2xl mb-4">Order Summary</h2>
          <OrderSummary />
        </aside>
      </div>
    </div>
  );
}
