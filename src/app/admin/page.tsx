import { prisma } from "@/lib/prisma";
import { formatPrice, parseJSON } from "@/lib/utils";
import { SalesChart } from "@/components/sales-chart";
import { Package, ShoppingCart, AlertTriangle, DollarSign, TrendingUp } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let orders: Awaited<ReturnType<typeof prisma.order.findMany>> = [];
  let recentOrders: Awaited<ReturnType<typeof prisma.order.findMany>> = [];
  let dbError: string | null = null;

  try {
    [products, orders, recentOrders] = await Promise.all([
      prisma.product.findMany(),
      prisma.order.findMany(),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
    ]);
  } catch (error) {
    console.error("Dashboard DB error:", error);
    dbError = error instanceof Error ? error.message : "Unknown error";
  }

  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const lowStock = products.filter((p) => {
    const stock = parseJSON<Record<string, number>>(p.stock, {});
    return Object.values(stock).some((v) => v <= 3);
  });

  // Build daily revenue for last 14 days
  const days: { date: string; revenue: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const rev = recentOrders
      .filter((o) => o.createdAt.toISOString().slice(0, 10) === key)
      .reduce((s, o) => s + o.totalAmount, 0);
    days.push({ date: key.slice(5), revenue: rev / 100 });
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of your store performance
        </p>
      </div>
      {dbError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm font-semibold text-red-700">Database Connection Error</p>
          <p className="text-xs text-red-600 mt-1 font-mono">{dbError}</p>
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Stat icon={<Package size={20} />} label="Products" value={products.length.toString()} color="blue" />
        <Stat icon={<ShoppingCart size={20} />} label="Orders" value={orders.length.toString()} color="green" />
        <Stat icon={<DollarSign size={20} />} label="Revenue" value={formatPrice(totalRevenue)} color="purple" />
        <Stat
          icon={<AlertTriangle size={20} />}
          label="Low Stock"
          value={lowStock.length.toString()}
          color="orange"
          accent={lowStock.length > 0}
        />
      </div>

      <div className="mt-6 sm:mt-8 bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <h2 className="text-base sm:text-xl font-semibold text-gray-900">Sales Overview</h2>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 shrink-0">
            <TrendingUp size={14} />
            Last 14 days
          </div>
        </div>
        <SalesChart data={days} />
      </div>

      {lowStock.length > 0 && (
        <div className="mt-6 sm:mt-8 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h2 className="text-base sm:text-xl font-semibold text-gray-900">Low Stock Alerts</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Products that need restocking</p>
          </div>
          <div className="divide-y divide-gray-100">
            {lowStock.map((p) => {
              const stock = parseJSON<Record<string, number>>(p.stock, {});
              return (
                <div key={p.id} className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 hover:bg-gray-50">
                  <span className="font-medium text-sm sm:text-base text-gray-900">{p.name}</span>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {Object.entries(stock)
                      .filter(([, v]) => v <= 3)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  color,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: "blue" | "green" | "purple" | "orange";
  accent?: boolean;
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  };

  const selectedColor = colors[color || "blue"];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] sm:text-sm font-medium text-gray-500 uppercase tracking-wide truncate">{label}</span>
        <div className={`p-2 sm:p-2.5 rounded-lg shrink-0 ${accent ? "bg-red-50 text-red-600" : selectedColor}`}>
          {icon}
        </div>
      </div>
      <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-2 sm:mt-4 truncate">{value}</p>
    </div>
  );
}
