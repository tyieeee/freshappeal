import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#f4f4f4] border-t border-black/5 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Image src="/logo.png" alt="Fresh Appeal" width={36} height={36} />
            <span className="heading text-xl tracking-widest">FRESH APPEAL</span>
          </div>
          <p className="text-black/60 text-sm">
            Wear the culture. Built raw, fast, and fresh.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-black mb-3 font-bold">Shop</h4>
          <ul className="space-y-2 text-sm text-black/70">
            <li><Link href="/shop?cat=men" className="hover:text-black">Hoodies</Link></li>
            <li><Link href="/shop?cat=women" className="hover:text-black">Tees</Link></li>
            <li><Link href="/shop?cat=caps" className="hover:text-black">Caps</Link></li>
            <li><Link href="/shop?cat=new" className="hover:text-black">New Drops</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-black mb-3 font-bold">Help</h4>
          <ul className="space-y-2 text-sm text-black/70">
            <li>support@freshappeal.store</li>
            <li>Mon–Fri 9am–6pm</li>
            <li><Link href="/admin" className="hover:text-black">Admin</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-black mb-3 font-bold">Newsletter</h4>
          <form className="flex gap-2">
            <input className="input !rounded-full" placeholder="your@email.com" type="email" />
            <button className="btn-neon !px-4 !py-3 text-xs">Join</button>
          </form>
          <div className="flex gap-3 mt-4 text-black/60">
            <a href="#" aria-label="Instagram" className="hover:text-black"><Instagram size={20} /></a>
            <a href="#" aria-label="TikTok" className="hover:text-black font-bold">TT</a>
          </div>
        </div>
      </div>
      <div className="border-t border-black/5 py-6 text-center text-xs text-black/40">
        © {new Date().getFullYear()} Fresh Appeal Store. All rights reserved.
      </div>
    </footer>
  );
}
