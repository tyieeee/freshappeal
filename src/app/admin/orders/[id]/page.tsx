import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, parseJSON } from "@/lib/utils";
import { OrderStatusForm } from "@/components/order-status-form";
import { ArrowLeft, Mail, MapPin, Package, User } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default async function OrderDetail({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) notFound();

  const items = parseJSON<Array<{ name: string; size: string; qty: number; price: number }>>(
    order.items,
    [],
  );
  const addr = parseJSON<{
    line1: string;
    city: string;
    state: string;
    postal: string;
    country: string;
  }>(order.shippingAddress, {} as never);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = order.totalAmount - subtotal;
  const statusBadge =
    STATUS_STYLES[order.status] ?? "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6 sm:mb-8">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Order</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-mono break-all">
            #{order.id.slice(-8)}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed{" "}
            {order.createdAt.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            at{" "}
            {order.createdAt.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span
          className={`inline-flex px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full border ${statusBadge}`}
        >
          {order.status}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* ITEMS */}
        <section className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Package size={16} className="text-gray-500" />
            <h2 className="font-semibold text-gray-900">
              Items ({items.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {items.map((i, idx) => (
              <div
                key={idx}
                className="px-5 sm:px-6 py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {i.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Size {i.size} · Qty {i.qty} ·{" "}
                    {formatPrice(i.price)} each
                  </p>
                </div>
                <span className="font-semibold text-sm text-gray-900 shrink-0">
                  {formatPrice(i.price * i.qty)}
                </span>
              </div>
            ))}
            {items.length === 0 && (
              <p className="px-5 sm:px-6 py-6 text-center text-sm text-gray-400">
                No items recorded.
              </p>
            )}
          </div>
          <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{shipping <= 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </section>

        {/* SIDEBAR */}
        <div className="space-y-4 sm:space-y-6">
          {/* Status */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3">
              Update Status
            </h3>
            <OrderStatusForm id={order.id} status={order.status} />
          </section>

          {/* Customer */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3 flex items-center gap-1.5">
              <User size={12} /> Customer
            </h3>
            <p className="font-semibold text-gray-900 text-sm">
              {order.customerName}
            </p>
            <a
              href={`mailto:${order.customerEmail}`}
              className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1.5 mt-1 break-all"
            >
              <Mail size={13} className="shrink-0" />
              <span className="truncate">{order.customerEmail}</span>
            </a>
          </section>

          {/* Shipping */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3 flex items-center gap-1.5">
              <MapPin size={12} /> Shipping Address
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {addr.line1}
              <br />
              {addr.city}, {addr.state} {addr.postal}
              <br />
              {addr.country}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
