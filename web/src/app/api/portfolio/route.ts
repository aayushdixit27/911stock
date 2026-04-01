import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPortfolio, getAlpacaConnection } from "@/lib/db";
import { getPositions, getTrades, getLastTrade } from "@/lib/portfolio";
import { getAlpacaPositions } from "@/lib/alpaca-oauth";

export type PortfolioPosition = {
  ticker: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  marketValue?: number;
  unrealizedPL?: number;
  unrealizedPLPct?: number;
};

export type PortfolioResponse = {
  positions: PortfolioPosition[];
  trades: ReturnType<typeof getTrades>;
  lastTrade: ReturnType<typeof getLastTrade>;
  source: "alpaca" | "db" | "memory";
  alpacaConnected?: boolean;
};

/**
 * GET /api/portfolio
 *
 * Returns user's portfolio positions.
 * Priority: Alpaca (if connected) → DB → Memory fallback
 */
export async function GET() {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Check if Alpaca is connected
  const alpacaConnection = await getAlpacaConnection(userId);

  // If Alpaca is connected, fetch positions from Alpaca
  if (alpacaConnection) {
    try {
      const alpacaPositions = await getAlpacaPositions(userId);

      const positions: PortfolioPosition[] = alpacaPositions.map((p) => ({
        ticker: p.symbol,
        shares: parseFloat(p.qty),
        avgCost: parseFloat(p.avg_entry_price),
        currentPrice: parseFloat(p.current_price),
        marketValue: parseFloat(p.market_value),
        unrealizedPL: parseFloat(p.unrealized_pl),
        unrealizedPLPct: parseFloat(p.unrealized_plpc) * 100,
      }));

      // Get trade history from DB
      const dbPortfolio = await getPortfolio(userId).catch(() => []);

      return NextResponse.json<PortfolioResponse>({
        positions,
        trades: dbPortfolio.length > 0 ? [] : getTrades(), // Use in-memory trades if no DB
        lastTrade: dbPortfolio.length > 0 ? null : getLastTrade(),
        source: "alpaca",
        alpacaConnected: true,
      });
    } catch (err) {
      console.error("Portfolio: Alpaca fetch error, falling back to DB", err);
      // Fall through to DB fallback
    }
  }

  // Get user's portfolio from DB
  let dbPortfolio: Awaited<ReturnType<typeof getPortfolio>> = [];
  try {
    dbPortfolio = await getPortfolio(userId);
  } catch (err) {
    console.error("Portfolio: DB error, using fallback", err);
  }

  // If no DB data, fall back to in-memory portfolio
  if (dbPortfolio.length === 0) {
    return NextResponse.json<PortfolioResponse>({
      positions: getPositions(),
      trades: getTrades(),
      lastTrade: getLastTrade(),
      source: "memory",
      alpacaConnected: !!alpacaConnection,
    });
  }

  // Format DB portfolio
  const positions: PortfolioPosition[] = dbPortfolio.map((p) => ({
    ticker: p.ticker,
    shares: p.shares,
    avgCost: p.avg_cost,
    currentPrice: p.avg_cost, // We don't have current price in DB
  }));

  return NextResponse.json<PortfolioResponse>({
    positions,
    trades: getTrades(),
    lastTrade: getLastTrade(),
    source: "db",
    alpacaConnected: !!alpacaConnection,
  });
}
