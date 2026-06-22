import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const adminToken = request.cookies.get("adminToken")?.value;
  const { pathname } = request.nextUrl;

  // User-protected routes
  const protectedRoutes = [
    "/dashboard",
    "/appointments",
    "/pharmacy",
    "/ai",
    "/aichat",
    "/records",
    "/profile",
  ];

  // Admin-protected routes (prefix match covers /admin/dashboard and any future sub-routes)
  const adminProtectedRoutes = ["/admin/dashboard"];

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdminProtected = adminProtectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminProtected && !adminToken) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
