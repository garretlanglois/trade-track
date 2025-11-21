import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import AdminClient from "@/components/AdminClient";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/dashboard");
  }

  // Fetch all data for admin
  const [users, allowedEmails, trades] = await Promise.all([
    prisma.user.findMany({
      include: {
        draftPicks: {
          orderBy: { round: "asc" },
        },
      },
      orderBy: { email: "asc" },
    }),
    prisma.allowedEmail.findMany({
      orderBy: { email: "asc" },
    }),
    prisma.trade.findMany({
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
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <AdminClient
      users={users}
      allowedEmails={allowedEmails}
      trades={trades}
    />
  );
}
