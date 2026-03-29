import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteAlpacaConnection, getAlpacaConnection, getUserTier } from "@/lib/db";

/**
 * POST /api/alpaca/disconnect
 * 
 * Removes Alpaca OAuth connection for the authenticated user.
 * Premium only - free users get 403.
 */
export async function POST() {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Check premium tier
  const tier = await getUserTier(userId);
  if (tier !== "premium") {
    return NextResponse.json(
      { error: "Premium required", message: "Alpaca integration is available for premium users only" },
      { status: 403 }
    );
  }

  try {
    // Check if user has a connection
    const connection = await getAlpacaConnection(userId);
    if (!connection) {
      return NextResponse.json(
        { error: "No Alpaca connection found" },
        { status: 404 }
      );
    }

    // Delete the connection
    const deleted = await deleteAlpacaConnection(userId);
    
    if (deleted) {
      return NextResponse.json({
        success: true,
        message: "Alpaca connection removed successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Failed to remove Alpaca connection" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Alpaca disconnect error:", err);
    return NextResponse.json(
      { error: "Failed to disconnect Alpaca" },
      { status: 500 }
    );
  }
}
