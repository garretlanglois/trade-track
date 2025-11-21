import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = 'force-dynamic';

// Get all player claims (admin only)
export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};

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
        createdAt: "asc",
      },
    });

    return NextResponse.json(claims);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch player claims" },
      { status: error.message === "Unauthorized: Admin access required" ? 401 : 500 }
    );
  }
}

// Approve or reject a player claim
export async function PATCH(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { claimId, action } = body; // action: "approve" or "reject"

    if (!claimId || !action) {
      return NextResponse.json(
        { error: "Claim ID and action are required" },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Check if claim exists
    const claim = await prisma.playerClaim.findUnique({
      where: { id: claimId },
      include: {
        player: true,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    if (claim.status !== "pending") {
      return NextResponse.json(
        { error: "Claim has already been processed" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      // Check if player is already assigned to someone
      if (claim.player.userId) {
        return NextResponse.json(
          { error: "Player is already assigned to another user" },
          { status: 400 }
        );
      }

      // Use transaction to update both claim and player
      const result = await prisma.$transaction([
        prisma.playerClaim.update({
          where: { id: claimId },
          data: { status: "approved" },
        }),
        prisma.player.update({
          where: { id: claim.playerId },
          data: { userId: claim.userId },
        }),
      ]);

      return NextResponse.json(result[0]);
    } else {
      // Reject the claim
      const updatedClaim = await prisma.playerClaim.update({
        where: { id: claimId },
        data: { status: "rejected" },
      });

      return NextResponse.json(updatedClaim);
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process player claim" },
      { status: error.message === "Unauthorized: Admin access required" ? 401 : 500 }
    );
  }
}

// Approve all pending claims
export async function POST(request: Request) {
  try {
    await requireAdmin();

    // Get all pending claims
    const pendingClaims = await prisma.playerClaim.findMany({
      where: { status: "pending" },
      include: {
        player: true,
      },
    });

    if (pendingClaims.length === 0) {
      return NextResponse.json(
        { message: "No pending claims to approve", approved: 0 },
        { status: 200 }
      );
    }

    // Filter out claims where player is already assigned
    const validClaims = pendingClaims.filter(claim => !claim.player.userId);

    if (validClaims.length === 0) {
      return NextResponse.json(
        { message: "No valid claims to approve (all players already assigned)", approved: 0 },
        { status: 200 }
      );
    }

    // Approve all valid claims in a transaction
    const updates = validClaims.flatMap(claim => [
      prisma.playerClaim.update({
        where: { id: claim.id },
        data: { status: "approved" },
      }),
      prisma.player.update({
        where: { id: claim.playerId },
        data: { userId: claim.userId },
      }),
    ]);

    await prisma.$transaction(updates);

    return NextResponse.json({
      message: `Approved ${validClaims.length} player claim(s)`,
      approved: validClaims.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to approve all claims" },
      { status: error.message === "Unauthorized: Admin access required" ? 401 : 500 }
    );
  }
}
