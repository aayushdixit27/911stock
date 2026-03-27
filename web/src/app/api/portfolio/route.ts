import { NextResponse } from "next/server";
import { getPositions, getTrades, getLastTrade } from "@/lib/portfolio";

export async function GET() {
  return NextResponse.json({
    positions: getPositions(),
    trades: getTrades(),
    lastTrade: getLastTrade(),
  });
}
