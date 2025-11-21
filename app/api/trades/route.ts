import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Create a new trade
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { toUserId, myPickIds, theirPickIds } = await request.json();

    if (!toUserId || !myPickIds || myPickIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid trade data" },
        { status: 400 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the picks belong to the current user and are not already traded
    const myPicks = await prisma.draftPick.findMany({
      where: {
        id: { in: myPickIds },
        userId: currentUser.id,
        isTraded: false,
      },
    });

    if (myPicks.length !== myPickIds.length) {
      return NextResponse.json(
        { error: "Invalid or already traded picks" },
        { status: 400 }
      );
    }

    // Create the trade
    const trade = await prisma.trade.create({
      data: {
        fromUserId: currentUser.id,
        toUserId: toUserId,
        status: "pending",
        items: {
          create: [
            ...myPickIds.map((pickId: string) => ({
              draftPickId: pickId,
              direction: "from",
            })),
            ...(theirPickIds || []).map((pickId: string) => ({
              draftPickId: pickId,
              direction: "to",
            })),
          ],
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(trade, { status: 201 });
  } catch (error) {
    console.error("Error creating trade:", error);
    return NextResponse.json(
      { error: "Failed to create trade" },
      { status: 500 }
    );
  }
}

// Update trade status (accept/reject)
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tradeId, action } = await request.json();

    if (!tradeId || !["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        items: true,
      },
    });

    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    if (trade.toUserId !== currentUser.id) {
      return NextResponse.json(
        { error: "Not authorized to update this trade" },
        { status: 403 }
      );
    }

    if (trade.status !== "pending") {
      return NextResponse.json(
        { error: "Trade is no longer pending" },
        { status: 400 }
      );
    }

    if (action === "accept") {
      // Update trade status and mark picks as traded
      await prisma.$transaction(async (tx) => {
        await tx.trade.update({
          where: { id: tradeId },
          data: { status: "accepted" },
        });

        // Transfer ownership of picks
        const fromPicks = trade.items
          .filter((item) => item.direction === "from")
          .map((item) => item.draftPickId);

        const toPicks = trade.items
          .filter((item) => item.direction === "to")
          .map((item) => item.draftPickId);

        // Update from picks to toUser
        if (fromPicks.length > 0) {
          await tx.draftPick.updateMany({
            where: { id: { in: fromPicks } },
            data: { userId: trade.toUserId, isTraded: true },
          });
        }

        // Update to picks to fromUser
        if (toPicks.length > 0) {
          await tx.draftPick.updateMany({
            where: { id: { in: toPicks } },
            data: { userId: trade.fromUserId, isTraded: true },
          });
        }
      });
    } else {
      // Reject the trade
      await prisma.trade.update({
        where: { id: tradeId },
        data: { status: "rejected" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating trade:", error);
    return NextResponse.json(
      { error: "Failed to update trade" },
      { status: 500 }
    );
  }
}
