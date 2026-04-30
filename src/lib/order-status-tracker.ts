"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

const SEEN_KEY = "fresh-order-status-seen";

type SeenMap = Record<string, string>;

function readSeen(): SeenMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeSeen(map: SeenMap) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(map));
  } catch {}
}

/**
 * Polls /api/my-orders and tracks status changes the customer hasn't acknowledged.
 * Returns the number of orders whose status changed since the last `markSeen()` call.
 */
export function useOrderStatusUpdates(intervalMs = 30_000) {
  const { status: sessionStatus } = useSession();
  const [updatedCount, setUpdatedCount] = useState(0);
  const [orders, setOrders] = useState<Array<{ id: string; status: string }>>([]);

  const fetchAndCompute = useCallback(async () => {
    try {
      const res = await fetch("/api/my-orders", { cache: "no-store" });
      if (!res.ok) return;
      const data: Array<{ id: string; status: string }> = await res.json();
      setOrders(data);
      const seen = readSeen();
      // Count orders whose status changed from a previously-seen value.
      // Brand-new orders (not yet in seen) don't count as a "status change".
      let count = 0;
      for (const o of data) {
        if (seen[o.id] !== undefined && seen[o.id] !== o.status) {
          count++;
        }
      }
      setUpdatedCount(count);
      // Initialize unseen orders in storage so future status changes are detected
      let touched = false;
      const next = { ...seen };
      for (const o of data) {
        if (next[o.id] === undefined) {
          next[o.id] = o.status;
          touched = true;
        }
      }
      if (touched) writeSeen(next);
    } catch {}
  }, []);

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      setUpdatedCount(0);
      return;
    }
    fetchAndCompute();
    const t = setInterval(fetchAndCompute, intervalMs);
    return () => clearInterval(t);
  }, [sessionStatus, fetchAndCompute, intervalMs]);

  const markSeen = useCallback(() => {
    const next: SeenMap = {};
    for (const o of orders) next[o.id] = o.status;
    writeSeen(next);
    setUpdatedCount(0);
  }, [orders]);

  return { updatedCount, markSeen };
}
