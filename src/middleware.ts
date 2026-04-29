import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = (req.nextauth.token as { role?: string } | null)?.role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: "/admin/login" },
  },
);

export const config = {
  matcher: ["/admin/:path((?!login).*)", "/admin"],
};
