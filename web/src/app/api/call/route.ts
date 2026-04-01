import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { makeOutboundCall } from "@/lib/bland";
import { detectSignal, getHistoricalPattern } from "@/lib/signals";
import { getWatchlist } from "@/lib/db";
import { canAccessFeature } from "@/lib/billing";

export async function POST(req: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Check feature access - phone calls are premium only
  const hasAccess = await canAccessFeature(userId, "phone_calls");
  if (!hasAccess) {
    return NextResponse.json(
      { 
        error: "Premium required", 
        message: "Phone call alerts are only available for Premium subscribers",
        feature: "phone_calls",
        upgradeUrl: "/settings"
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    
    // Get user's watchlist from DB
    const watchlistItems = await getWatchlist(userId);
    const userTickers = watchlistItems.map((w) => w.ticker);

    // Allow phone override from request body (for demo flexibility)
    const phone = body.phone || process.env.MY_PHONE_NUMBER;

    if (!phone || phone === "+1XXXXXXXXXX") {
      return NextResponse.json(
        { error: "No phone number configured. Set MY_PHONE_NUMBER in .env.local" },
        { status: 400 }
      );
    }

    const signal = detectSignal();
    if (!signal) {
      return NextResponse.json({ error: "No signal detected" }, { status: 404 });
    }

    // Check if signal ticker is in user's watchlist
    if (!userTickers.includes(signal.ticker)) {
      return NextResponse.json(
        { error: `Signal for ${signal.ticker} not in your watchlist` },
        { status: 404 }
      );
    }

    const pattern = getHistoricalPattern(signal.ticker);

    // Use pre-generated explanation from body, or build a fallback
    const explanation =
      body.explanation ||
      `${signal.companyName}'s ${signal.role} just sold $${(signal.total_value / 1_000_000).toFixed(1)} million in stock — their first sale in ${signal.last_transaction_months_ago} months, outside their scheduled plan. ${pattern ? `The last ${pattern.occurrences.length} times ${signal.ticker} insiders did this, the stock dropped an average of ${pattern.avg_30d_drop_pct}% over 30 days.` : ""}`;

    const { callId } = await makeOutboundCall(phone, explanation, signal);

    return NextResponse.json({ success: true, callId });
  } catch (err) {
    console.error("Call error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Call failed" },
      { status: 500 }
    );
  }
}
