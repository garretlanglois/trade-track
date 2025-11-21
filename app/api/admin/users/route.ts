import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = 'force-dynamic';

// Get all users with their picks
export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      include: {
        draftPicks: {
          orderBy: { round: "asc" },
        },
        sentTrades: {
          where: { status: "accepted" },
        },
        receivedTrades: {
          where: { status: "accepted" },
        },
      },
      orderBy: { email: "asc" },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

// Delete user
export async function DELETE(request: Request) {
  try {
    await requireAdmin();

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Don't allow deleting admin
    if (user?.email === "gaslanglois@gmail.com") {
      return NextResponse.json(
        { error: "Cannot delete admin user" },
        { status: 400 }
      );
    }

    // Delete user (cascades will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: error.message === "Unauthorized: Admin access required" ? 401 : 500 }
    );
  }
}
