import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { 
  createOrder, 
  sellPercentage, 
  buyNotional, 
  getOrders, 
  cancelOrder,
  isAlpacaConfigured 
} from "@/lib/alpaca";

type OrderRequest = {
  symbol: string;
  qty?: number;
  notional?: number;
  side: "buy" | "sell";
  type?: "market" | "limit";
  limit_price?: number;
  // Convenience actions
  action?: "sell_percentage" | "buy_notional";
  percentage?: number;
  amount?: number;
  reason?: string;
};

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

  const status = req.nextUrl.searchParams.get("status") as "open" | "closed" | "all" | null;
  const limit = req.nextUrl.searchParams.get("limit");

  try {
    const orders = await getOrders({
      status: status || "open",
      limit: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o.id,
        clientOrderId: o.client_order_id,
        symbol: o.symbol,
        qty: parseFloat(o.qty),
        filledQty: parseFloat(o.filled_qty),
        side: o.side,
        type: o.type,
        status: o.status,
        limitPrice: o.limit_price ? parseFloat(o.limit_price) : null,
        filledAvgPrice: o.filled_avg_price ? parseFloat(o.filled_avg_price) : null,
        createdAt: o.created_at,
        filledAt: o.filled_at,
      })),
    });
  } catch (err) {
    console.error("Alpaca orders fetch error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

  try {
    const body = await req.json() as OrderRequest;
    const { symbol, side, action, reason } = body;

    if (!symbol) {
      return NextResponse.json(
        { error: "symbol is required" },
        { status: 400 }
      );
    }

    // Convenience action: sell percentage of position
    if (action === "sell_percentage") {
      const percentage = body.percentage || 50;
      const order = await sellPercentage(symbol, percentage, reason);
      return NextResponse.json({
        success: true,
        action: "sell_percentage",
        percentage,
        order: {
          id: order.id,
          symbol: order.symbol,
          qty: parseFloat(order.qty),
          side: order.side,
          type: order.type,
          status: order.status,
          limitPrice: order.limit_price ? parseFloat(order.limit_price) : null,
        },
      });
    }

    // Convenience action: buy dollar amount
    if (action === "buy_notional") {
      const amount = body.amount || 1000;
      const order = await buyNotional(symbol, amount, reason);
      return NextResponse.json({
        success: true,
        action: "buy_notional",
        amount,
        order: {
          id: order.id,
          symbol: order.symbol,
          side: order.side,
          type: order.type,
          status: order.status,
          limitPrice: order.limit_price ? parseFloat(order.limit_price) : null,
        },
      });
    }

    // Standard order
    if (!side) {
      return NextResponse.json(
        { error: "side is required (buy or sell)" },
        { status: 400 }
      );
    }

    const order = await createOrder({
      symbol,
      qty: body.qty,
      notional: body.notional,
      side,
      type: body.type || "market",
      limit_price: body.limit_price,
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        clientOrderId: order.client_order_id,
        symbol: order.symbol,
        qty: parseFloat(order.qty),
        side: order.side,
        type: order.type,
        status: order.status,
        limitPrice: order.limit_price ? parseFloat(order.limit_price) : null,
        createdAt: order.created_at,
      },
    });
  } catch (err) {
    console.error("Alpaca order error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to place order" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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

  const orderId = req.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json(
      { error: "orderId is required" },
      { status: 400 }
    );
  }

  try {
    await cancelOrder(orderId);
    return NextResponse.json({ success: true, orderId });
  } catch (err) {
    console.error("Alpaca cancel order error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to cancel order" },
      { status: 500 }
    );
  }
}