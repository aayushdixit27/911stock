"use client";

export function PhoneRinging() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        padding: "48px 0",
      }}
    >
      {/* Phone icon — fire field circle (Law 1: field amplifies the mark) */}
      <div style={{ position: "relative" }}>
        {/* Pulse rings */}
        <div
          style={{
            position: "absolute",
            inset: -12,
            borderRadius: "50%",
            border: "2px solid var(--orange)",
            animation: "fire-pulse 2s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: -12,
            borderRadius: "50%",
            border: "2px solid var(--orange)",
            animation: "fire-pulse 2s ease-in-out 0.6s infinite",
            pointerEvents: "none",
          }}
        />
        {/* The mark */}
        <div
          className="mark-fire"
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: "relative", zIndex: 1 }}
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </div>
      </div>

      {/* Label */}
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.25em",
          textTransform: "uppercase" as const,
          color: "var(--orange)",
        }}
      >
        calling your phone
      </span>
    </div>
  );
}
