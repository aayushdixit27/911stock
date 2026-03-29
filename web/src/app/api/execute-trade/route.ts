import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { executeTrade } from "@/lib/db";
import { getPosition } from "@/lib/portfolio";

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
      ticker = "SMCI",
      reductionPct = 50,
      pricePerShare = 42.50,
      approvalMethod = "manual",
    } = body;

    if (!signalId) {
      return NextResponse.json(
        { error: "signalId is required" },
        { status: 400 }
      );
    }

    const trade = await executeTrade({
      userId,
      signalId,
      ticker,
      reductionPct,
      pricePerShare,
      approvalMethod,
    });

    return NextResponse.json({
      success: true,
      trade,
    });
  } catch (err) {
    console.error("Trade execution error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Trade failed" },
      { status: 500 }
    );
  }
}
