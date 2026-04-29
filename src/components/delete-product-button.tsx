"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/app/admin/actions";
import { Trash2 } from "lucide-react";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await deleteProduct(id);
    setLoading(false);
    router.refresh();
  }

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="text-red-500 hover:text-red-600 transition-colors">
        <Trash2 size={16} />
      </button>
    );
  }

  return (
    <span className="inline-flex gap-2 items-center">
      <span className="text-xs text-gray-600">Delete &quot;{name}&quot;?</span>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-red-600 hover:text-red-700 text-xs uppercase font-medium"
      >
        {loading ? "..." : "Yes"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="text-gray-600 hover:text-gray-900 text-xs uppercase font-medium"
      >
        No
      </button>
    </span>
  );
}
