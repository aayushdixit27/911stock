import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPortfolio } from "@/lib/db";
import { getPositions, getTrades, getLastTrade } from "@/lib/portfolio";

export async function GET() {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Get user's portfolio from DB
  let dbPortfolio: Awaited<ReturnType<typeof getPortfolio>> = [];
  try {
    dbPortfolio = await getPortfolio(userId);
  } catch (err) {
    console.error("Portfolio: DB error, using fallback", err);
  }

  // If no DB data, fall back to in-memory portfolio
  if (dbPortfolio.length === 0) {
    return NextResponse.json({
      positions: getPositions(),
      trades: getTrades(),
      lastTrade: getLastTrade(),
      source: "memory",
    });
  }

  return NextResponse.json({
    positions: dbPortfolio,
    trades: getTrades(),
    lastTrade: getLastTrade(),
    source: "db",
  });
}
