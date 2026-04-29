import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, parseJSON } from "@/lib/utils";
import { OrderStatusForm } from "@/components/order-status-form";

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

  return (
    <div>
      <h1 className="heading text-4xl mb-2">Order #{order.id.slice(-8)}</h1>
      <p className="text-white/40 text-sm mb-8">
        {order.createdAt.toLocaleString()}
      </p>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 border border-white/10 p-6">
          <h2 className="heading text-2xl mb-4">Items</h2>
          <div className="space-y-2">
            {items.map((i, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{i.qty}× {i.name} <span className="text-white/40">({i.size})</span></span>
                <span>{formatPrice(i.price * i.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold">
              <span>Total</span><span className="text-white">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </section>

        <aside className="border border-white/10 p-6 space-y-5">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-white/40 mb-2">Customer</h3>
            <p className="font-bold">{order.customerName}</p>
            <p className="text-sm text-white/60">{order.customerEmail}</p>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-widest text-white/40 mb-2">Shipping</h3>
            <p className="text-sm text-white/80">
              {addr.line1}<br />
              {addr.city}, {addr.state} {addr.postal}<br />
              {addr.country}
            </p>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-widest text-white/40 mb-2">Status</h3>
            <OrderStatusForm id={order.id} status={order.status} />
          </div>
        </aside>
      </div>
    </div>
  );
}
