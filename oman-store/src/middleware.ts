import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Protects every /admin route server-side. A customer session, or no
// session, is redirected — role is checked from the signed JWT, never
// trusted from the client.
export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const role = (req.auth?.user as any)?.role;

  if (isAdminRoute && role !== "ADMIN") {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
