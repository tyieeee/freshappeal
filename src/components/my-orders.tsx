"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Truck, CheckCircle2, XCircle, ChevronRight, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type OrderItem = {
  productId: string;
  name: string;
  size: string;
  qty: number;
  price: number;
};

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: { line1: string; city: string; state: string; postal: string; country: string } | null;
};

const STAGES = ["pending", "shipped", "delivered"] as const;

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Order placed",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    icon: <Package size={14} />,
  },
  shipped: {
    label: "Shipped",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    icon: <Truck size={14} />,
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    icon: <CheckCircle2 size={14} />,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: <XCircle size={14} />,
  },
};

export function MyOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/my-orders")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err) => !cancelled && setError(String(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  if (orders === null && !error) {
    return (
      <div className="card p-5 sm:p-7">
        <h2 className="heading text-xl sm:text-2xl mb-4">Your Orders</h2>
        <div className="border-t border-black/10 pt-6 text-sm text-black/40">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-5 sm:p-7">
        <h2 className="heading text-xl sm:text-2xl mb-4">Your Orders</h2>
        <div className="border-t border-black/10 pt-6 text-sm text-red-600">Failed to load orders.</div>
      </div>
    );
  }

  return (
    <section className="card p-5 sm:p-7 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="heading text-xl sm:text-2xl">Your Orders</h2>
        {orders && orders.length > 0 && (
          <span className="text-xs text-black/50">
            {orders.length} order{orders.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {orders && orders.length === 0 ? (
        <div className="border-t border-black/10 pt-8 text-center">
          <ShoppingBag size={28} className="mx-auto text-black/30 mb-3" />
          <p className="text-sm text-black/60 mb-4">You haven&apos;t placed any orders yet.</p>
          <Link href="/shop" className="btn-neon">
            <ShoppingBag size={16} /> Start Shopping
          </Link>
        </div>
      ) : (
        <div className="border-t border-black/10 -mx-1">
          {orders!.map((o) => {
            const meta = STATUS_META[o.status] ?? STATUS_META.pending;
            const isOpen = expanded === o.id;
            const stageIdx = STAGES.indexOf(o.status as (typeof STAGES)[number]);
            const isCancelled = o.status === "cancelled";
            const date = new Date(o.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div key={o.id} className="border-b border-black/10 last:border-b-0">
                <button
                  onClick={() => setExpanded(isOpen ? null : o.id)}
                  className="w-full flex items-center gap-3 px-1 py-4 text-left hover:bg-black/[0.02] transition-colors rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-black/50">#{o.id.slice(-8)}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color}`}
                      >
                        {meta.icon}
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-sm font-bold mt-1 truncate">
                      {o.items.length} item{o.items.length === 1 ? "" : "s"} · {formatPrice(o.totalAmount)}
                    </p>
                    <p className="text-xs text-black/50 mt-0.5">Placed on {date}</p>
                  </div>
                  <ChevronRight
                    size={18}
                    className={`text-black/30 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-1 pb-5 space-y-4">
                    {/* Tracker */}
                    {!isCancelled ? (
                      <div className="bg-white rounded-xl border border-black/5 p-4">
                        <p className="text-[10px] uppercase tracking-widest text-black/50 mb-3">
                          Tracking
                        </p>
                        <div className="flex items-center">
                          {STAGES.map((stage, i) => {
                            const reached = i <= stageIdx;
                            const sMeta = STATUS_META[stage];
                            return (
                              <div key={stage} className="flex items-center flex-1 last:flex-none">
                                <div className="flex flex-col items-center gap-1.5">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                                      reached
                                        ? "bg-black border-black text-white"
                                        : "bg-white border-black/20 text-black/30"
                                    }`}
                                  >
                                    {sMeta.icon}
                                  </div>
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                                      reached ? "text-black" : "text-black/30"
                                    }`}
                                  >
                                    {sMeta.label}
                                  </span>
                                </div>
                                {i < STAGES.length - 1 && (
                                  <div
                                    className={`flex-1 h-0.5 mx-1 -mt-5 transition-colors ${
                                      i < stageIdx ? "bg-black" : "bg-black/15"
                                    }`}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className={`rounded-xl border p-3 text-sm flex items-center gap-2 ${meta.bg} ${meta.color}`}>
                        <XCircle size={16} /> This order was cancelled.
                      </div>
                    )}

                    {/* Items */}
                    <div className="bg-white rounded-xl border border-black/5 divide-y divide-black/5">
                      {o.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 px-4 py-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{it.name}</p>
                            <p className="text-[11px] text-black/50">
                              Size {it.size} · Qty {it.qty}
                            </p>
                          </div>
                          <span className="text-sm font-semibold shrink-0">
                            {formatPrice(it.price * it.qty)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Address */}
                    {o.shippingAddress && (
                      <div className="text-xs text-black/60">
                        <span className="font-semibold text-black/80">Ship to:</span>{" "}
                        {o.shippingAddress.line1}, {o.shippingAddress.city}, {o.shippingAddress.state}{" "}
                        {o.shippingAddress.postal}, {o.shippingAddress.country}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
