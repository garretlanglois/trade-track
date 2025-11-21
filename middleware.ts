import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // For now, we'll handle auth protection in the page components themselves
  // NextAuth v5 beta doesn't export middleware the same way
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
