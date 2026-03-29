import { NextResponse } from "next/server";
import { getAccuracyStats } from "@/lib/db";

/**
 * GET /api/accuracy
 * 
 * Public endpoint that returns aggregate accuracy statistics.
 * This is used to display platform accuracy to attract users.
 */
export async function GET() {
  try {
    const stats = await getAccuracyStats();

    // Calculate percentages
    const accuracy7d = stats.checked7d > 0 
      ? Math.round((stats.correct7d / stats.checked7d) * 100) 
      : 0;
    
    const accuracy30d = stats.checked30d > 0 
      ? Math.round((stats.correct30d / stats.checked30d) * 100) 
      : 0;

    // Per-ticker breakdown with percentages
    const perTicker = stats.perTicker.map(ticker => ({
      ticker: ticker.ticker,
      total: ticker.total,
      accuracy7d: stats.checked7d > 0 
        ? Math.round((ticker.correct7d / Math.max(1, ticker.total)) * 100)
        : 0,
      accuracy30d: stats.checked30d > 0 
        ? Math.round((ticker.correct30d / Math.max(1, ticker.total)) * 100)
        : 0,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalSignals: stats.totalSignals,
        tracked7d: stats.checked7d,
        tracked30d: stats.checked30d,
        correct7d: stats.correct7d,
        correct30d: stats.correct30d,
        accuracy7d,
        accuracy30d,
        perTicker,
      },
    });
  } catch (err) {
    console.error("[accuracy] Error fetching accuracy stats:", err);
    return NextResponse.json(
      { error: "Failed to fetch accuracy stats" },
      { status: 500 }
    );
  }
}
