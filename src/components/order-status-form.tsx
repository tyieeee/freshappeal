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
    <div className="space-y-2">
      <select
        className="input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button
        disabled={pending || value === status}
        onClick={() =>
          startTransition(async () => {
            await updateOrderStatus(id, value);
            router.refresh();
          })
        }
        className="btn-neon w-full text-sm disabled:opacity-40"
      >
        {pending ? "Updating..." : "Update Status"}
      </button>
    </div>
  );
}
