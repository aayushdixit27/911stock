import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeSignal } from "@/lib/gemini";
import { makeOutboundCall } from "@/lib/bland";
import { detectSignal, getHistoricalPattern, scoreSignal } from "@/lib/signals";
import { fetchLatestSignal } from "@/lib/edgar";
import { fetchNewsSentiment } from "@/lib/news";
import { setLastSignal, setLastUserId } from "@/lib/state";
import { insertSignal, getLatestSignal, getWatchlist, getPortfolio, insertNotification, getUserTier, type DBSignal } from "@/lib/db";

// Calculate notification delivery time based on user tier
// Premium users: immediate (now)
// Free users: 15-minute delay
function calculateDeliverAt(userTier: string): Date {
  const now = new Date();
  if (userTier === 'premium') {
    return now; // Immediate for premium users
  }
  // Free users get 15-minute delay
  return new Date(now.getTime() + 15 * 60 * 1000);
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const isLive = searchParams.get("mode") === "live";

    setLastUserId(userId);

    // Get user's watchlist from DB
    const watchlistItems = await getWatchlist(userId);
    const userTickers = watchlistItems.map((w) => w.ticker);

    if (userTickers.length === 0) {
      return NextResponse.json(
        { error: "No tickers in watchlist. Add tickers to get started." },
        { status: 400 }
      );
    }

    // Get user's portfolio for context-aware scoring
    const portfolio = await getPortfolio(userId);

    const signals: { signal: ReturnType<typeof detectSignal>; edgarSignal: Awaited<ReturnType<typeof fetchLatestSignal>> }[] = [];

    if (isLive) {
      // Fetch EDGAR signals for all tickers in user's watchlist
      for (const ticker of userTickers) {
        try {
          const edgarSignal = await fetchLatestSignal([ticker]);
          if (edgarSignal) {
            signals.push({ signal: edgarSignal as ReturnType<typeof detectSignal>, edgarSignal });
          }
        } catch (err) {
          console.warn(`[trigger] EDGAR fetch failed for ${ticker}:`, err);
        }
      }

      // If no EDGAR signals found, fall back to demo for testing
      if (signals.length === 0) {
        console.log("Live mode: no EDGAR signals found, falling back to demo");
        const demoSignal = detectSignal();
        if (demoSignal && userTickers.includes(demoSignal.ticker)) {
          signals.push({ signal: demoSignal, edgarSignal: null });
        }
      }
    } else {
      // Demo mode - use demo signal if ticker is in user's watchlist
      const demoSignal = detectSignal();
      if (demoSignal && userTickers.includes(demoSignal.ticker)) {
        signals.push({ signal: demoSignal, edgarSignal: null });
      }
    }

    if (signals.length === 0) {
      return NextResponse.json(
        { error: "No signals for your watchlist" },
        { status: 404 }
      );
    }

    // Get user's tier for staggered notification delivery
    const userTier = await getUserTier(userId);
    const deliverAt = calculateDeliverAt(userTier);

    // Process all signals for the user
    const results = [];
    for (const { signal, edgarSignal } of signals) {
      if (!signal) continue;

      // Persist signal to SSE state (last signal wins for demo)
      setLastSignal(signal);

      // Get user's position in this ticker for context-aware scoring
      const position = portfolio.find((p) => p.ticker === signal.ticker);
      const userContext = position ? {
        positionShares: position.shares,
        avgCost: position.avg_cost,
        riskTolerance: "moderate" as const, // Default for now, will be user preference
      } : {
        positionShares: 0,
        riskTolerance: "moderate" as const,
      };

      const pattern = getHistoricalPattern(signal.ticker);

      // Fetch news sentiment
      const newsSentiment = await fetchNewsSentiment(signal.ticker);

      // Score signal with user context
      const score = scoreSignal(
        {
          scheduled_10b5_1: signal.scheduled_10b5_1,
          role: signal.role,
          last_transaction_months_ago: signal.last_transaction_months_ago,
          position_reduced_pct: signal.position_reduced_pct,
          total_value: signal.total_value,
        },
        newsSentiment,
        userContext
      );

      // Generate explanation
      const explanation = await analyzeSignal(signal, pattern);

      // Build DB signal with user_id and edgar_filing_id for deduplication
      const edgarFilingId = edgarSignal?.id ?? `demo-${signal.ticker}-${Date.now()}`;
      // Use filed if available (EDGAR signal), otherwise use date (demo signal)
      const filedAt = (signal as { filed?: string; date: string }).filed ?? signal.date;
      const dbSignal: DBSignal = {
        id: `${userId}-${edgarFilingId}`,
        user_id: userId,
        ticker: signal.ticker,
        company_name: signal.companyName,
        insider: signal.insider,
        role: signal.role,
        action: signal.action,
        shares: signal.shares,
        price_per_share: signal.price_per_share,
        total_value: signal.total_value,
        date: signal.date,
        filed_at: filedAt,
        scheduled_10b5_1: signal.scheduled_10b5_1,
        last_transaction_months_ago: signal.last_transaction_months_ago,
        position_reduced_pct: signal.position_reduced_pct,
        score,
        explanation,
        alerted: false,
        edgar_filing_id: edgarFilingId,
      };

      // Save signal to DB (ON CONFLICT DO NOTHING for deduplication)
      let signalInserted = false;
      try {
        await insertSignal(dbSignal);
        signalInserted = true;
        console.log(`[trigger] Saved signal ${dbSignal.id} for user ${userId}`);
      } catch (err) {
        console.error("[trigger] Failed to save signal to DB:", err);
      }

      // Create notification for this signal (with staggered delivery based on tier)
      if (signalInserted) {
        try {
          const urgencyLabel = score >= 7 ? 'High urgency' : score >= 4 ? 'Medium urgency' : 'Low urgency';
          await insertNotification({
            user_id: userId,
            signal_id: dbSignal.id,
            type: 'signal',
            title: `${signal.ticker} - ${urgencyLabel} insider signal`,
            body: explanation.substring(0, 200) + (explanation.length > 200 ? '...' : ''),
            read: false,
            deliver_at: deliverAt,
          });
          console.log(`[trigger] Created notification for signal ${dbSignal.id}, deliver_at: ${deliverAt.toISOString()} (${userTier} tier)`);
        } catch (err) {
          console.error("[trigger] Failed to create notification:", err);
        }
      }

      // Trigger outbound call if score is high enough
      let callId: string | null = null;
      if (score >= 7) {
        const phone = process.env.MY_PHONE_NUMBER;
        if (phone && phone !== "+1XXXXXXXXXX") {
          try {
            const result = await makeOutboundCall(phone, explanation, signal);
            callId = result.callId;
          } catch (err) {
            console.error("[trigger] Failed to make outbound call:", err);
          }
        }
      }

      results.push({
        signal,
        pattern,
        score,
        explanation,
        callId,
        callTriggered: !!callId,
        tier: userTier,
        deliverAt: deliverAt.toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
      mode: isLive ? "live" : "demo",
      userId,
    });
  } catch (err) {
    console.error("Trigger error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Pipeline failed" },
      { status: 500 }
    );
  }
}
