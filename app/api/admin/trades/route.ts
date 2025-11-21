import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = 'force-dynamic';

// Get all trades
export async function GET() {
  try {
    await requireAdmin();

    const trades = await prisma.trade.findMany({
      include: {
        fromUser: {
          select: { id: true, name: true, email: true },
        },
        toUser: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            draftPick: true,
            player: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(trades);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

// Cancel/Delete a trade
export async function DELETE(request: Request) {
  try {
    await requireAdmin();

    const { tradeId } = await request.json();

    if (!tradeId) {
      return NextResponse.json(
        { error: "Trade ID required" },
        { status: 400 }
      );
    }

    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { items: true },
    });

    if (!trade) {
      return NextResponse.json(
        { error: "Trade not found" },
        { status: 404 }
      );
    }

    // If trade was accepted, we need to reverse the pick/player ownership
    if (trade.status === "accepted") {
      await prisma.$transaction(async (tx) => {
        // Get all picks involved
        const fromPicks = trade.items
          .filter((item) => item.direction === "from" && item.draftPickId)
          .map((item) => item.draftPickId!)
          .filter((id): id is string => id !== null);

        const toPicks = trade.items
          .filter((item) => item.direction === "to" && item.draftPickId)
          .map((item) => item.draftPickId!)
          .filter((id): id is string => id !== null);

        // Get all players involved
        const fromPlayers = trade.items
          .filter((item) => item.direction === "from" && item.playerId)
          .map((item) => item.playerId!)
          .filter((id): id is string => id !== null);

        const toPlayers = trade.items
          .filter((item) => item.direction === "to" && item.playerId)
          .map((item) => item.playerId!)
          .filter((id): id is string => id !== null);

        // Reverse ownership back to original owners
        if (fromPicks.length > 0) {
          await tx.draftPick.updateMany({
            where: { id: { in: fromPicks } },
            data: { userId: trade.fromUserId, isTraded: false },
          });
        }

        if (toPicks.length > 0) {
          await tx.draftPick.updateMany({
            where: { id: { in: toPicks } },
            data: { userId: trade.toUserId, isTraded: false },
          });
        }

        if (fromPlayers.length > 0) {
          await tx.player.updateMany({
            where: { id: { in: fromPlayers } },
            data: { userId: trade.fromUserId, isTraded: false },
          });
        }

        if (toPlayers.length > 0) {
          await tx.player.updateMany({
            where: { id: { in: toPlayers } },
            data: { userId: trade.toUserId, isTraded: false },
          });
        }

        // Delete the trade
        await tx.trade.delete({
          where: { id: tradeId },
        });
      });
    } else {
      // Just delete if not accepted
      await prisma.trade.delete({
        where: { id: tradeId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to cancel trade" },
      { status: error.message === "Unauthorized: Admin access required" ? 401 : 500 }
    );
  }
}
