"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid credentials");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 border border-white/10 p-8"
      >
        <div className="text-center">
          <Image src="/logo.png" alt="Fresh" width={64} height={64} className="mx-auto" />
          <h1 className="heading text-3xl mt-4">Admin Login</h1>
        </div>
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" required className="input" defaultValue="admin@fresh.local" />
        </div>
        <div>
          <label className="label">Password</label>
          <input name="password" type="password" required className="input" defaultValue="admin123" />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button disabled={loading} className="btn-neon w-full">
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p className="text-xs text-white/40 text-center">
          Default: admin@fresh.local / admin123
        </p>
      </form>
    </div>
  );
}
