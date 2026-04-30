"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProfile } from "@/lib/profile-store";
import { useCart } from "@/lib/cart-store";
import { User, MapPin, Mail, Edit2, Check, ShoppingBag, Package } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { fullName, address, setProfile, setAddress } = useProfile();
  const cartCount = useCart((s) => s.items.length);

  const [mounted, setMounted] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [addr, setAddr] = useState({
    line1: "",
    city: "",
    state: "",
    postal: "",
    country: "US",
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (mounted) {
      setNameInput(fullName || session?.user?.name || "");
      if (address) setAddr(address);
    }
  }, [mounted, fullName, address, session]);

  if (!mounted || status === "loading") {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-black/50">Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  const email = session.user?.email ?? "";
  const displayName = fullName || session.user?.name || "Customer";

  function saveName() {
    setProfile({ fullName: nameInput.trim() });
    setEditingName(false);
  }

  function saveAddress() {
    if (!addr.line1 || !addr.city || !addr.country) return;
    setAddress(addr);
    setEditingAddress(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* HEADER */}
      <div className="mb-8 sm:mb-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-black/50 mb-2">My Account</p>
        <h1 className="heading text-3xl sm:text-5xl">Hello, {displayName.split(" ")[0]}</h1>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
            <p className="text-xs uppercase tracking-widest text-black/50">In cart</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{cartCount}</p>
          <Link href="/cart" className="text-xs text-black/60 hover:text-black underline mt-2 inline-block">
            View cart →
          </Link>
        </div>
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
              <Package size={16} />
            </div>
            <p className="text-xs uppercase tracking-widest text-black/50">Address</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{address ? "Saved" : "—"}</p>
          <p className="text-xs text-black/60 mt-2">
            {address ? "Ready for checkout" : "Add for fast checkout"}
          </p>
        </div>
      </div>

      {/* PROFILE INFO */}
      <section className="card p-5 sm:p-7 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading text-xl sm:text-2xl">Profile</h2>
        </div>

        {/* Name */}
        <div className="border-t border-black/10 pt-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <User size={18} className="text-black/40 mt-1 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-black/50 mb-1">Full Name</p>
                {editingName ? (
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveName()}
                    className="input text-sm"
                  />
                ) : (
                  <p className="font-bold text-sm sm:text-base">{displayName}</p>
                )}
              </div>
            </div>
            <button
              onClick={editingName ? saveName : () => setEditingName(true)}
              className="text-black/50 hover:text-black p-1 shrink-0"
              aria-label={editingName ? "Save name" : "Edit name"}
            >
              {editingName ? <Check size={18} /> : <Edit2 size={16} />}
            </button>
          </div>
        </div>

        {/* Email */}
        <div className="border-t border-black/10 pt-4 mt-4">
          <div className="flex items-start gap-3">
            <Mail size={18} className="text-black/40 mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-black/50 mb-1">Email</p>
              <p className="font-bold text-sm sm:text-base truncate">{email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ADDRESS */}
      <section className="card p-5 sm:p-7 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading text-xl sm:text-2xl">Shipping Address</h2>
          {address && !editingAddress && (
            <button
              onClick={() => setEditingAddress(true)}
              className="text-xs uppercase tracking-widest text-black/60 hover:text-black flex items-center gap-1"
            >
              <Edit2 size={14} /> Edit
            </button>
          )}
        </div>

        {!address && !editingAddress ? (
          <div className="border-t border-black/10 pt-4 text-center">
            <MapPin size={28} className="mx-auto text-black/30 mb-3" />
            <p className="text-sm text-black/60 mb-4">No saved address yet.</p>
            <button
              onClick={() => setEditingAddress(true)}
              className="btn-neon"
            >
              <MapPin size={16} /> Add Address
            </button>
          </div>
        ) : editingAddress ? (
          <div className="space-y-3 border-t border-black/10 pt-4">
            <div>
              <label className="label">Street address</label>
              <input
                value={addr.line1}
                onChange={(e) => setAddr({ ...addr, line1: e.target.value })}
                className="input"
                placeholder="123 Main St"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">City</label>
                <input
                  value={addr.city}
                  onChange={(e) => setAddr({ ...addr, city: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">State</label>
                <input
                  value={addr.state}
                  onChange={(e) => setAddr({ ...addr, state: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Postal</label>
                <input
                  value={addr.postal}
                  onChange={(e) => setAddr({ ...addr, postal: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Country</label>
                <input
                  value={addr.country}
                  onChange={(e) => setAddr({ ...addr, country: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={saveAddress}
                disabled={!addr.line1 || !addr.city}
                className="btn-neon flex-1 disabled:opacity-40"
              >
                <Check size={16} /> Save Address
              </button>
              {address && (
                <button
                  onClick={() => {
                    setEditingAddress(false);
                    setAddr(address);
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ) : address ? (
          <div className="border-t border-black/10 pt-4">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-black/40 mt-1 shrink-0" />
              <div className="text-sm leading-relaxed">
                <p className="font-bold">{address.line1}</p>
                <p className="text-black/60">
                  {address.city}, {address.state} {address.postal}
                </p>
                <p className="text-black/60">{address.country}</p>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
