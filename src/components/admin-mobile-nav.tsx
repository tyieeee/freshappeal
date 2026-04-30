"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LayoutDashboard, Package, ShoppingCart } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { AdminNotifications } from "@/components/admin-notifications";

type Props = {
  user: { name?: string | null; email?: string | null };
};

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

export function AdminMobileNav({ user }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Top bar — mobile only */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Fresh Appeal" width={26} height={26} />
            <span className="font-bold text-gray-900 text-sm">Fresh Appeal</span>
          </Link>
          <div className="flex items-center gap-1">
            <AdminNotifications variant="header" />
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`lg:hidden fixed inset-0 bg-black/40 z-50 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white z-50 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Fresh Appeal" width={32} height={32} />
            <div>
              <h1 className="font-bold text-gray-900 text-base">Fresh Appeal</h1>
              <p className="text-[10px] text-gray-500">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map((l) => {
            const Icon = l.icon;
            const active =
              l.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={18} />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-gray-600">
                {user.name?.charAt(0) || user.email?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || user.email}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}
