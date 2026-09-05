import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Enforces RBAC on every /admin route at the edge — never rely on
// hiding nav links. Every admin API route ALSO re-checks the role
// server-side (see app/api/admin/*), since middleware alone is not
// sufficient defence-in-depth.
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/my-purchases/:path*"],
};
