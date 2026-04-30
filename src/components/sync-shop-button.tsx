"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { seedShopProducts } from "@/app/admin/actions";

export function SyncShopButton() {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  function handleClick() {
    setMsg(null);
    startTransition(async () => {
      try {
        const res = await seedShopProducts();
        setMsg(
          res.created > 0
            ? `Imported ${res.created} new product${res.created === 1 ? "" : "s"}`
            : "Already up to date",
        );
        router.refresh();
      } catch (err) {
        setMsg(err instanceof Error ? err.message : "Sync failed");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {msg && <span className="text-xs text-gray-500">{msg}</span>}
      <button
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
      >
        <RefreshCw size={14} className={pending ? "animate-spin" : ""} />
        <span className="hidden sm:inline">{pending ? "Syncing..." : "Sync Shop"}</span>
        <span className="sm:hidden">Sync</span>
      </button>
    </div>
  );
}
