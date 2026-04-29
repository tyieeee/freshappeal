import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, parseJSON } from "@/lib/utils";
import { Check } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const order = searchParams.id
    ? await prisma.order.findUnique({ where: { id: searchParams.id } })
    : null;

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <h1 className="heading text-4xl">Order not found</h1>
        <Link href="/shop" className="btn-neon mt-6">Back to shop</Link>
      </div>
    );
  }

  const items = parseJSON<Array<{ name: string; size: string; qty: number; price: number }>>(
    order.items,
    [],
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-black text-white flex items-center justify-center">
          <Check size={32} />
        </div>
        <h1 className="heading text-5xl mt-6">Order Confirmed</h1>
        <p className="text-black/60 mt-3">
          Thanks {order.customerName}. We sent a confirmation to {order.customerEmail}.
        </p>
        <p className="text-xs uppercase tracking-widest text-black/40 mt-2">
          Order #{order.id.slice(-8)}
        </p>
      </div>

      <div className="card p-6 mt-10 space-y-3">
        {items.map((i, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span>{i.qty}× {i.name} <span className="text-black/40">({i.size})</span></span>
            <span>{formatPrice(i.price * i.qty)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-black/10 pt-3 text-lg font-bold">
          <span>Total</span><span>{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/shop" className="btn-outline">Continue Shopping</Link>
      </div>
    </div>
  );
}
