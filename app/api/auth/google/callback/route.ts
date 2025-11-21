import { NextRequest, NextResponse } from "next/server";
import { getGoogleUser } from "@/lib/google-auth";
import { createSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/auth/error", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  try {
    // Get user info from Google
    const googleUser = await getGoogleUser(code);

    if (!googleUser.email) {
      return NextResponse.redirect(new URL("/auth/error", request.url));
    }

    // Check if email is allowed
    const allowedEmail = await prisma.allowedEmail.findUnique({
      where: { email: googleUser.email },
    });

    if (!allowedEmail) {
      return NextResponse.redirect(
        new URL("/auth/error?type=unauthorized", request.url)
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
      include: { draftPicks: true },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          image: googleUser.picture,
        },
        include: { draftPicks: true },
      });
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: googleUser.name,
          image: googleUser.picture,
        },
        include: { draftPicks: true },
      });
    }

    // Initialize draft picks for new users
    if (user.draftPicks.length === 0) {
      const currentYear = new Date().getFullYear();
      await Promise.all([
        prisma.draftPick.create({
          data: {
            userId: user.id,
            round: 1,
            year: currentYear,
          },
        }),
        prisma.draftPick.create({
          data: {
            userId: user.id,
            round: 2,
            year: currentYear,
          },
        }),
        prisma.draftPick.create({
          data: {
            userId: user.id,
            round: 3,
            year: currentYear,
          },
        }),
      ]);
    }

    // Create session
    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
      image: user.image || undefined,
    });

    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(new URL("/auth/error", request.url));
  }
}
