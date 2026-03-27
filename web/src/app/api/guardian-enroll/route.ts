import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

// Get a Management API token via client credentials
async function getMgmtToken(): Promise<string> {
  const domain = process.env.AUTH0_DOMAIN!;
  const res = await fetch(`https://${domain}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AUTH0_CLIENT_ID!,
      client_secret: process.env.AUTH0_CLIENT_SECRET!,
      audience: `https://${domain}/api/v2/`,
    }).toString(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Mgmt token error: ${err.error_description || err.error}`);
  }
  const data = await res.json();
  return data.access_token;
}

export async function GET() {
  const session = await auth0.getSession();
  const userId = session?.user?.sub ?? process.env.AUTH0_USER_SUB;

  if (!userId) {
    return NextResponse.json({ error: "No user configured" }, { status: 400 });
  }

  try {
    const token = await getMgmtToken();
    const domain = process.env.AUTH0_DOMAIN!;

    const res = await fetch(
      `https://${domain}/api/v2/guardian/enrollments/ticket`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.error || "Enrollment ticket failed");
    }

    const data = await res.json();
    return NextResponse.json({ ticketUrl: data.ticket_url });
  } catch (err) {
    console.error("guardian-enroll error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
