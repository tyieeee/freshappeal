import { CartDrawer } from "@/components/cart-drawer";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex-1">{children}</main>
      <CartDrawer />
    </>
  );
}
