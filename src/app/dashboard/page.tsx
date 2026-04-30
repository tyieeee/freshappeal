import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { MyOrders } from "@/components/my-orders";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const displayName = session.user?.name || "Customer";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* HEADER */}
      <div className="mb-8 sm:mb-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-black/50 mb-2">My Account</p>
        <h1 className="heading text-3xl sm:text-5xl">Hello, {displayName.split(" ")[0]}</h1>
      </div>

      {/* ORDERS */}
      <MyOrders />
    </div>
  );
}
