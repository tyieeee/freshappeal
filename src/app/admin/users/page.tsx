import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Shield, User as UserIcon } from "lucide-react";
import { UserRowActions } from "@/components/user-row-actions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string };
}) {
  const session = await getServerSession(authOptions);
  const me = session?.user as { email?: string; role?: string } | undefined;
  if (me?.role !== "admin") {
    redirect("/");
  }

  const q = (searchParams.q ?? "").trim();
  const roleFilter = searchParams.role;

  const where = {
    ...(q
      ? {
          OR: [
            { email: { contains: q } },
            { name: { contains: q } },
          ],
        }
      : {}),
    ...(roleFilter === "admin" || roleFilter === "customer"
      ? { role: roleFilter }
      : {}),
  };

  const [users, totals] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    }),
    prisma.user.findMany({ select: { role: true } }),
  ]);

  const counts = {
    all: totals.length,
    admin: totals.filter((u) => u.role === "admin").length,
    customer: totals.filter((u) => u.role === "customer").length,
  };

  return (
    <div>
      <div className="mb-5 sm:mb-7">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage users and assign roles
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 relative overflow-hidden">
          <span className="absolute left-0 top-0 bottom-0 w-1 bg-gray-900" />
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest font-medium">
            Total Users
          </p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1.5">
            {counts.all}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 relative overflow-hidden">
          <span className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest font-medium">
            Admins
          </p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1.5">
            {counts.admin}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 relative overflow-hidden">
          <span className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest font-medium">
            Customers
          </p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1.5">
            {counts.customer}
          </p>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form className="flex-1">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by email or name..."
            className="w-full sm:max-w-md bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
          />
          {roleFilter && <input type="hidden" name="role" value={roleFilter} />}
        </form>
        <div className="flex gap-2">
          {[
            { label: "All", value: "" },
            { label: "Admins", value: "admin" },
            { label: "Customers", value: "customer" },
          ].map((opt) => {
            const active = (roleFilter ?? "") === opt.value;
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (opt.value) params.set("role", opt.value);
            const href = `/admin/users${params.toString() ? `?${params}` : ""}`;
            return (
              <a
                key={opt.label}
                href={href}
                className={`shrink-0 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium border transition-colors ${
                  active
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                }`}
              >
                {opt.label}
              </a>
            );
          })}
        </div>
      </div>

      {/* MOBILE: cards */}
      <div className="sm:hidden space-y-2.5">
        {users.map((u) => {
          const isSelf = u.email === me?.email;
          return (
            <div
              key={u.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      u.role === "admin"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {u.role === "admin" ? (
                      <Shield size={16} />
                    ) : (
                      <UserIcon size={16} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {u.name || "—"}
                      </p>
                      {isSelf && (
                        <span className="text-[10px] uppercase tracking-wider bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded">
                          You
                        </span>
                      )}
                      <RoleBadge role={u.role} />
                    </div>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Joined{" "}
                      {u.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <UserRowActions
                  userId={u.id}
                  email={u.email}
                  name={u.name}
                  role={u.role}
                  isSelf={isSelf}
                />
              </div>
            </div>
          );
        })}
        {users.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-sm text-gray-400">
            No users found.
          </div>
        )}
      </div>

      {/* DESKTOP: table */}
      <div className="hidden sm:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600 border-b border-gray-200">
              <tr>
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Joined</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => {
                const isSelf = u.email === me?.email;
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            u.role === "admin"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {u.role === "admin" ? (
                            <Shield size={16} />
                          ) : (
                            <UserIcon size={16} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-gray-900 truncate">
                              {u.name || "—"}
                            </p>
                            {isSelf && (
                              <span className="text-[10px] uppercase tracking-wider bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {u.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4">
                      <UserRowActions
                        userId={u.id}
                        email={u.email}
                        name={u.name}
                        role={u.role}
                        isSelf={isSelf}
                      />
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-gray-400 text-sm"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "admin";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
        isAdmin
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {isAdmin && <Shield size={10} />} {role}
    </span>
  );
}
