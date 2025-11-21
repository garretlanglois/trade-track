import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "your-secret-key-min-32-characters-long"
);

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session");

  // If no session, redirect to signin
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  try {
    // Verify the session token
    const { payload } = await jwtVerify(sessionCookie.value, secret);

    // Check if session has required email field
    if (!payload.email) {
      const response = NextResponse.redirect(new URL("/auth/signin", request.url));
      response.cookies.delete("session");
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid session, clear cookie and redirect to signin
    const response = NextResponse.redirect(new URL("/auth/signin", request.url));
    response.cookies.delete("session");
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/league/:path*", "/admin/:path*"],
};
