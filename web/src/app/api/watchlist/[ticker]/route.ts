import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { removeFromWatchlist } from "@/lib/db";

/**
 * DELETE /api/watchlist/[ticker]
 * Removes a ticker from the authenticated user's watchlist
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ticker } = await params;
    const normalizedTicker = ticker.trim().toUpperCase();

    await removeFromWatchlist(session.user.id, normalizedTicker);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Watchlist DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to remove ticker" },
      { status: 500 }
    );
  }
}
