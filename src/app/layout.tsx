import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";

export const metadata: Metadata = {
  title: "Fresh Appeal Store — Wear the Culture",
  description:
    "Premium streetwear: hoodies, tees, and caps. Built raw, fast, and fresh.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Fresh Appeal Store",
    description: "Wear the Culture.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-white">
      <body className="min-h-screen flex flex-col bg-white text-black">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
