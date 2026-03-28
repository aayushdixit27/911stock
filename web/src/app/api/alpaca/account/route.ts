import { NextResponse } from "next/server";
import { getAccount, isAlpacaConfigured } from "@/lib/alpaca";

export async function GET() {
  if (!isAlpacaConfigured()) {
    return NextResponse.json(
      { 
        error: "Alpaca not configured",
        hint: "Set ALPACA_API_KEY and ALPACA_API_SECRET in .env.local"
      },
      { status: 503 }
    );
  }

  try {
    const account = await getAccount();
    return NextResponse.json({
      configured: true,
      paperTrading: true,
      account: {
        id: account.id,
        number: account.account_number,
        status: account.status,
        buyingPower: parseFloat(account.buying_power),
        cash: parseFloat(account.cash),
        portfolioValue: parseFloat(account.portfolio_value),
        currency: account.currency,
        patternDayTrader: account.pattern_day_trader,
        blocked: account.trading_blocked || account.account_blocked,
      },
    });
  } catch (err) {
    console.error("Alpaca account fetch error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch account" },
      { status: 500 }
    );
  }
}