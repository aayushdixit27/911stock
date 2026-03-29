import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getWatchlist, addToWatchlist, getWatchlistCount } from "@/lib/db";

const MAX_WATCHLIST_SIZE = 50;

// Ticker validation regex: 1-5 uppercase letters (standard US ticker format)
const TICKER_REGEX = /^[A-Z]{1,5}$/;

/**
 * GET /api/watchlist
 * Returns the authenticated user's watchlist
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const watchlist = await getWatchlist(session.user.id);
    return NextResponse.json({ watchlist });
  } catch (err) {
    console.error("Watchlist GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch watchlist" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/watchlist
 * Adds a ticker to the authenticated user's watchlist
 * Body: { ticker: string }
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ticker } = body;

    // Validate ticker format
    if (!ticker || typeof ticker !== "string") {
      return NextResponse.json(
        { error: "Ticker is required" },
        { status: 400 }
      );
    }

    const normalizedTicker = ticker.trim().toUpperCase();

    if (!TICKER_REGEX.test(normalizedTicker)) {
      return NextResponse.json(
        { error: "Invalid ticker format. Must be 1-5 uppercase letters." },
        { status: 400 }
      );
    }

    // Check if user already has max tickers
    const currentCount = await getWatchlistCount(session.user.id);
    if (currentCount >= MAX_WATCHLIST_SIZE) {
      return NextResponse.json(
        { error: `Watchlist limit reached. Maximum ${MAX_WATCHLIST_SIZE} tickers allowed.` },
        { status: 400 }
      );
    }

    // Check for duplicate (will be handled by ON CONFLICT in addToWatchlist, but we want 409)
    const existing = await getWatchlist(session.user.id);
    if (existing.some((item) => item.ticker === normalizedTicker)) {
      return NextResponse.json(
        { error: "Ticker already in watchlist" },
        { status: 409 }
      );
    }

    // Add to watchlist
    const item = await addToWatchlist(session.user.id, normalizedTicker);
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    console.error("Watchlist POST error:", err);
    return NextResponse.json(
      { error: "Failed to add ticker" },
      { status: 500 }
    );
  }
}
