import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTrades, getTradeCount, type DBTrade } from "@/lib/db";

export type TradeResponse = {
  id: string;
  signalId: string | null;
  ticker: string;
  action: string;
  sharesBefore: number;
  sharesAfter: number;
  sharesSold: number;
  pricePerShare: number;
  totalValue: number;
  reductionPct: number;
  orderId: string;
  approvalMethod: string;
  approvedAt: string;
};

function formatTrade(trade: DBTrade): TradeResponse {
  return {
    id: trade.id,
    signalId: trade.signal_id,
    ticker: trade.ticker,
    action: trade.action,
    sharesBefore: trade.shares_before,
    sharesAfter: trade.shares_after,
    sharesSold: trade.shares_sold,
    pricePerShare: trade.price_per_share,
    totalValue: trade.total_value,
    reductionPct: trade.reduction_pct,
    orderId: trade.order_id,
    approvalMethod: trade.approval_method,
    approvedAt: trade.approved_at.toISOString(),
  };
}

/**
 * GET /api/trades
 *
 * Returns the user's trade history with pagination.
 */
export async function GET(req: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Parse pagination params
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const offset = (page - 1) * limit;

  try {
    // Get trades and count in parallel
    const [trades, totalCount] = await Promise.all([
      getTrades(userId, limit, offset),
      getTradeCount(userId),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      trades: trades.map(formatTrade),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (err) {
    console.error("Trade history fetch error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch trades" },
      { status: 500 }
    );
  }
}
