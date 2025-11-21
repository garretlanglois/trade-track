import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// Get all players (optionally filter by userId or unassigned)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const unassigned = searchParams.get("unassigned");
    const search = searchParams.get("search");
    const position = searchParams.get("position");

    const where: any = {};

    if (userId) {
      where.userId = userId;
    } else if (unassigned === "true") {
      where.userId = null;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { team: { contains: search, mode: "insensitive" } },
      ];
    }

    if (position) {
      where.position = position;
    }

    const players = await prisma.player.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(players);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch players" },
      { status: 500 }
    );
  }
}
