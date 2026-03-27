"use client";

const PRICES: Record<string, { price: string; change: string; up: boolean }> = {
  SMCI: { price: "$42.50", change: "▼ 3.2%", up: false },
  TSLA: { price: "$285.20", change: "▲ 0.8%", up: true },
  NVDA: { price: "$142.80", change: "— 0.1%", up: false },
};

export function WatchlistCard({ ticker }: { ticker: string }) {
  const data = PRICES[ticker] ?? { price: "—", change: "—", up: false };

  return (
    <div className="border border-zinc-800 rounded-lg p-4 flex flex-col gap-2 min-w-[120px]">
      <span className="text-xs text-zinc-500 uppercase tracking-widest">{ticker}</span>
      <span className="text-xl font-bold">{data.price}</span>
      <span className={`text-sm ${data.up ? "text-green-400" : "text-red-400"}`}>
        {data.change}
      </span>
      <span className="text-xs text-zinc-600 mt-1">Watching</span>
    </div>
  );
}
