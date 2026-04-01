import { NextRequest, NextResponse } from "next/server";
import { getOutstandingOutcomes, updateSignalOutcomePrices } from "@/lib/db";

/**
 * POST /api/accuracy/check
 * 
 * Internal/cron endpoint that checks outstanding outcomes where price_after_7d 
 * or price_after_30d is null and enough time has passed.
 * Fetches current stock price and updates the outcome record.
 * 
 * This endpoint can be called by a cron job or internal scheduler.
 * It can be protected via a secret token if needed.
 */
export async function POST(req: NextRequest) {
  try {
    // Optional: Check for a cron secret to prevent unauthorized access
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    // If CRON_SECRET is set, require it in the Authorization header
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get outstanding outcomes that need price checking
    const outstanding = await getOutstandingOutcomes();
    
    if (outstanding.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No outstanding outcomes to check",
        checked: 0,
        updated: 0,
      });
    }

    const results = [];
    let updated = 0;

    for (const outcome of outstanding) {
      try {
        // Fetch current stock price from Yahoo Finance
        const priceRes = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(outcome.ticker)}?range=1d&interval=1d`,
          { next: { revalidate: 0 } } // No cache for accuracy checks
        );

        if (!priceRes.ok) {
          console.warn(`[accuracy/check] Failed to fetch price for ${outcome.ticker}: ${priceRes.status}`);
          results.push({
            id: outcome.id,
            ticker: outcome.ticker,
            status: "error",
            error: `Yahoo API error: ${priceRes.status}`,
          });
          continue;
        }

        const data = await priceRes.json();
        const currentPrice = data.chart.result?.[0]?.meta?.regularMarketPrice;

        if (!currentPrice) {
          console.warn(`[accuracy/check] No price data for ${outcome.ticker}`);
          results.push({
            id: outcome.id,
            ticker: outcome.ticker,
            status: "error",
            error: "No price data",
          });
          continue;
        }

        // Determine which prices to update
        const updates: {
          price_after_7d?: number;
          price_after_30d?: number;
          was_correct_7d?: boolean;
          was_correct_30d?: boolean;
        } = {};

        const daysSinceCreated = Math.floor(
          (Date.now() - new Date(outcome.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Check if 7 days have passed and price_after_7d is null
        if (daysSinceCreated >= 7 && outcome.price_after_7d === null) {
          updates.price_after_7d = currentPrice;
          // For SELL/DOWN predictions: price going down is correct
          // For BUY/UP predictions: price going up is correct
          if (outcome.prediction_direction === 'DOWN') {
            updates.was_correct_7d = currentPrice < outcome.price_at_signal;
          } else {
            updates.was_correct_7d = currentPrice > outcome.price_at_signal;
          }
        }

        // Check if 30 days have passed and price_after_30d is null
        if (daysSinceCreated >= 30 && outcome.price_after_30d === null) {
          updates.price_after_30d = currentPrice;
          if (outcome.prediction_direction === 'DOWN') {
            updates.was_correct_30d = currentPrice < outcome.price_at_signal;
          } else {
            updates.was_correct_30d = currentPrice > outcome.price_at_signal;
          }
        }

        // Update the outcome record
        if (Object.keys(updates).length > 0) {
          await updateSignalOutcomePrices(outcome.id, updates);
          updated++;
          results.push({
            id: outcome.id,
            ticker: outcome.ticker,
            status: "updated",
            priceAtSignal: outcome.price_at_signal,
            currentPrice,
            predictionDirection: outcome.prediction_direction,
            updates,
          });
        } else {
          results.push({
            id: outcome.id,
            ticker: outcome.ticker,
            status: "skipped",
            daysSinceCreated,
          });
        }

        // Rate limiting - be nice to Yahoo Finance
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`[accuracy/check] Error processing outcome ${outcome.id}:`, err);
        results.push({
          id: outcome.id,
          ticker: outcome.ticker,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      checked: outstanding.length,
      updated,
      results,
    });
  } catch (err) {
    console.error("[accuracy/check] Error:", err);
    return NextResponse.json(
      { error: "Failed to check accuracy" },
      { status: 500 }
    );
  }
}
