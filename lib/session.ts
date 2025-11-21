import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "your-secret-key-min-32-characters-long"
);

export type SessionData = {
  userId: string;
  email: string;
  name?: string;
  image?: string;
};

export async function createSession(data: SessionData) {
  const token = await new SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session");

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token.value, secret);

    // Validate required fields
    if (!payload.email || !payload.userId) {
      console.error("Invalid session: missing required fields");
      cookieStore.delete("session");
      return null;
    }

    return payload as SessionData;
  } catch (error) {
    console.error("Error verifying session:", error);
    // Delete invalid session cookie
    cookieStore.delete("session");
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
