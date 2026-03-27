import { NextRequest, NextResponse } from "next/server";
import { initiateCIBA } from "@/lib/auth0-ciba";
import { setCIBAReqId, setCIBAStatus } from "@/lib/state";
import { auth0 } from "@/lib/auth0";

// Called by the dashboard when entering the "awaiting approval" state.
// Works even on localhost (no public webhook URL required).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ticker = (body.ticker as string) ?? "SMCI";

  if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_CLIENT_ID) {
    setCIBAStatus("approved");
    return NextResponse.json({ status: "approved", mode: "woz" });
  }

  // Prefer logged-in session sub (from /settings login), fall back to env
  const session = await auth0.getSession();
  const userId = session?.user?.sub ?? process.env.AUTH0_USER_SUB;

  if (!userId) {
    setCIBAStatus("approved");
    return NextResponse.json({ status: "approved", mode: "woz-no-sub" });
  }

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
    setCIBAStatus("approved");
    return NextResponse.json({ status: "approved", mode: "fallback", error: String(err) });
  }
}
