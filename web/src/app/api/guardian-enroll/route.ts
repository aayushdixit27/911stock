import { NextResponse } from "next/server";

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN!;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID!;
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET!;
const AUTH0_USER_SUB = process.env.AUTH0_USER_SUB ?? "auth0|69c6e9fa2af7e5ac2f091ea3";

async function getMgmtToken(): Promise<string> {
  const res = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      audience: `https://${AUTH0_DOMAIN}/api/v2/`,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get management token");
  return data.access_token;
}

export async function GET() {
  try {
    const token = await getMgmtToken();

    // Check current enrollment status
    const userIdEncoded = AUTH0_USER_SUB.replace("|", "%7C");
    const enrollRes = await fetch(
      `https://${AUTH0_DOMAIN}/api/v2/users/${userIdEncoded}/enrollments`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const enrollments = await enrollRes.json();

    const confirmed = enrollments.find(
      (e: { status: string }) => e.status === "confirmed"
    );
    const pending = enrollments.find(
      (e: { status: string }) => e.status === "pending"
    );

    return NextResponse.json({
      enrollments,
      confirmed: !!confirmed,
      pending: !!pending,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST() {
  try {
    const token = await getMgmtToken();

    // Delete any existing pending enrollments first
    const userIdEncoded = AUTH0_USER_SUB.replace("|", "%7C");
    const enrollRes = await fetch(
      `https://${AUTH0_DOMAIN}/api/v2/users/${userIdEncoded}/enrollments`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const enrollments = await enrollRes.json();

    for (const enrollment of enrollments) {
      if (enrollment.status === "pending") {
        const idEncoded = enrollment.id.replace("|", "%7C");
        await fetch(
          `https://${AUTH0_DOMAIN}/api/v2/guardian/enrollments/${idEncoded}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
        );
      }
    }

    // Create fresh enrollment ticket
    const ticketRes = await fetch(
      `https://${AUTH0_DOMAIN}/api/v2/guardian/enrollments/ticket`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: AUTH0_USER_SUB }),
      }
    );
    const ticket = await ticketRes.json();

    if (!ticket.ticket_url) throw new Error(JSON.stringify(ticket));

    return NextResponse.json({
      ticketUrl: ticket.ticket_url,
      ticketId: ticket.ticket_id,
    });
  } catch (err) {
    console.error("guardian-enroll error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
