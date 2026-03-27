import { NextRequest, NextResponse } from "next/server";
import { executeTrade, getPosition } from "@/lib/portfolio";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      ticker = "SMCI",
      reductionPct = 50,
      reason = "CEO unscheduled insider sale — HIGH significance",
      approvedVia = "auth0_ciba",
    } = body;

    const position = getPosition(ticker);
    if (!position) {
      return NextResponse.json(
        { error: `No position found for ${ticker}` },
        { status: 404 }
      );
    }

    const trade = executeTrade(ticker, reductionPct, reason, approvedVia);

    return NextResponse.json({
      success: true,
      trade,
      position: getPosition(ticker),
    });
  } catch (err) {
    console.error("Trade execution error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Trade failed" },
      { status: 500 }
    );
  }
}
