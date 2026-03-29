import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pollCIBA } from "@/lib/auth0-ciba";
import { getCIBAReqId, getCIBAStatus, setCIBAStatus } from "@/lib/state";

export async function GET() {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cibaStatus = getCIBAStatus();
  const currentCIBAReqId = getCIBAReqId();

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
      setCIBAStatus("approved");
      return NextResponse.json({ status: "approved" });
    }

    if (result.status === "denied") {
      setCIBAStatus("denied");
    }

    return NextResponse.json({ status: result.status });
  } catch (err) {
    console.error("CIBA poll error:", err);
    return NextResponse.json({ status: "pending" });
  }
}
