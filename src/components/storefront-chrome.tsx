"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { WelcomeToast } from "@/components/welcome-toast";

export function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isCheckout = pathname?.startsWith("/checkout");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <WelcomeToast />
      <main className="flex-1">{children}</main>
      {!isCheckout && <Footer />}
      <CartDrawer />
    </>
  );
}
