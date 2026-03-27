"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import timelineData from "@/data/news-timeline.json";

type NewsEvent = {
  source: string;
  headline: string;
  summary: string;
  significance: string;
  sentiment: string;
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
  const [playing, setPlaying] = useState(false);
  const [revealedEvents, setRevealedEvents] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggered = useRef(false);

  const day = timeline[currentDay];
  const totalEvents = day.events.length;

  const advance = useCallback(() => {
    setRevealedEvents((prev) => {
      const next = prev + 1;
      if (next > totalEvents) {
        // Move to next day
        setCurrentDay((d) => {
          const nextDay = d + 1;
          if (nextDay >= timeline.length) {
            setPlaying(false);
            return d;
          }
          return nextDay;
        });
        return 0;
      }
      return next;
    });
  }, [totalEvents]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(advance, 2000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, advance]);

  // Reset revealed events and update prices when day changes
  useEffect(() => {
    if (playing) {
      setRevealedEvents(0);
    }
    const d = timeline[currentDay];
    if (d.prices && onPriceUpdate) {
      onPriceUpdate(d.prices);
    }
  }, [currentDay, playing, onPriceUpdate]);

  // Detect when we hit Mar 19 high-significance events
  useEffect(() => {
    if (
      !hasTriggered.current &&
      day.date === "2026-03-19" &&
      revealedEvents >= 1 &&
      onSignalDetected
    ) {
      hasTriggered.current = true;
      onSignalDetected();
    }
  }, [day, revealedEvents, onSignalDetected]);

  function handlePlay() {
    if (currentDay >= timeline.length - 1 && revealedEvents >= totalEvents) {
      // Reset
      setCurrentDay(0);
      setRevealedEvents(0);
      hasTriggered.current = false;
    }
    setPlaying(true);
  }

  function handlePause() {
    setPlaying(false);
  }

  function goToDay(idx: number) {
    setPlaying(false);
    setCurrentDay(idx);
    setRevealedEvents(timeline[idx].events.length);
    const d = timeline[idx];
    if (d.prices && onPriceUpdate) {
      onPriceUpdate(d.prices);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Day selector bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          marginBottom: 24,
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
                padding: "10px 0",
                background: isActive ? "var(--ink)" : isPast ? "var(--paper)" : "var(--white)",
                border: "none",
                borderBottom: isActive
                  ? "3px solid var(--orange)"
                  : hasHigh && isPast
                    ? "3px solid var(--orange)"
                    : "1px solid var(--ink-10)",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.15em",
                color: isActive ? "var(--white)" : isPast ? "var(--ink-60)" : "var(--ink-30)",
                transition: "all 0.3s",
              }}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Play/Pause button */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button
          onClick={playing ? handlePause : handlePlay}
          className="mark-fire"
          style={{
            border: "none",
            color: "var(--white)",
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.15em",
            textTransform: "uppercase" as const,
            padding: "12px 28px",
            borderRadius: 3,
            cursor: "pointer",
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {playing ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                <rect x="1" y="1" width="3.5" height="10" rx="1" />
                <rect x="7.5" y="1" width="3.5" height="10" rx="1" />
              </svg>
              pause
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                <polygon points="2,1 11,6 2,11" />
              </svg>
              {currentDay === 0 && revealedEvents === 0 ? "play timeline" : "resume"}
            </>
          )}
        </button>

        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--ink-30)",
          }}
        >
          {day.label} — {revealedEvents}/{totalEvents} events
        </span>
      </div>

      {/* Events feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {day.events.map((event, i) => {
          const isVisible = i < revealedEvents;
          return (
            <div
              key={i}
              style={{
                opacity: isVisible ? 1 : 0.15,
                transform: isVisible ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
                pointerEvents: isVisible ? "auto" : "none",
              }}
            >
              <div style={{ padding: "16px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  {/* Significance dot */}
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: sigColor[event.significance] || "var(--ink-30)",
                      flexShrink: 0,
                      animation: event.significance === "high" && isVisible
                        ? "joint-pulse 1.5s ease-in-out infinite"
                        : "none",
                    }}
                  />
                  {/* Source */}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      letterSpacing: "0.15em",
                      color: sigColor[event.significance] || "var(--ink-30)",
                      textTransform: "uppercase" as const,
                    }}
                  >
                    {event.source}
                  </span>
                  {/* Sentiment badge */}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase" as const,
                      color: event.sentiment === "negative" ? "var(--orange)" : "var(--ink-30)",
                      marginLeft: "auto",
                      border: `1px solid ${event.sentiment === "negative" ? "var(--orange)" : "var(--ink-10)"}`,
                      padding: "2px 8px",
                      borderRadius: 2,
                    }}
                  >
                    {event.sentiment === "negative" ? "bearish" : "neutral"}
                  </span>
                </div>

                {/* Headline */}
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    fontSize: 15,
                    color: "var(--ink)",
                    lineHeight: 1.5,
                    paddingLeft: 18,
                    marginBottom: 6,
                  }}
                >
                  {event.headline}
                </p>

                {/* Summary */}
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    fontSize: 13,
                    color: "var(--ink-60)",
                    lineHeight: 1.7,
                    paddingLeft: 18,
                  }}
                >
                  {event.summary}
                </p>
              </div>
              {i < day.events.length - 1 && (
                <div style={{ height: 1, background: "var(--ink-10)" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
