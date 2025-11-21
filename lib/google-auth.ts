export function getGoogleAuthUrl() {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

  const options = {
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

export async function getGoogleUser(code: string) {
  const url = "https://oauth2.googleapis.com/token";

  const values = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
    grant_type: "authorization_code",
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(values),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error_description || "Failed to get access token");
    }

    const { access_token, id_token } = data;

    // Get user info
    const userRes = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );

    const userData = await userRes.json();

    if (!userRes.ok) {
      throw new Error("Failed to get user info");
    }

    return {
      id: userData.id,
      email: userData.email,
      verified_email: userData.verified_email,
      name: userData.name,
      given_name: userData.given_name,
      family_name: userData.family_name,
      picture: userData.picture,
    };
  } catch (error) {
    console.error("Error getting Google user:", error);
    throw error;
  }
}
