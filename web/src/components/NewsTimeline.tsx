"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import timelineData from "@/data/news-timeline.json";

type NewsEvent = {
  source: string;
  headline: string;
  summary: string;
  significance: string;
  sentiment: string;
  url?: string;
};

type PriceData = {
  price: number;
  change: number;
  changePct: number;
};

type TimelineDay = {
  date: string;
  label: string;
  prices?: Record<string, PriceData>;
  events: NewsEvent[];
};

const timeline: TimelineDay[] = timelineData.timeline;

const sigColor: Record<string, string> = {
  high: "var(--orange)",
  medium: "var(--terra)",
  low: "var(--ink-30)",
};

export function NewsTimeline({
  onSignalDetected,
  onPriceUpdate,
}: {
  onSignalDetected?: () => void;
  onPriceUpdate?: (prices: Record<string, PriceData>) => void;
}) {
  const [currentDay, setCurrentDay] = useState(0);
  const [revealedEvents, setRevealedEvents] = useState(0);
  const [revealing, setRevealing] = useState(false);
  const hasTriggered = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const revealedRef = useRef(revealedEvents);
  revealedRef.current = revealedEvents;

  const day = timeline[currentDay];
  const totalEvents = day.events.length;
  const allRevealed = revealedEvents >= totalEvents;
  const isLastDay = currentDay >= timeline.length - 1;
  const isMar19 = day.date === "2026-03-19";

  // Clear timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Reveal events one by one within current day
  const startRevealing = useCallback(() => {
    setRevealing(true);
    setRevealedEvents(0);

    timerRef.current = setInterval(() => {
      setRevealedEvents((prev) => {
        const next = prev + 1;
        const total = timeline[currentDay]?.events.length ?? 0;
        if (next >= total) {
          clearTimer();
          setRevealing(false);
          return total;
        }
        return next;
      });
    }, 1500);
  }, [currentDay, clearTimer]);

  // Update prices when day changes
  useEffect(() => {
    const d = timeline[currentDay];
    if (d.prices && onPriceUpdate) {
      onPriceUpdate(d.prices);
    }
  }, [currentDay, onPriceUpdate]);

  // Detect when all Mar 19 events are revealed — fire the call
  useEffect(() => {
    if (
      !hasTriggered.current &&
      isMar19 &&
      allRevealed &&
      onSignalDetected
    ) {
      // Short delay so user sees the last event before call fires
      const t = setTimeout(() => {
        hasTriggered.current = true;
        onSignalDetected();
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [isMar19, allRevealed, onSignalDetected]);

  // Cleanup on unmount
  useEffect(() => clearTimer, [clearTimer]);

  function handleNextDay() {
    clearTimer();
    setRevealing(false);

    if (currentDay === 0 && revealedEvents === 0) {
      // First click — start revealing Mar 18 events
      startRevealing();
      return;
    }

    if (!allRevealed) {
      // Still revealing — skip to all revealed
      clearTimer();
      setRevealedEvents(totalEvents);
      setRevealing(false);
      return;
    }

    // Move to next day and start revealing
    if (!isLastDay) {
      const next = currentDay + 1;
      setCurrentDay(next);
      setRevealedEvents(0);
      // Start revealing after a beat
      setTimeout(() => {
        setRevealing(true);
        let count = 0;
        timerRef.current = setInterval(() => {
          count++;
          const total = timeline[next]?.events.length ?? 0;
          if (count >= total) {
            clearTimer();
            setRevealing(false);
          }
          setRevealedEvents(count);
        }, 1500);
      }, 500);
    }
  }

  function goToDay(idx: number) {
    clearTimer();
    setRevealing(false);
    setCurrentDay(idx);
    setRevealedEvents(timeline[idx].events.length);
  }

  // Button label logic
  let buttonLabel = "Start — Mar 18";
  let buttonIcon = "play";
  if (currentDay === 0 && revealedEvents === 0) {
    buttonLabel = "Start — Mar 18";
    buttonIcon = "play";
  } else if (revealing) {
    buttonLabel = "Skip to end of day";
    buttonIcon = "skip";
  } else if (allRevealed && isMar19 && hasTriggered.current) {
    buttonLabel = "Agent calling...";
    buttonIcon = "phone";
  } else if (allRevealed && !isLastDay) {
    const nextLabel = timeline[currentDay + 1]?.label ?? "Next";
    buttonLabel = `Next Day — ${nextLabel}`;
    buttonIcon = "arrow";
  } else if (allRevealed && isLastDay) {
    buttonLabel = "Timeline complete";
    buttonIcon = "check";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Day selector bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          marginBottom: "1rem",
          background: "var(--ink-08)",
          padding: "2px",
          borderRadius: "6px",
        }}
      >
        {timeline.map((d, i) => {
          const isActive = i === currentDay;
          const isPast = i < currentDay;
          const hasHigh = d.events.some((e) => e.significance === "high");
          return (
            <button
              key={d.date}
              onClick={() => goToDay(i)}
              style={{
                flex: 1,
                padding: "0.5rem 0",
                background: isActive ? "var(--ink)" : isPast ? "var(--paper)" : "var(--white)",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-xs)",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--white)" : isPast ? "var(--ink-50)" : "var(--ink-30)",
                transition: "all 0.2s",
                boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {d.label}
              {hasHigh && isPast && !isActive && (
                <span style={{
                  display: "inline-block",
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "var(--orange)",
                  marginLeft: "0.25rem",
                  verticalAlign: "middle"
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Next Day button — the main control */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={handleNextDay}
          disabled={(allRevealed && isLastDay) || (isMar19 && hasTriggered.current)}
          className={isMar19 && allRevealed && !hasTriggered.current ? "mark-fire" : ""}
          style={{
            width: "100%",
            border: isMar19 && allRevealed ? "none" : "1px solid var(--ink-08)",
            background: isMar19 && allRevealed
              ? undefined // mark-fire handles it
              : revealing
                ? "var(--paper)"
                : "var(--white)",
            color: isMar19 && allRevealed ? "var(--white)" : "var(--ink)",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "var(--text-sm)",
            letterSpacing: "0.02em",
            padding: "0.75rem 1.25rem",
            borderRadius: "6px",
            cursor: (allRevealed && isLastDay) || (isMar19 && hasTriggered.current) ? "default" : "pointer",
            opacity: (allRevealed && isLastDay) || (isMar19 && hasTriggered.current) ? 0.5 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            transition: "all 0.2s",
            position: "relative",
            zIndex: 1,
          }}
        >
          {buttonIcon === "play" && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <polygon points="3,1 12,7 3,13" />
            </svg>
          )}
          {buttonIcon === "arrow" && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 7h8M8 3l4 4-4 4" />
            </svg>
          )}
          {buttonIcon === "skip" && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <polygon points="1,1 7,7 1,13" />
              <polygon points="7,1 13,7 7,13" />
            </svg>
          )}
          {buttonIcon === "phone" && (
            <span className="mark-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
          )}
          {buttonIcon === "check" && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 7l3 3 5-6" />
            </svg>
          )}
          {buttonLabel}
        </button>
      </div>

      {/* Events feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {day.events.map((event, i) => {
          const isVisible = i < revealedEvents;
          return (
            <div
              key={`${currentDay}-${i}`}
              style={{
                opacity: isVisible ? 1 : 0.12,
                transform: isVisible ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
                pointerEvents: isVisible ? "auto" : "none",
              }}
            >
              <div style={{ padding: "0.875rem 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: sigColor[event.significance] || "var(--ink-30)",
                      flexShrink: 0,
                      animation: event.significance === "high" && isVisible
                        ? "joint-pulse 1.5s ease-in-out infinite"
                        : "none",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--text-xs)",
                      fontWeight: 500,
                      color: sigColor[event.significance] || "var(--ink-30)",
                    }}
                  >
                    {event.source}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "var(--text-xs)",
                      fontWeight: 500,
                      color: event.sentiment === "negative" ? "var(--orange)" : "var(--ink-30)",
                      marginLeft: "auto",
                      background: event.sentiment === "negative" ? "rgba(234,76,0,0.08)" : "var(--ink-08)",
                      padding: "0.125rem 0.5rem",
                      borderRadius: "4px",
                    }}
                  >
                    {event.sentiment === "negative" ? "Bearish" : "Neutral"}
                  </span>
                </div>

                <p
                  style={{
                    fontWeight: 600,
                    fontSize: "var(--text-sm)",
                    color: "var(--ink)",
                    lineHeight: 1.5,
                    paddingLeft: "0.75rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  {event.url ? (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "none", borderBottom: "1px solid var(--ink-15)" }}
                    >
                      {event.headline}
                    </a>
                  ) : (
                    event.headline
                  )}
                </p>

                <p
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--ink-50)",
                    lineHeight: 1.6,
                    paddingLeft: "0.75rem",
                  }}
                >
                  {event.summary}
                </p>
              </div>
              {i < day.events.length - 1 && (
                <div style={{ height: "1px", background: "var(--ink-08)" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
