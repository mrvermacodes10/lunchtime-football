import { NextRequest, NextResponse } from "next/server";

// Cheap, edge-safe cookie presence check. The admin layout (server component,
// Node runtime) does the real session lookup against the database on every
// request — this middleware only exists to bounce obviously logged-out
// visitors before they see any admin HTML.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const hasCookie = req.cookies.has("lff_admin_session");
    if (!hasCookie) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
