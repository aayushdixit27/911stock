import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  executeTrade,
  getUserTier,
  getSignalById,
  getAlpacaConnection,
  getTradeBySignalId,
} from "@/lib/db";
import {
  sellPercentageOnAlpaca,
  getAlpacaPosition,
} from "@/lib/alpaca-oauth";

/**
 * POST /api/execute-trade
 *
 * Execute a trade based on a signal recommendation.
 * Premium feature - requires premium tier and Alpaca OAuth connection.
 * Idempotent - returns existing trade if one already exists for the signal.
 */
export async function POST(req: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await req.json().catch(() => ({}));
    const {
      signalId,
      ticker,
      reductionPct = 50,
      pricePerShare,
      approvalMethod = "web_button",
    } = body;

    // Validate required fields
    if (!signalId) {
      return NextResponse.json(
        { error: "signalId is required" },
        { status: 400 }
      );
    }

    if (!ticker) {
      return NextResponse.json(
        { error: "ticker is required" },
        { status: 400 }
      );
    }

    // Check if user is premium
    const tier = await getUserTier(userId);
    if (tier !== "premium") {
      return NextResponse.json(
        {
          error: "Premium required",
          message: "Trade execution is a premium feature. Please upgrade to execute trades.",
        },
        { status: 403 }
      );
    }

    // Check if Alpaca is connected
    const alpacaConnection = await getAlpacaConnection(userId);
    if (!alpacaConnection) {
      return NextResponse.json(
        {
          error: "Alpaca not connected",
          message: "Please connect your Alpaca paper trading account first.",
          action: "connect_alpaca",
        },
        { status: 400 }
      );
    }

    // Verify signal exists and belongs to user
    const signal = await getSignalById(userId, signalId);
    if (!signal) {
      return NextResponse.json(
        { error: "Signal not found" },
        { status: 404 }
      );
    }

    // Check for existing trade (idempotency)
    const existingTrade = await getTradeBySignalId(userId, signalId);
    if (existingTrade) {
      return NextResponse.json({
        success: true,
        trade: existingTrade,
        message: "Trade already exists for this signal",
        idempotent: true,
      });
    }

    // Check Alpaca position
    const alpacaPosition = await getAlpacaPosition(userId, ticker);
    if (!alpacaPosition) {
      return NextResponse.json(
        {
          error: "No position",
          message: `You don't have a position in ${ticker} on Alpaca.`,
        },
        { status: 400 }
      );
    }

    const currentShares = parseFloat(alpacaPosition.qty);
    const sharesToSell = Math.floor(currentShares * (reductionPct / 100));

    if (sharesToSell < 1) {
      return NextResponse.json(
        {
          error: "Insufficient shares",
          message: `Position too small to sell ${reductionPct}% (only ${currentShares} shares)`,
        },
        { status: 400 }
      );
    }

    // Execute trade on Alpaca
    const clientOrderId = `911stock-${signalId.slice(0, 20)}-${Date.now()}`;
    const alpacaResult = await sellPercentageOnAlpaca(
      userId,
      ticker,
      reductionPct,
      clientOrderId
    );

    // Calculate trade details
    const tradePrice = pricePerShare || alpacaResult.price;
    const totalValue = Math.round(sharesToSell * tradePrice * 100) / 100;

    // Store trade in database
    const trade = await executeTrade({
      userId,
      signalId,
      ticker,
      reductionPct,
      pricePerShare: tradePrice,
      approvalMethod,
    });

    // Return enriched trade with Alpaca order details
    return NextResponse.json({
      success: true,
      trade: {
        ...trade,
        alpacaOrderId: alpacaResult.order.id,
        alpacaOrderStatus: alpacaResult.order.status,
        sharesSold: sharesToSell,
        currentPrice: alpacaResult.price,
        totalValue,
      },
    });
  } catch (err) {
    console.error("Trade execution error:", err);

    // Handle specific Alpaca errors
    if (err instanceof Error) {
      if (err.message.includes("Alpaca not connected")) {
        return NextResponse.json(
          {
            error: "Alpaca not connected",
            message: "Please connect your Alpaca paper trading account first.",
            action: "connect_alpaca",
          },
          { status: 400 }
        );
      }

      if (err.message.includes("No position found")) {
        return NextResponse.json(
          {
            error: "No position",
            message: "You don't have a position in this stock on Alpaca.",
          },
          { status: 400 }
        );
      }

      if (err.message.includes("trading_blocked") || err.message.includes("account_blocked")) {
        return NextResponse.json(
          {
            error: "Trading blocked",
            message: "Your Alpaca account has trading restrictions. Please check your account.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Trade failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/execute-trade
 *
 * Check if a trade exists for a signal (idempotency check endpoint)
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const signalId = req.nextUrl.searchParams.get("signalId");
  if (!signalId) {
    return NextResponse.json(
      { error: "signalId is required" },
      { status: 400 }
    );
  }

  try {
    const existingTrade = await getTradeBySignalId(userId, signalId);
    return NextResponse.json({
      exists: !!existingTrade,
      trade: existingTrade,
    });
  } catch (err) {
    console.error("Trade check error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to check trade" },
      { status: 500 }
    );
  }
}
