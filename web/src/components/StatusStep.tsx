"use client";

type Status = "pending" | "active" | "done";

export function StatusStep({
  label,
  status,
  detail,
}: {
  label: string;
  status: Status;
  detail?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        padding: "16px 0",
        transition: "opacity 0.3s",
        opacity: status === "pending" ? 0.35 : 1,
      }}
    >
      {/* Indicator — terracotta dot at joint (Law 3) */}
      <div
        style={{
          marginTop: 4,
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {status === "done" && (
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--ink)",
            }}
          />
        )}
        {status === "active" && (
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--orange)",
              animation: "joint-pulse 1.5s ease-in-out infinite",
            }}
          />
        )}
        {status === "pending" && (
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--ink-10)",
            }}
          />
        )}
      </div>

      {/* Label */}
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: status === "active" ? 400 : 300,
            fontSize: 15,
            letterSpacing: "0.01em",
            color: status === "pending" ? "var(--ink-30)" : "var(--ink)",
            lineHeight: 1.5,
          }}
        >
          {label}
        </p>
        {detail && status === "done" && (
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.1em",
              color: "var(--ink-60)",
              marginTop: 4,
            }}
          >
            {detail}
          </p>
        )}
      </div>

      {/* Status tag */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.25em",
          textTransform: "lowercase" as const,
          marginLeft: "auto",
          flexShrink: 0,
        }}
      >
        {status === "done" && <span style={{ color: "var(--ink-30)" }}>done</span>}
        {status === "active" && <span style={{ color: "var(--orange)" }}>live</span>}
        {status === "pending" && <span style={{ color: "var(--ink-10)" }}>next</span>}
      </div>
    </div>
  );
}
