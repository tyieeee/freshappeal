"use client";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") ?? "/";
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
    console.log("Sign in response:", res);
    if (res?.error) {
      setError("Invalid email or password.");
      console.error("Sign in error:", res.error);
      return;
    }
    if (!res?.ok) {
      setError("Login failed. Please try again.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid lg:grid-cols-2 gap-4 min-h-[calc(100vh-9rem)]">
        {/* LEFT — FORM */}
        <div className="card p-8 sm:p-12 flex items-center">
          <div className="w-full max-w-sm mx-auto">
            <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
              <Image src="/logo.png" alt="Fresh Appeal" width={36} height={36} />
              <span className="heading text-lg tracking-widest">FRESH APPEAL</span>
            </Link>

            <div className="mb-8">
              <h1 className="heading text-4xl">WELCOME BACK</h1>
              <p className="text-black/60 text-sm mt-2">
                Sign in to track orders and shop the drops.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="input"
                  placeholder="you@email.com"
                  defaultValue="admin@fresh.local"
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="input"
                  placeholder="••••••••"
                  defaultValue="admin123"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                disabled={loading}
                className="btn-neon w-full disabled:opacity-40"
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="text-xs text-black/40 text-center pt-2">
                Demo: <span className="font-bold">admin@fresh.local</span> /{" "}
                <span className="font-bold">admin123</span>
              </p>
            </form>

            <div className="mt-8 pt-6 border-t border-black/10 text-center">
              <p className="text-sm text-black/60 mb-2">
                Don't have an account?
              </p>
              <Link 
                href="/signup" 
                className="text-xs uppercase tracking-widest text-black hover:text-black/70 font-bold"
              >
                Sign Up →
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link href="/" className="text-xs uppercase tracking-widest text-black/40 hover:text-black">
                ← Back to store
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT — IMAGE */}
        <div className="card relative hidden lg:block overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1600&q=80"
            alt="Streetwear fashion"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-black/10 to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
