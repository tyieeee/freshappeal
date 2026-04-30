import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { StorefrontChrome } from "@/components/storefront-chrome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fresh Appeal Store — Wear the Culture",
  description:
    "Premium streetwear: hoodies, tees, and caps. Built raw, fast, and fresh.",
  ...(process.env.NEXT_PUBLIC_SITE_URL && {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL),
  }),
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
          <StorefrontChrome>{children}</StorefrontChrome>
        </Providers>
      </body>
    </html>
  );
}
