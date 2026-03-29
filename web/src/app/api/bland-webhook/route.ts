import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { initiateCIBA } from "@/lib/auth0-ciba";
import { setCIBAReqId, setCIBAStatus } from "@/lib/state";

export async function POST(req: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    const userId = process.env.AUTH0_USER_SUB ?? "auth0|69c6e9fa2af7e5ac2f091ea3";

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
