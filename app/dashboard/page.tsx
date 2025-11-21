import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

export default async function Dashboard() {
  const session = await getSession();

  if (!session?.email) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.email },
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
    // User has a session but doesn't exist in database (e.g., after migration)
    // Redirect to a cleanup route that will delete the session
    redirect("/auth/cleanup");
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
