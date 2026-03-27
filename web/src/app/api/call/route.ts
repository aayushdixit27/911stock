import { NextRequest, NextResponse } from "next/server";
import { makeOutboundCall } from "@/lib/bland";
import { detectSignal, getHistoricalPattern, getWatchlist } from "@/lib/signals";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const user = getWatchlist();

    // Allow phone override from request body (for demo flexibility)
    const phone = body.phone || user.phone;

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

    const pattern = getHistoricalPattern(signal.ticker);

    // Use pre-generated explanation from body, or build a fallback
    const explanation =
      body.explanation ||
      `${signal.companyName}'s ${signal.role} just sold $${(signal.total_value / 1_000_000).toFixed(1)} million in stock — their first sale in ${signal.last_transaction_months_ago} months, outside their scheduled plan. ${pattern ? `The last ${pattern.occurrences.length} times ${signal.ticker} insiders did this, the stock dropped an average of ${pattern.avg_30d_drop_pct}% over 30 days.` : ""}`;

    const { callId } = await makeOutboundCall(
      phone,
      explanation,
      signal,
      pattern?.avg_30d_drop_pct ?? 0
    );

    return NextResponse.json({ success: true, callId });
  } catch (err) {
    console.error("Call error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Call failed" },
      { status: 500 }
    );
  }
}
