import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LayoutDashboard, Package, ShoppingCart } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { Providers } from "@/app/providers";
import { AdminMobileNav } from "@/components/admin-mobile-nav";
import { AdminNotifications } from "@/components/admin-notifications";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) return <>{children}</>;

  return (
    <Providers>
      <div className="bg-gray-50 -mx-0 -my-0 min-h-screen">
        <div className="min-h-screen lg:flex">
            {/* Mobile nav (top bar + drawer) */}
            <AdminMobileNav
              user={{ name: session.user?.name, email: session.user?.email }}
            />

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex sticky top-0 h-screen w-64 bg-white border-r border-gray-200 flex-col overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Image src="/logo.png" alt="Fresh Appeal" width={32} height={32} />
                  <div>
                    <h1 className="font-bold text-gray-900 text-lg">Fresh Appeal</h1>
                    <p className="text-xs text-gray-500">Admin Panel</p>
                  </div>
                </div>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                <NavLink href="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" />
                <NavLink href="/admin/products" icon={<Package size={18} />} label="Products" />
                <NavLink href="/admin/orders" icon={<ShoppingCart size={18} />} label="Orders" />
                <AdminNotifications variant="sidebar" />
              </nav>
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {session.user?.name?.charAt(0) || session.user?.email?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.user?.name || session.user?.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <SignOutButton />
              </div>
            </aside>
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </Providers>
  );
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
