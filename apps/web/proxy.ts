import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  // The matcher below only runs this middleware for protected routes that are
  // MISSING the `authToken` cookie. So if we get here, the user is unauthenticated.
  const loginUrl = new URL("/sign-in", request.url)

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    {
      // Protect everything except the login/sign-up pages, Next.js internals, and static assets.
      source: "/((?!sign-in|sign-up|_next/static|_next/image|favicon.ico).*)",
      // Only trigger the redirect when the `authToken` cookie is absent.
      missing: [{ type: "cookie", key: "authToken" }],
    },
  ],
}
