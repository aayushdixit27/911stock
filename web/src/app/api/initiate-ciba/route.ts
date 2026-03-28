import { NextRequest, NextResponse } from "next/server";
import { initiateCIBA } from "@/lib/auth0-ciba";
import { setCIBAReqId, setCIBAStatus } from "@/lib/state";

// Called by the dashboard when entering the "awaiting approval" state.
// Always targets AUTH0_USER_SUB — the Auth0 native user with Guardian enrolled.
// Social logins (google-oauth2|...) cannot use Guardian push.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ticker = (body.ticker as string) ?? "SMCI";

  if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_CLIENT_ID) {
    return NextResponse.json({ status: "no-config" });
  }

  const userId = process.env.AUTH0_USER_SUB ?? "auth0|69c6e9fa2af7e5ac2f091ea3";

  console.log("CIBA: sending push to", userId);

  try {
    const { authReqId } = await initiateCIBA(
      userId,
      `Approve: reduce ${ticker} position by half`
    );
    setCIBAReqId(authReqId);
    setCIBAStatus("pending");
    console.log("CIBA initiated, authReqId:", authReqId);
    return NextResponse.json({ status: "pending", authReqId });
  } catch (err) {
    console.error("initiate-ciba error:", err);
    // Don't auto-approve — let the dashboard Approve button handle it
    return NextResponse.json({ status: "no-guardian", error: String(err) });
  }
}
