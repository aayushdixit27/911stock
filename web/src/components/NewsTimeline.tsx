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

  // Update prices when day changes
  useEffect(() => {
    const d = timeline[currentDay];
    if (d.prices && onPriceUpdate) {
      onPriceUpdate(d.prices);
    }
  }, [currentDay, onPriceUpdate]);
  
  // Reset revealed events when day changes while playing
  useEffect(() => {
    if (playing) {
      // Using requestAnimationFrame to avoid synchronous setState warning
      const frame = requestAnimationFrame(() => {
        setRevealedEvents(0);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [currentDay, playing]);

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

      {/* Play/Pause button */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <button
          onClick={playing ? handlePause : handlePlay}
          className="mark-fire"
          style={{
            border: "none",
            color: "var(--white)",
            fontWeight: 600,
            fontSize: "var(--text-xs)",
            letterSpacing: "0.02em",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
          }}
        >
          {playing ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                <rect x="2" y="2" width="3" height="8" rx="1" />
                <rect x="7" y="2" width="3" height="8" rx="1" />
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                <polygon points="2,2 10,6 2,10" />
              </svg>
              {currentDay === 0 && revealedEvents === 0 ? "Play" : "Resume"}
            </>
          )}
        </button>

        <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-30)" }}>
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
                opacity: isVisible ? 1 : 0.12,
                transform: isVisible ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
                pointerEvents: isVisible ? "auto" : "none",
              }}
            >
              <div style={{ padding: "0.875rem 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                  {/* Significance dot */}
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
                  {/* Source */}
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
                  {/* Sentiment badge */}
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

                {/* Headline */}
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
                  {event.headline}
                </p>

                {/* Summary */}
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
