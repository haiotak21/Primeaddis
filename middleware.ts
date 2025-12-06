// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { toSlug } from "@/lib/slugify"

const nextAuthMiddleware = withAuth({
  pages: {
    signIn: "/auth/signin",
  },
})

// Wrap the NextAuth middleware so we can log incoming cookies for auth requests.
// This helps confirm whether the browser is sending the session cookie.
export default async function middleware(req: any, ev: any) {
  const p = req.nextUrl?.pathname || req.url || "";

  try {
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
  
  // Handle legacy property ID paths and redirect to keyword slug URL.
  // Public route: never force auth here.
  if (p.startsWith("/properties/")) {
    try {
      const parts = p.split('/').filter(Boolean);
      const raw = parts[1];
      if (raw) {
        // If raw is a 24-hex ObjectId or ends with -<24hex>, attempt to resolve
        const idMatch = raw.match(/([a-fA-F0-9]{24})$/);
        if (idMatch) {
          const origin = req.nextUrl.origin;
          const fetchUrl = `${origin}/api/properties/${raw}`;
          const res = await fetch(fetchUrl);
          if (res.ok) {
            const data = await res.json();
            const property = data.property || data;
            if (property) {
              const slug = property.slug || toSlug(`${property.title} ${property.location?.city || ''}`);
              const dest = new URL(`/addis-bet/${slug}`, origin);
              try {
                return NextResponse.redirect(dest, 301);
              } catch (e) {
                return NextResponse.redirect(dest);
              }
            }
          }
        }
      }
    } catch (e) {
      // ignore errors in redirect logic and continue
    }
    // If no redirect happened, allow request to continue without auth guard
    return NextResponse.next();
  }
  
  // Auth guard applies only to dashboard/admin (see matcher)
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
