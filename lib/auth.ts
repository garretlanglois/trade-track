import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }

      // Check if email is in the allowed list
      const allowedEmail = await prisma.allowedEmail.findUnique({
        where: { email: user.email },
      });

      if (!allowedEmail) {
        return false;
      }

      // Initialize draft picks for new users
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { draftPicks: true },
      });

      if (existingUser && existingUser.draftPicks.length === 0) {
        const currentYear = new Date().getFullYear();
        // Create draft picks for rounds 1, 2, 3
        await Promise.all([
          prisma.draftPick.create({
            data: {
              userId: existingUser.id,
              round: 1,
              year: currentYear,
            },
          }),
          prisma.draftPick.create({
            data: {
              userId: existingUser.id,
              round: 2,
              year: currentYear,
            },
          }),
          prisma.draftPick.create({
            data: {
              userId: existingUser.id,
              round: 3,
              year: currentYear,
            },
          }),
        ]);
      }

      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});
