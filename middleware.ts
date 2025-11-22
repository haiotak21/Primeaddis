// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const nextAuthMiddleware = withAuth({
  pages: {
    signIn: "/auth/signin",
  },
})

// Wrap the NextAuth middleware so we can log incoming cookies for auth requests.
// This helps confirm whether the browser is sending the session cookie.
export default function middleware(req: any, ev: any) {
  try {
    const p = req.nextUrl?.pathname || req.url || "";
    // Log cookies for both auth API requests and protected client routes
    // so we can confirm whether the browser sends the session cookie on
    // subsequent page navigations to `/admin` or `/dashboard`.
    if (p.startsWith("/api/auth/") || p.startsWith("/admin") || p.startsWith("/dashboard")) {
      // eslint-disable-next-line no-console
      console.debug("[middleware] auth request cookies:", req.headers.get("cookie"));
    }
  } catch (e) {
    // ignore logging errors
  }
  return nextAuthMiddleware(req, ev);
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/admin",
    "/admin/:path*",
  ],
}
