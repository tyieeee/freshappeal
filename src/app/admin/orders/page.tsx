import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "shipped", "delivered", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const filter = (searchParams.status ?? "").toLowerCase();
  const where = STATUSES.includes(filter as Status) ? { status: filter } : {};

  const [orders, all] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: "desc" } }),
    prisma.order.findMany({ select: { status: true, totalAmount: true } }),
  ]);

  const totalRevenue = all.reduce((s, o) => s + o.totalAmount, 0);
  const counts: Record<string, number> = { all: all.length };
  for (const s of STATUSES) counts[s] = 0;
  for (const o of all) counts[o.status] = (counts[o.status] ?? 0) + 1;

  return (
    <div>
      <div className="mb-5 sm:mb-7">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and track customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
        <StatCard label="All Orders" value={counts.all.toString()} />
        <StatCard label="Pending" value={(counts.pending ?? 0).toString()} accent="amber" />
        <StatCard label="Delivered" value={(counts.delivered ?? 0).toString()} accent="green" />
        <StatCard label="Revenue" value={formatPrice(totalRevenue)} />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 mb-4 pb-1">
        <FilterPill href="/admin/orders" active={!filter} label={`All (${counts.all})`} />
        {STATUSES.map((s) => (
          <FilterPill
            key={s}
            href={`/admin/orders?status=${s}`}
            active={filter === s}
            label={`${s} (${counts[s] ?? 0})`}
          />
        ))}
      </div>

      {/* MOBILE: card list */}
      <div className="sm:hidden space-y-2.5">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/admin/orders/${o.id}`}
            className="group block bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-gray-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="font-mono text-[11px] text-gray-500 mb-0.5">#{o.id.slice(-8)}</p>
                <p className="font-semibold text-sm text-gray-900 truncate">{o.customerName}</p>
                <p className="text-xs text-gray-500 truncate">{o.customerEmail}</p>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="font-bold text-base text-gray-900">{formatPrice(o.totalAmount)}</span>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                {o.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
        {orders.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-sm text-gray-400">
            No orders {filter ? `with status "${filter}"` : "yet"}.
          </div>
        )}
      </div>

      {/* DESKTOP: table */}
      <div className="hidden sm:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600 border-b border-gray-200">
              <tr>
                <th className="text-left p-4">Order</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Total</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-xs">
                    <Link href={`/admin/orders/${o.id}`} className="text-gray-900 font-semibold hover:text-blue-600">
                      #{o.id.slice(-8)}
                    </Link>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{o.customerName}</div>
                    <div className="text-xs text-gray-500">{o.customerEmail}</div>
                  </td>
                  <td className="p-4 font-semibold text-gray-900">{formatPrice(o.totalAmount)}</td>
                  <td className="p-4">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="p-4 text-gray-500 text-xs">
                    {o.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "amber" | "green";
}) {
  const accentBar =
    accent === "amber"
      ? "bg-amber-500"
      : accent === "green"
        ? "bg-emerald-500"
        : "bg-gray-900";
  return (
    <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 overflow-hidden">
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${accentBar}`} aria-hidden />
      <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest font-medium">
        {label}
      </p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1.5 truncate">{value}</p>
    </div>
  );
}

function FilterPill({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium border capitalize transition-colors ${
        active
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
      }`}
    >
      {label}
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    shipped: "bg-blue-50 text-blue-700 border-blue-200",
    delivered: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex shrink-0 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide rounded-full border ${colors[status] ?? "bg-gray-50 text-gray-700 border-gray-200"}`}>
      {status}
    </span>
  );
}
