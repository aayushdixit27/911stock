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
  const [started, setStarted] = useState(false);
  const hasTriggered = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const day = timeline[currentDay];
  const totalEvents = day.events.length;
  const allRevealed = revealedEvents >= totalEvents;
  const isLastDay = currentDay >= timeline.length - 1;
  const isMar19 = day.date === "2026-03-19";

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // Cleanup
  useEffect(() => () => stopTimer(), []);

  // Update prices when day changes
  useEffect(() => {
    const d = timeline[currentDay];
    if (d.prices && onPriceUpdate) {
      onPriceUpdate(d.prices);
    }
  }, [currentDay, onPriceUpdate]);

  // Fire signal when all Mar 19 events revealed
  useEffect(() => {
    if (!hasTriggered.current && isMar19 && allRevealed && !revealing && onSignalDetected) {
      const t = setTimeout(() => {
        hasTriggered.current = true;
        onSignalDetected();
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [isMar19, allRevealed, revealing, onSignalDetected]);

  function revealEventsForDay(dayIndex: number) {
    stopTimer();
    const events = timeline[dayIndex].events;
    let count = 0;
    setRevealedEvents(0);
    setRevealing(true);

    timerRef.current = setInterval(() => {
      count++;
      setRevealedEvents(count);
      if (count >= events.length) {
        stopTimer();
        setRevealing(false);
      }
    }, 1500);
  }

  function handleButton() {
    if (!started) {
      // First click — start Mar 18
      setStarted(true);
      revealEventsForDay(0);
      return;
    }

    if (revealing) {
      // Skip to end of current day
      stopTimer();
      setRevealedEvents(totalEvents);
      setRevealing(false);
      return;
    }

    if (allRevealed && !isLastDay) {
      // Advance to next day
      const next = currentDay + 1;
      setCurrentDay(next);
      setTimeout(() => revealEventsForDay(next), 300);
    }
  }

  function goToDay(idx: number) {
    stopTimer();
    setRevealing(false);
    setStarted(true);
    setCurrentDay(idx);
    setRevealedEvents(timeline[idx].events.length);
  }

  // Button label
  let buttonLabel: string;
  let buttonIcon: string;
  const triggered = isMar19 && hasTriggered.current;

  if (!started) {
    buttonLabel = "Start — Mar 18";
    buttonIcon = "play";
  } else if (revealing) {
    buttonLabel = "Skip to end";
    buttonIcon = "skip";
  } else if (triggered) {
    buttonLabel = "Agent calling...";
    buttonIcon = "phone";
  } else if (allRevealed && !isLastDay) {
    buttonLabel = `Next Day — ${timeline[currentDay + 1]?.label}`;
    buttonIcon = "arrow";
  } else if (allRevealed && isLastDay) {
    buttonLabel = "Timeline complete";
    buttonIcon = "check";
  } else {
    buttonLabel = "Next";
    buttonIcon = "arrow";
  }

  const isFireButton = isMar19 && allRevealed && !triggered;
  const isDisabled = (allRevealed && isLastDay) || triggered;

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
                <span style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: "var(--orange)", marginLeft: "0.25rem", verticalAlign: "middle" }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Main button */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={handleButton}
          disabled={isDisabled}
          className={isFireButton ? "mark-fire" : ""}
          style={{
            width: "100%",
            border: isFireButton ? "none" : "1px solid var(--ink-08)",
            background: isFireButton ? undefined : revealing ? "var(--paper)" : "var(--white)",
            color: isFireButton ? "var(--white)" : "var(--ink)",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "var(--text-sm)",
            padding: "0.75rem 1.25rem",
            borderRadius: "6px",
            cursor: isDisabled ? "default" : "pointer",
            opacity: isDisabled ? 0.5 : 1,
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
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><polygon points="3,1 12,7 3,13" /></svg>
          )}
          {buttonIcon === "arrow" && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 7h8M8 3l4 4-4 4" /></svg>
          )}
          {buttonIcon === "skip" && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><polygon points="1,1 7,7 1,13" /><polygon points="7,1 13,7 7,13" /></svg>
          )}
          {buttonIcon === "phone" && (
            <span className="mark-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
          )}
          {buttonIcon === "check" && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 7l3 3 5-6" /></svg>
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
                      width: 6, height: 6, borderRadius: "50%",
                      background: sigColor[event.significance] || "var(--ink-30)",
                      flexShrink: 0,
                      animation: event.significance === "high" && isVisible ? "joint-pulse 1.5s ease-in-out infinite" : "none",
                    }}
                  />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", fontWeight: 500, color: sigColor[event.significance] || "var(--ink-30)" }}>
                    {event.source}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", fontWeight: 500,
                      color: event.sentiment === "negative" ? "var(--orange)" : "var(--ink-30)",
                      marginLeft: "auto",
                      background: event.sentiment === "negative" ? "rgba(234,76,0,0.08)" : "var(--ink-08)",
                      padding: "0.125rem 0.5rem", borderRadius: "4px",
                    }}
                  >
                    {event.sentiment === "negative" ? "Bearish" : "Neutral"}
                  </span>
                </div>
                <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--ink)", lineHeight: 1.5, paddingLeft: "0.75rem", marginBottom: "0.25rem" }}>
                  {event.url ? (
                    <a href={event.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none", borderBottom: "1px solid var(--ink-15)" }}>
                      {event.headline}
                    </a>
                  ) : event.headline}
                </p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--ink-50)", lineHeight: 1.6, paddingLeft: "0.75rem" }}>
                  {event.summary}
                </p>
              </div>
              {i < day.events.length - 1 && <div style={{ height: "1px", background: "var(--ink-08)" }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
