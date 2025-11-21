import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = 'force-dynamic';

// Add draft pick to user
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const { userId, round, year } = await request.json();

    if (!userId || !round || !year) {
      return NextResponse.json(
        { error: "User ID, round, and year required" },
        { status: 400 }
      );
    }

    const pick = await prisma.draftPick.create({
      data: {
        userId,
        round: parseInt(round),
        year: parseInt(year),
      },
    });

    return NextResponse.json(pick);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add pick" },
      { status: error.message === "Unauthorized: Admin access required" ? 401 : 500 }
    );
  }
}

// Delete draft pick
export async function DELETE(request: Request) {
  try {
    await requireAdmin();

    const { pickId } = await request.json();

    if (!pickId) {
      return NextResponse.json(
        { error: "Pick ID required" },
        { status: 400 }
      );
    }

    // Check if pick is part of an accepted trade
    const pick = await prisma.draftPick.findUnique({
      where: { id: pickId },
      include: {
        trades: {
          include: {
            trade: true,
          },
        },
      },
    });

    if (pick?.trades.some(item => item.trade.status === "accepted")) {
      return NextResponse.json(
        { error: "Cannot delete pick that's part of an accepted trade" },
        { status: 400 }
      );
    }

    await prisma.draftPick.delete({
      where: { id: pickId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete pick" },
      { status: error.message === "Unauthorized: Admin access required" ? 401 : 500 }
    );
  }
}
