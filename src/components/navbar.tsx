"use client";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X, User, Search, X as CloseX, LogOut } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";

const links = [
  { href: "/shop", label: "Latest Drops" },
  { href: "/shop?cat=hoodies", label: "Hoodies" },
  { href: "/shop?cat=tees", label: "Tees" },
  { href: "/shop?cat=caps", label: "Caps" },
];

const STATIC_DATE = new Date("2024-01-01");

const mockProducts = [
  {
    id: "h1",
    name: "Beard Mafia Hoodie",
    slug: "beard-mafia-hoodie",
    description: "Premium heavyweight hoodie",
    price: 8500,
    category: "hoodies",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: { S: 8, M: 12, L: 10, XL: 8, XXL: 5 } as Record<string, number>,
    images: ["/jacket.jpeg"],
    isFeatured: true,
    createdAt: STATIC_DATE,
  },
  {
    id: "t1",
    name: "Fresh Logo Tee",
    slug: "fresh-logo-tee",
    description: "Premium cotton t-shirt",
    price: 3500,
    category: "tees",
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: { XS: 15, S: 20, M: 25, L: 20, XL: 15 } as Record<string, number>,
    images: ["/tshirt.png"],
    isFeatured: true,
    createdAt: STATIC_DATE,
  },
  {
    id: "c1",
    name: "Fresh Snapback",
    slug: "fresh-snapback",
    description: "Six-panel structured cap",
    price: 2600,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 20 } as Record<string, number>,
    images: ["/cap1.jpeg"],
    isFeatured: true,
    createdAt: STATIC_DATE,
  },
  {
    id: "c2",
    name: "Culture Cap",
    slug: "culture-cap",
    description: "Low-profile dad cap",
    price: 2800,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 18 } as Record<string, number>,
    images: ["/cap2.jpeg"],
    isFeatured: true,
    createdAt: STATIC_DATE,
  },
  {
    id: "c3",
    name: "Classic Cap",
    slug: "classic-cap",
    description: "Low-profile dad cap with curved brim",
    price: 2600,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 35 } as Record<string, number>,
    images: ["/collection1.jpeg"],
    isFeatured: false,
    createdAt: STATIC_DATE,
  },
  {
    id: "c4",
    name: "Heritage Cap",
    slug: "heritage-cap",
    description: "Heritage embroidered six-panel cap",
    price: 3200,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 25 } as Record<string, number>,
    images: ["/collection2.jpeg"],
    isFeatured: true,
    createdAt: STATIC_DATE,
  },
  {
    id: "c5",
    name: "Street Cap",
    slug: "street-cap",
    description: "Adjustable street cap",
    price: 2400,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 30 } as Record<string, number>,
    images: ["/collection3.jpeg"],
    isFeatured: false,
    createdAt: STATIC_DATE,
  },
  {
    id: "c6",
    name: "Premium Cap",
    slug: "premium-cap",
    description: "Premium structured snapback",
    price: 2900,
    category: "caps",
    sizes: ["OS"],
    stock: { OS: 22 } as Record<string, number>,
    images: ["/collection4.jpeg"],
    isFeatured: false,
    createdAt: STATIC_DATE,
  },
];

