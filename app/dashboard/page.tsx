import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/DashboardClient";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      draftPicks: {
        orderBy: { round: "asc" },
      },
      sentTrades: {
        include: {
          toUser: true,
          items: {
            include: {
              draftPick: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      receivedTrades: {
        include: {
          fromUser: true,
          items: {
            include: {
              draftPick: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const allUsers = await prisma.user.findMany({
    where: {
      id: { not: user.id },
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  return <DashboardClient user={user} allUsers={allUsers} />;
}
