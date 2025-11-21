import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = 'force-dynamic';

// Assign player to user
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const { playerId, userId } = await request.json();

    if (!playerId) {
      return NextResponse.json(
        { error: "Player ID required" },
        { status: 400 }
      );
    }

    // Check if player exists
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    // Update player to assign/unassign user
    const updatedPlayer = await prisma.player.update({
      where: { id: playerId },
      data: { userId: userId || null },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPlayer);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to assign player" },
      { status: error.message === "Unauthorized: Admin access required" ? 401 : 500 }
    );
  }
}

// Remove player from user (unassign)
export async function DELETE(request: Request) {
  try {
    await requireAdmin();

    const { playerId } = await request.json();

    if (!playerId) {
      return NextResponse.json(
        { error: "Player ID required" },
        { status: 400 }
      );
    }

    // Check if player is part of a pending or accepted trade
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        trades: {
          include: {
            trade: true,
          },
        },
      },
    });

    if (player?.trades.some(item => ["pending", "accepted"].includes(item.trade.status))) {
      return NextResponse.json(
        { error: "Cannot remove player that's part of an active trade" },
        { status: 400 }
      );
    }

    // Unassign the player
    const updatedPlayer = await prisma.player.update({
      where: { id: playerId },
      data: { userId: null },
    });

    return NextResponse.json(updatedPlayer);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to remove player" },
      { status: error.message === "Unauthorized: Admin access required" ? 401 : 500 }
    );
  }
}
