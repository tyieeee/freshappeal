"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Shield, ShieldOff, Trash2, AlertTriangle, X } from "lucide-react";
import { setUserRole, deleteUser } from "@/app/admin/actions";

type Props = {
  userId: string;
  email: string;
  name: string | null;
  role: string;
  isSelf: boolean;
};

export function UserRowActions({ userId, email, name, role, isSelf }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isAdmin = role === "admin";

  function toggleRole() {
    setError(null);
    startTransition(async () => {
      try {
        await setUserRole(userId, isAdmin ? "customer" : "admin");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  function doDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteUser(userId);
        setConfirmDelete(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-1.5 justify-end">
        <button
          onClick={toggleRole}
          disabled={pending || isSelf}
          title={isSelf ? "You can't change your own role" : isAdmin ? "Demote to customer" : "Promote to admin"}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            isAdmin
              ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {isAdmin ? <ShieldOff size={13} /> : <Shield size={13} />}
          <span className="hidden sm:inline">{isAdmin ? "Demote" : "Make admin"}</span>
        </button>
        <button
          onClick={() => setConfirmDelete(true)}
          disabled={pending || isSelf}
          title={isSelf ? "You can't delete yourself" : "Delete user"}
          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Delete user"
        >
          <Trash2 size={15} />
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-600 text-right mt-1">{error}</p>
      )}

      {confirmDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={() => !pending && setConfirmDelete(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
            <button
              onClick={() => !pending && setConfirmDelete(false)}
              disabled={pending}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-50"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle size={22} className="text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Delete user?</h2>
            <p className="text-sm text-gray-600 mb-5">
              Permanently delete{" "}
              <span className="font-semibold text-gray-900">
                {name || email}
              </span>
              ? This cannot be undone.
            </p>
            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={pending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={doDelete}
                disabled={pending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {pending ? "Deleting..." : (
                  <>
                    <Trash2 size={14} /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
