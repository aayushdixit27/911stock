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
  const [playing, setPlaying] = useState(false);
  const [revealedEvents, setRevealedEvents] = useState(0);
  const hasTriggered = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Use refs so the timer callback always sees fresh state
  const currentDayRef = useRef(currentDay);
  const revealedRef = useRef(revealedEvents);
  const playingRef = useRef(playing);

  currentDayRef.current = currentDay;
  revealedRef.current = revealedEvents;
  playingRef.current = playing;

  const day = timeline[currentDay];
  const totalEvents = day.events.length;

  // Clear any running timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // The core tick — reads from refs to avoid stale closures
  const tick = useCallback(() => {
    const d = currentDayRef.current;
    const r = revealedRef.current;
    const dayData = timeline[d];
    const total = dayData.events.length;

    if (r < total) {
      // Reveal next event
      setRevealedEvents(r + 1);
    } else {
      // All events revealed — move to next day
      const nextDay = d + 1;
      if (nextDay >= timeline.length) {
        setPlaying(false);
        return;
      }
      setCurrentDay(nextDay);
      setRevealedEvents(0);
    }
  }, []);

  // Start/stop the interval when playing changes
  useEffect(() => {
    clearTimer();
    if (playing) {
      timerRef.current = setInterval(tick, 2000);
    }
    return clearTimer;
  }, [playing, tick, clearTimer]);

  // Update prices when day changes
  useEffect(() => {
    const d = timeline[currentDay];
    if (d.prices && onPriceUpdate) {
      onPriceUpdate(d.prices);
    }
  }, [currentDay, onPriceUpdate]);

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

                {/* Headline — link if url exists */}
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
