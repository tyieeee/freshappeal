import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-5 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and track customer orders</p>
      </div>

      {/* MOBILE: card list */}
      <div className="sm:hidden space-y-3">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/admin/orders/${o.id}`}
            className="block bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="font-mono text-xs text-gray-900 font-semibold">#{o.id.slice(-8)}</p>
              <StatusBadge status={o.status} />
            </div>
            <p className="font-medium text-sm text-gray-900 truncate">{o.customerName}</p>
            <p className="text-xs text-gray-500 truncate">{o.customerEmail}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="font-bold text-sm text-gray-900">{formatPrice(o.totalAmount)}</span>
              <span className="text-xs text-gray-500">{o.createdAt.toLocaleDateString()}</span>
            </div>
          </Link>
        ))}
        {orders.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-400 text-sm">
            No orders yet.
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

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    shipped: "bg-blue-50 text-blue-700 border-blue-200",
    delivered: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${colors[status] ?? "bg-gray-50 text-gray-700 border-gray-200"}`}>
      {status}
    </span>
  );
}
