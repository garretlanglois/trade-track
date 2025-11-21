import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();

  // Delete session cookie
  cookieStore.delete("session");

  // Delete any old NextAuth cookies
  cookieStore.delete("next-auth.session-token");
  cookieStore.delete("__Secure-next-auth.session-token");
  cookieStore.delete("next-auth.csrf-token");
  cookieStore.delete("__Secure-next-auth.csrf-token");
  cookieStore.delete("next-auth.callback-url");
  cookieStore.delete("__Secure-next-auth.callback-url");

  return NextResponse.json({
    success: true,
    message: "All cookies cleared. Please go to /auth/signin"
  });
}