export function Navbar() {
  const open = useCart((s) => s.open);
  const count = useCart((s) => s.count());
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);

  const filteredProducts = mockProducts.filter((product) =>
    product.name.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 min-w-0 shrink">
          <Image src="/logo.png" alt="Fresh Appeal" width={32} height={32} priority className="shrink-0" />
          <span className="heading text-base sm:text-xl tracking-widest whitespace-nowrap">FRESH APPEAL</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-8 text-sm">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-black/70 hover:text-black transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-black/70 hover:text-black"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            {searchOpen && (
              <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-full sm:mt-2 sm:w-80 bg-white border border-black/10 rounded-lg shadow-lg p-4 z-50">
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:border-black"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                    >
                      <CloseX size={14} />
                    </button>
                  )}
                </div>
                {searchQuery && filteredProducts.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-black/5 rounded-lg transition-colors"
                      >
                        <div className="relative w-12 h-12 bg-[#f4f4f4] rounded-lg overflow-hidden shrink-0">
                          {product.images[0] && (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{product.name}</p>
                          <p className="text-xs text-black/50">${(product.price / 100).toFixed(2)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <p className="text-sm text-black/50 text-center py-4">No products found</p>
                ) : (
                  <p className="text-sm text-black/50 text-center py-4">Start typing to search</p>
                )}
              </div>
            )}
          </div>
          <button
            onClick={open}
            className="relative p-2 text-black/70 hover:text-black"
            aria-label="Open cart"
          >
            <ShoppingBag size={20} />
            {mounted && count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
          {mounted && session ? (
            <div className="relative hidden lg:block" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="text-xs uppercase tracking-widest text-black/70 hover:text-black font-bold px-4 py-2 rounded-full border border-black/15 hover:border-black hover:bg-black hover:text-white transition-all flex items-center gap-2"
              >
                <User size={14} />
                {session.user?.name || session.user?.email?.split('@')[0]}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-black/10 rounded-lg shadow-lg py-2 z-50">
                  <Link
                    href="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-black/70 hover:bg-black/5 hover:text-black"
                  >
                    Dashboard
                  </Link>
                  {(session.user as { role?: string })?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-black/70 hover:bg-black/5 hover:text-black"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-black/70 hover:bg-black/5 hover:text-black"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="hidden lg:inline-flex text-xs uppercase tracking-widest text-black/70 hover:text-black font-bold px-4 py-2 rounded-full border border-black/15 hover:border-black hover:bg-black hover:text-white transition-all">
              Login
            </Link>
          )}
          <button
            className="lg:hidden p-2 text-black/70 relative w-10 h-10 flex items-center justify-center"
            onClick={() => setMobile((v) => !v)}
            aria-label="Menu"
          >
            <span className="relative w-5 h-4 inline-block">
              <span
                className={`absolute left-0 top-0 w-5 h-0.5 bg-black transition-all duration-300 ease-out ${
                  mobile ? "rotate-45 translate-y-[7px]" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-5 h-0.5 bg-black transition-all duration-300 ease-out ${
                  mobile ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 bottom-0 w-5 h-0.5 bg-black transition-all duration-300 ease-out ${
                  mobile ? "-rotate-45 -translate-y-[7px]" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>
      {/* Mobile Menu Dropdown — slides down from navbar */}
      <div
        className={`lg:hidden absolute left-0 right-0 top-full bg-white border-b border-black/5 shadow-lg overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          mobile ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="px-6 py-4 flex flex-col">
          {links.map((l, idx) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setMobile(false)}
              className={`heading text-2xl py-3 border-b border-black/5 transition-all duration-500 hover:text-black/60 ${
                mobile
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: mobile ? `${150 + idx * 60}ms` : "0ms" }}
            >
              {l.label.toUpperCase()}
            </Link>
          ))}
          {mounted && session ? (
            <div
              className={`mt-4 space-y-1 transition-all duration-500 ${
                mobile ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: mobile ? `${150 + links.length * 60}ms` : "0ms" }}
            >
              <Link
                href="/dashboard"
                onClick={() => setMobile(false)}
                className="block text-sm uppercase tracking-widest text-black/70 hover:text-black py-2"
              >
                Dashboard
              </Link>
              {(session.user as { role?: string })?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMobile(false)}
                  className="block text-sm uppercase tracking-widest text-black/70 hover:text-black py-2"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                  setMobile(false);
                }}
                className="flex items-center gap-2 text-sm uppercase tracking-widest text-black/70 hover:text-black py-2"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobile(false)}
              className={`btn-neon text-xs mt-4 inline-flex self-start transition-all duration-500 ${
                mobile ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: mobile ? `${150 + links.length * 60}ms` : "0ms" }}
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
