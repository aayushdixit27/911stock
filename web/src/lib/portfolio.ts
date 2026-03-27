import portfolioData from "@/data/portfolio.json";

export type Position = {
  ticker: string;
  companyName: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
};

export type Trade = {
  id: string;
  ticker: string;
  action: "SELL" | "BUY";
  shares: number;
  price: number;
  totalValue: number;
  reason: string;
  approvedVia: string;
  executedAt: string;
  beforeShares: number;
  afterShares: number;
};

// In-memory portfolio state (would be Ghost DB in production)
let positions: Position[] = portfolioData.positions.map((p) => ({ ...p }));
let trades: Trade[] = [];

export function getPositions(): Position[] {
  return positions;
}

export function getPosition(ticker: string): Position | null {
  return positions.find((p) => p.ticker === ticker) ?? null;
}

export function getTrades(): Trade[] {
  return trades;
}

export function getLastTrade(): Trade | null {
  return trades.length > 0 ? trades[trades.length - 1] : null;
}

export function executeTrade(
  ticker: string,
  reductionPct: number,
  reason: string,
  approvedVia: string = "auth0_ciba"
): Trade {
  const position = positions.find((p) => p.ticker === ticker);
  if (!position) throw new Error(`No position found for ${ticker}`);

  const sharesToSell = Math.floor(position.shares * (reductionPct / 100));
  const beforeShares = position.shares;
  const afterShares = position.shares - sharesToSell;
  const totalValue = sharesToSell * position.currentPrice;

  // Execute: update position
  position.shares = afterShares;

  // Log the trade
  const trade: Trade = {
    id: `TRD-${Date.now().toString(36).toUpperCase()}`,
    ticker,
    action: "SELL",
    shares: sharesToSell,
    price: position.currentPrice,
    totalValue,
    reason,
    approvedVia,
    executedAt: new Date().toISOString(),
    beforeShares,
    afterShares,
  };
  trades.push(trade);

  return trade;
}

export function resetPortfolio(): void {
  positions = portfolioData.positions.map((p) => ({ ...p }));
  trades = [];
}
