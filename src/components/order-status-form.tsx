"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/app/admin/actions";

const STATUSES = ["pending", "shipped", "delivered", "cancelled"];

export function OrderStatusForm({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2.5">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 capitalize focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s} className="capitalize">
            {s}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={pending || value === status}
        onClick={() =>
          startTransition(async () => {
            await updateOrderStatus(id, value);
            router.refresh();
          })
        }
        className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {pending ? "Updating..." : "Update Status"}
      </button>
    </div>
  );
}
