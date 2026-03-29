import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPositions, getPosition, isAlpacaConfigured } from "@/lib/alpaca";

export async function GET(req: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAlpacaConfigured()) {
    return NextResponse.json(
      { 
        error: "Alpaca not configured",
        hint: "Set ALPACA_API_KEY and ALPACA_API_SECRET in .env.local"
      },
      { status: 503 }
    );
  }

  const symbol = req.nextUrl.searchParams.get("symbol");

  try {
    if (symbol) {
      const position = await getPosition(symbol);
      if (!position) {
        return NextResponse.json(
          { error: `No position for ${symbol}` },
          { status: 404 }
        );
      }
      return NextResponse.json({
        position: {
          symbol: position.symbol,
          qty: parseFloat(position.qty),
          avgEntryPrice: parseFloat(position.avg_entry_price),
          currentPrice: parseFloat(position.current_price),
          marketValue: parseFloat(position.market_value),
          costBasis: parseFloat(position.cost_basis),
          unrealizedPL: parseFloat(position.unrealized_pl),
          unrealizedPLPct: parseFloat(position.unrealized_plpc) * 100,
          changeToday: parseFloat(position.change_today) * 100,
        },
      });
    }

    const positions = await getPositions();
    return NextResponse.json({
      positions: positions.map((p) => ({
        symbol: p.symbol,
        qty: parseFloat(p.qty),
        avgEntryPrice: parseFloat(p.avg_entry_price),
        currentPrice: parseFloat(p.current_price),
        marketValue: parseFloat(p.market_value),
        costBasis: parseFloat(p.cost_basis),
        unrealizedPL: parseFloat(p.unrealized_pl),
        unrealizedPLPct: parseFloat(p.unrealized_plpc) * 100,
        changeToday: parseFloat(p.change_today) * 100,
      })),
      totalValue: positions.reduce(
        (sum, p) => sum + parseFloat(p.market_value),
        0
      ),
    });
  } catch (err) {
    console.error("Alpaca positions fetch error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch positions" },
      { status: 500 }
    );
  }
}