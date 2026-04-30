"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Package, ShoppingCart, AlertTriangle, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type OrderNotif = {
  id: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
};
type LowStockNotif = {
  id: string;
  name: string;
  slug: string;
  lowSizes: { size: string; qty: number }[];
};

const SEEN_KEY = "fresh-admin-notif-seen";

function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

export function AdminNotifications({
  variant = "header",
}: {
  variant?: "header" | "sidebar";
}) {
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState<OrderNotif[]>([]);
  const [lowStock, setLowStock] = useState<LowStockNotif[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSeen, setLastSeen] = useState<number>(0);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Initial load + poll every 60s
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/notifications", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setOrders(data.orders ?? []);
        setLowStock(data.lowStock ?? []);
      } catch {} finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Read lastSeen from storage
  useEffect(() => {
    const v = Number(localStorage.getItem(SEEN_KEY) ?? 0);
    setLastSeen(v);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(t) &&
        buttonRef.current &&
        !buttonRef.current.contains(t)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const newOrders = orders.filter((o) => new Date(o.createdAt).getTime() > lastSeen);
  const unread = newOrders.length + lowStock.length;
  const total = orders.length + lowStock.length;

  function markAllSeen() {
    const now = Date.now();
    localStorage.setItem(SEEN_KEY, String(now));
    setLastSeen(now);
  }

  function toggle() {
    if (!open) {
      // Opening — defer marking seen so user sees badge briefly
      setOpen(true);
      setTimeout(markAllSeen, 1200);
    } else {
      setOpen(false);
    }
  }

  const buttonCls =
    variant === "sidebar"
      ? "relative w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
      : "relative p-2 rounded-lg hover:bg-gray-100 text-gray-700";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggle}
        aria-label="Notifications"
        className={buttonCls}
      >
        <Bell size={variant === "sidebar" ? 18 : 20} />
        {variant === "sidebar" && <span>Notifications</span>}
        {unread > 0 && (
          <span
            className={`absolute ${
              variant === "sidebar" ? "right-3 top-1/2 -translate-y-1/2" : "-top-0.5 -right-0.5"
            } bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-sm`}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={popoverRef}
          className={`absolute z-50 ${
            variant === "sidebar"
              ? "left-full ml-2 bottom-0 w-80"
              : "right-0 mt-2 w-80 sm:w-96"
          } bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
              {total > 0 && (
                <span className="text-[10px] bg-gray-100 text-gray-600 font-bold rounded-full px-1.5 py-0.5">
                  {total}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
            >
              <X size={16} />
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="p-6 text-center text-xs text-gray-400">Loading...</div>
            ) : total === 0 ? (
              <div className="p-8 text-center">
                <Bell size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">You&apos;re all caught up</p>
              </div>
            ) : (
              <>
                {/* Low stock alerts */}
                {lowStock.length > 0 && (
                  <div className="bg-amber-50/50">
                    <div className="px-4 pt-3 pb-1.5">
                      <p className="text-[10px] uppercase tracking-widest text-amber-700 font-bold flex items-center gap-1.5">
                        <AlertTriangle size={11} /> Low Stock ({lowStock.length})
                      </p>
                    </div>
                    {lowStock.slice(0, 5).map((p) => (
                      <Link
                        key={p.id}
                        href={`/admin/products/${p.id}`}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 px-4 py-2.5 hover:bg-amber-100/50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                          <Package size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                          <p className="text-[11px] text-gray-600">
                            {p.lowSizes.map((s) => `${s.size}: ${s.qty}`).join(" · ")}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Recent orders */}
                {orders.length > 0 && (
                  <>
                    <div className="px-4 pt-3 pb-1.5">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold flex items-center gap-1.5">
                        <ShoppingCart size={11} /> Recent Orders ({orders.length})
                      </p>
                    </div>
                    {orders.map((o) => {
                      const isNew = new Date(o.createdAt).getTime() > lastSeen;
                      return (
                        <Link
                          key={o.id}
                          href={`/admin/orders/${o.id}`}
                          onClick={() => setOpen(false)}
                          className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors relative"
                        >
                          {isNew && (
                            <span
                              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"
                              aria-label="New"
                            />
                          )}
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <ShoppingCart size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              New order from {o.customerName}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {formatPrice(o.totalAmount)} · {timeAgo(o.createdAt)}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>

          {total > 0 && (
            <div className="border-t border-gray-100 px-4 py-2">
              <Link
                href="/admin/orders"
                onClick={() => setOpen(false)}
                className="block text-center text-xs font-semibold text-gray-700 hover:text-gray-900 py-1.5"
              >
                View all orders →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
