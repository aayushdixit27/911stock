import { NextRequest, NextResponse } from "next/server";
import { initiateCIBA } from "@/lib/auth0-ciba";
import { setCIBAReqId, setCIBAStatus } from "@/lib/state";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Bland webhook received:", body);

    if (!body.approved) {
      return NextResponse.json({ status: "declined" });
    }

    const ticker = body.ticker || "SMCI";

    if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_CLIENT_ID) {
      setCIBAStatus("approved");
      console.log("WoZ mode: auto-approving (Auth0 not configured)");
      return NextResponse.json({ status: "approved", mode: "woz" });
    }

    const userId = process.env.AUTH0_USER_SUB!;
    if (!userId) {
      setCIBAStatus("approved");
      return NextResponse.json({ status: "approved", mode: "woz-no-sub" });
    }

    const { authReqId } = await initiateCIBA(
      userId,
      `Approve: reduce ${ticker} position by half`
    );

    setCIBAReqId(authReqId);
    setCIBAStatus("pending");

    return NextResponse.json({ status: "pending", authReqId });
  } catch (err) {
    console.error("Bland webhook error:", err);
    setCIBAStatus("approved");
    return NextResponse.json({ status: "approved", mode: "fallback" });
  }
}
