import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// This endpoint is kept for backward compatibility with the dashboard's
// manual "Approve" button. The real CIBA flow runs through:
//   Bland tool call → /api/bland-webhook → Auth0 CIBA → /api/ciba-status (polling)
export async function POST(req: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { ticker = "SMCI" } = body;

  // If Auth0 is configured, signal the webhook to initiate CIBA
  if (process.env.AUTH0_DOMAIN && process.env.AUTH0_USER_SUB) {
    try {
      const { initiateCIBA } = await import("@/lib/auth0-ciba");
      const { authReqId } = await initiateCIBA(
        process.env.AUTH0_USER_SUB,
        `Approve: reduce ${ticker} position by 50%`
      );
      return NextResponse.json({ success: true, method: "ciba", authReqId });
    } catch (err) {
      console.error("CIBA error:", err);
    }
  }

  // WoZ fallback
  await new Promise((r) => setTimeout(r, 1500));
  return NextResponse.json({ success: true, method: "woz", approved: true });
}
