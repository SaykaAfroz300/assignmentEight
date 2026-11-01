import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Fast first-line gate for private routes (runs before rendering). It only checks that a
 * session cookie exists - the real validation happens in <PrivateRoute /> and in Express.
 * Because the cookie survives a reload, a logged-in user is never bounced to /login.
 */
export function proxy(request: NextRequest) {
  const hasSession = Boolean(getSessionCookie(request));
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/add-studio/:path*", "/my-listings/:path*", "/my-bookings/:path*", "/studios/edit/:path*"],
};
