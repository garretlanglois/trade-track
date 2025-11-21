import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// Get all player claims (user sees their own, admin sees all pending)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {
      userId: user.id,
    };

    if (status) {
      where.status = status;
    }

    const claims = await prisma.playerClaim.findMany({
      where,
      include: {
        player: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(claims);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch player claims" },
      { status: 500 }
    );
  }
}

// Create a new player claim
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { playerId } = body;

    if (!playerId) {
      return NextResponse.json(
        { error: "Player ID is required" },
        { status: 400 }
      );
    }

    // Check if player exists
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Check if player is already claimed by someone
    if (player.userId) {
      return NextResponse.json(
        { error: "Player is already claimed" },
        { status: 400 }
      );
    }

    // Check if user already has a pending claim for this player
    const existingClaim = await prisma.playerClaim.findUnique({
      where: {
        userId_playerId: {
          userId: user.id,
          playerId,
        },
      },
    });

    if (existingClaim) {
      if (existingClaim.status === "pending") {
        return NextResponse.json(
          { error: "You already have a pending claim for this player" },
          { status: 400 }
        );
      } else if (existingClaim.status === "approved") {
        return NextResponse.json(
          { error: "This player is already assigned to you" },
          { status: 400 }
        );
      }
    }

    // Create the claim
    const claim = await prisma.playerClaim.create({
      data: {
        userId: user.id,
        playerId,
      },
      include: {
        player: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(claim, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create player claim" },
      { status: 500 }
    );
  }
}

// Delete a player claim
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const claimId = searchParams.get("id");

    if (!claimId) {
      return NextResponse.json(
        { error: "Claim ID is required" },
        { status: 400 }
      );
    }

    // Check if claim exists and belongs to user
    const claim = await prisma.playerClaim.findUnique({
      where: { id: claimId },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    if (claim.userId !== user.id) {
      return NextResponse.json(
        { error: "You can only delete your own claims" },
        { status: 403 }
      );
    }

    if (claim.status !== "pending") {
      return NextResponse.json(
        { error: "You can only delete pending claims" },
        { status: 400 }
      );
    }

    await prisma.playerClaim.delete({
      where: { id: claimId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete player claim" },
      { status: 500 }
    );
  }
}
