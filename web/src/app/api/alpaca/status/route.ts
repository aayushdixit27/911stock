import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAlpacaConnection, getUserTier } from "@/lib/db";

/**
 * GET /api/alpaca/status
 * 
 * Returns the Alpaca connection status and user tier for the authenticated user.
 */
export async function GET() {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // Get user tier
    const tier = await getUserTier(userId);
    
    // Get Alpaca connection status (without exposing the token)
    const connection = await getAlpacaConnection(userId);
    
    return NextResponse.json({
      tier,
      isPremium: tier === "premium",
      alpacaConnected: !!connection,
      connectedAt: connection?.created_at || null,
    });
  } catch (err) {
    console.error("Alpaca status error:", err);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}
