import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = 'force-dynamic';

// Get all allowed emails
export async function GET() {
  try {
    await requireAdmin();

    const emails = await prisma.allowedEmail.findMany({
      orderBy: { email: "asc" },
    });

    return NextResponse.json(emails);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

// Add allowed email
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    const allowedEmail = await prisma.allowedEmail.create({
      data: { email: email.toLowerCase() },
    });

    return NextResponse.json(allowedEmail);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to add email" },
      { status: error.message === "Unauthorized: Admin access required" ? 401 : 500 }
    );
  }
}

// Delete allowed email
export async function DELETE(request: Request) {
  try {
    await requireAdmin();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    // Don't allow deleting admin email
    if (email === "gaslanglois@gmail.com") {
      return NextResponse.json(
        { error: "Cannot remove admin email" },
        { status: 400 }
      );
    }

    await prisma.allowedEmail.delete({
      where: { email },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete email" },
      { status: error.message === "Unauthorized: Admin access required" ? 401 : 500 }
    );
  }
}
