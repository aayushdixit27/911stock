import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeSignal } from "@/lib/gemini";
import { makeOutboundCall } from "@/lib/bland";
import { detectSignal, getHistoricalPattern, scoreSignal } from "@/lib/signals";
import { fetchLatestSignal } from "@/lib/edgar";
import { fetchNewsSentiment } from "@/lib/news";
import { setLastSignal, setLastUserId } from "@/lib/state";
import { insertSignal, getLatestSignal, getWatchlist, getPortfolio, insertNotification, getUserTier, insertSignalOutcome, getUserSettings, type DBSignal } from "@/lib/db";

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

    // Get user's tier and settings for notification preferences
    const userTier = await getUserTier(userId);
    const userSettings = await getUserSettings(userId);
    const deliverAt = calculateDeliverAt(userTier);

    // Determine notification preferences
    const notifyInApp = userSettings?.notify_in_app ?? true;
    const notifyPhone = userSettings?.notify_phone ?? false;

    // Process all signals for the user
    const results = [];
    for (const { signal, edgarSignal } of signals) {
      if (!signal) continue;

      // Persist signal to SSE state (last signal wins for demo)
      setLastSignal(signal);

      // Get user's position in this ticker for context-aware scoring
      const position = portfolio.find((p) => p.ticker === signal.ticker);
      const riskTolerance = (userSettings?.risk_tolerance as "moderate" | "conservative" | "aggressive") ?? "moderate";
      const userContext = position ? {
        positionShares: position.shares,
        avgCost: position.avg_cost,
        riskTolerance,
      } : {
        positionShares: 0,
        riskTolerance,
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

      // Create signal outcome for accuracy tracking (shared across all users)
      if (signalInserted) {
        try {
          // Extract prediction direction from the explanation
          // If explanation mentions "sell" or "drop" or "decline", prediction is DOWN
          // Otherwise assume UP for buy signals
          const explanation_lower = (explanation ?? '').toLowerCase();
          const predictionDirection = explanation_lower.includes('sell') || 
                                      explanation_lower.includes('drop') || 
                                      explanation_lower.includes('decline') ||
                                      explanation_lower.includes('down') ||
                                      signal.action === 'SELL' ? 'DOWN' : 'UP';
          
          await insertSignalOutcome({
            signal_id: dbSignal.id,
            ticker: signal.ticker,
            prediction_direction: predictionDirection,
            price_at_signal: signal.price_per_share,
            price_after_7d: null,
            price_after_30d: null,
            was_correct_7d: null,
            was_correct_30d: null,
            checked_at: null,
          });
          console.log(`[trigger] Created signal outcome for ${dbSignal.id}, prediction: ${predictionDirection}`);
        } catch (err) {
          console.error("[trigger] Failed to create signal outcome:", err);
        }
      }

      // Create notification for this signal (with staggered delivery based on tier and user preference)
      if (signalInserted && notifyInApp) {
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
      } else if (!notifyInApp) {
        console.log(`[trigger] Skipped in-app notification for user ${userId} - notifications disabled`);
      }

      // Trigger outbound call if:
      // - Score is high enough
      // - User is premium
      // - User has phone notifications enabled
      let callId: string | null = null;
      let callTriggered = false;
      if (score >= 7 && userTier === 'premium' && notifyPhone) {
        const phone = process.env.MY_PHONE_NUMBER;
        if (phone && phone !== "+1XXXXXXXXXX") {
          try {
            const result = await makeOutboundCall(phone, explanation, signal);
            callId = result.callId;
            callTriggered = true;
          } catch (err) {
            console.error("[trigger] Failed to make outbound call:", err);
          }
        }
      } else if (score >= 7 && userTier === 'premium' && !notifyPhone) {
        console.log(`[trigger] Skipped outbound call for signal ${dbSignal.id} - phone notifications disabled`);
      } else if (score >= 7 && userTier !== 'premium') {
        console.log(`[trigger] Skipped outbound call for signal ${dbSignal.id} - user is on ${userTier} tier`);
      }

      results.push({
        signal,
        pattern,
        score,
        explanation,
        callId,
        callTriggered,
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
