import { NextRequest, NextResponse } from "next/server";
import { initiateCIBA } from "@/lib/auth0-ciba";

// In-memory store for the current CIBA request
// (fine for hackathon single-demo use)
export let currentCIBAReqId: string | null = null;
export let cibaStatus: "idle" | "pending" | "approved" | "denied" = "idle";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Bland webhook received:", body);

    if (!body.approved) {
      return NextResponse.json({ status: "declined" });
    }

    const ticker = body.ticker || "SMCI";

    // If Auth0 is not configured, use WoZ mode
    if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_CLIENT_ID) {
      cibaStatus = "approved";
      console.log("WoZ mode: auto-approving (Auth0 not configured)");
      return NextResponse.json({ status: "approved", mode: "woz" });
    }

    // Real CIBA flow — initiate push notification to user's Guardian app
    const userId = process.env.AUTH0_USER_SUB!;
    if (!userId) {
      // Auto-approve if no user sub configured
      cibaStatus = "approved";
      return NextResponse.json({ status: "approved", mode: "woz-no-sub" });
    }

    const { authReqId } = await initiateCIBA(
      userId,
      `Approve: reduce ${ticker} position by 50%`
    );

    currentCIBAReqId = authReqId;
    cibaStatus = "pending";

    return NextResponse.json({ status: "pending", authReqId });
  } catch (err) {
    console.error("Bland webhook error:", err);
    // Fail open for demo resilience
    cibaStatus = "approved";
    return NextResponse.json({ status: "approved", mode: "fallback" });
  }
}
