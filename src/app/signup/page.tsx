"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Show success message
      setLoading(false);
      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login?signup=success");
      }, 2000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
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
              <h1 className="heading text-4xl">GET FRESH</h1>
              <p className="text-black/60 text-sm mt-2">
                Create your account to start shopping the culture.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="label">Full name</label>
                <input
                  name="name"
                  className="input"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="input"
                  placeholder="you@email.com"
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
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
                  Account created successfully! Redirecting to login...
                </div>
              )}

              <button
                disabled={loading}
                className="btn-neon w-full disabled:opacity-40"
              >
                {loading ? (
                  "Creating account..."
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="text-xs text-black/40 text-center pt-2">
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>

            <div className="mt-8 pt-6 border-t border-black/10 text-center">
              <p className="text-sm text-black/60 mb-2">
                Already have an account?
              </p>
              <Link 
                href="/login" 
                className="text-xs uppercase tracking-widest text-black hover:text-black/70 font-bold"
              >
                Sign In →
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
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80"
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
