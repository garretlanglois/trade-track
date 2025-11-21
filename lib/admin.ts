import { getSession } from "./session";

const ADMIN_EMAIL = "gaslanglois@gmail.com";

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.email === ADMIN_EMAIL;
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized: Admin access required");
  }
}
