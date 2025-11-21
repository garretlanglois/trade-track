import { deleteSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  // Delete the invalid session cookie
  await deleteSession();

  // Redirect to signin page
  return NextResponse.redirect(new URL("/auth/signin", process.env.NEXTAUTH_URL || "http://localhost:3000"));
}
