import { NextRequest, NextResponse } from "next/server";

// Fetch real-time stock quote from Yahoo Finance
export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get("ticker");
  if (!ticker) {
    return NextResponse.json({ error: "ticker param required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1d&interval=1d`,
      { next: { revalidate: 60 } } // cache 60s
    );

    if (!res.ok) throw new Error(`Yahoo API ${res.status}`);

    const data = await res.json();
    const meta = data.chart.result?.[0]?.meta;

    if (!meta) throw new Error("No data");

    return NextResponse.json({
      ticker: meta.symbol,
      price: meta.regularMarketPrice,
      previousClose: meta.chartPreviousClose ?? meta.previousClose,
      change: meta.regularMarketPrice - (meta.chartPreviousClose ?? meta.previousClose),
      changePct:
        ((meta.regularMarketPrice - (meta.chartPreviousClose ?? meta.previousClose)) /
          (meta.chartPreviousClose ?? meta.previousClose)) *
        100,
      currency: meta.currency,
    });
  } catch (err) {
    console.error(`Quote fetch failed for ${ticker}:`, err);
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 });
  }
}
