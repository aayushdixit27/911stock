import { NextResponse } from "next/server";
import { pollCIBA } from "@/lib/auth0-ciba";
import { currentCIBAReqId, cibaStatus } from "@/app/api/bland-webhook/route";

// The dashboard polls this endpoint every 3 seconds to check if the
// Auth0 Guardian push notification was approved
export async function GET() {
  // WoZ / auto-approved case
  if (cibaStatus === "approved" && !currentCIBAReqId) {
    return NextResponse.json({ status: "approved" });
  }

  if (cibaStatus === "denied") {
    return NextResponse.json({ status: "denied" });
  }

  if (!currentCIBAReqId) {
    return NextResponse.json({ status: "idle" });
  }

  // Real CIBA: poll Auth0
  try {
    const result = await pollCIBA(currentCIBAReqId);

    if (result.status === "approved") {
      return NextResponse.json({ status: "approved" });
    }

    return NextResponse.json({ status: result.status });
  } catch (err) {
    console.error("CIBA poll error:", err);
    return NextResponse.json({ status: "pending" });
  }
}
