"use client";

const PRICES: Record<string, { price: string; change: string; up: boolean }> = {
  SMCI: { price: "$42.50", change: "3.2%", up: false },
  TSLA: { price: "$285.20", change: "0.8%", up: true },
  NVDA: { price: "$142.80", change: "0.1%", up: false },
  AAPL: { price: "$178.40", change: "1.2%", up: true },
  MSFT: { price: "$420.10", change: "0.5%", up: true },
  GOOG: { price: "$155.60", change: "0.3%", up: false },
  AMZN: { price: "$186.20", change: "1.8%", up: true },
  META: { price: "$505.30", change: "2.1%", up: true },
};

function randomPrice(): { price: string; change: string; up: boolean } {
  const p = (Math.random() * 400 + 20).toFixed(2);
  const c = (Math.random() * 5).toFixed(1);
  const up = Math.random() > 0.5;
  return { price: `$${p}`, change: `${c}%`, up };
}

export function WatchlistCard({
  ticker,
  onRemove,
}: {
  ticker: string;
  onRemove?: () => void;
}) {
  const data = PRICES[ticker] ?? randomPrice();

  return (
    <div
      className="mark-card"
      style={{
        padding: "28px 24px",
        minWidth: 0,
        transition: "background 0.3s",
        position: "relative",
      }}
    >
      {/* Top accent stripe */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: data.up
            ? "var(--ink)"
            : "linear-gradient(to right, var(--orange), var(--ember))",
        }}
      />

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "1px solid var(--ink-10)",
            borderRadius: 3,
            cursor: "pointer",
            color: "var(--ink-30)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            transition: "color 0.2s, border-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--orange)";
            e.currentTarget.style.borderColor = "var(--orange)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--ink-30)";
            e.currentTarget.style.borderColor = "var(--ink-10)";
          }}
          aria-label={`Remove ${ticker}`}
        >
          &times;
        </button>
      )}

      {/* Ticker */}
      <span className="mark-label" style={{ marginBottom: 16, display: "block", fontSize: 13 }}>
        {ticker.toLowerCase()}
      </span>

      {/* Price */}
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 400,
          fontSize: "clamp(26px, 3.5vw, 36px)",
          letterSpacing: "-0.03em",
          lineHeight: 0.95,
          color: "var(--ink)",
          display: "block",
          marginBottom: 12,
        }}
      >
        {data.price}
      </span>

      {/* Change */}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          letterSpacing: "0.06em",
          color: data.up ? "var(--ink-60)" : "var(--orange)",
        }}
      >
        {data.up ? "+" : "−"}{data.change}
      </span>

      {/* Watching indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 16 }}>
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "var(--terra)",
            animation: "joint-pulse 2.5s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "lowercase" as const,
            color: "var(--ink-30)",
          }}
        >
          watching
        </span>
      </div>
    </div>
  );
}
