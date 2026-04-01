"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email?: string | null;
  name?: string | null;
}

interface UserSettings {
  riskTolerance: string;
  notifyInApp: boolean;
  notifyEmail: boolean;
  notifyPhone: boolean;
}

const POPULAR_TICKERS = [
  { ticker: "AAPL", name: "Apple Inc." },
  { ticker: "MSFT", name: "Microsoft Corp." },
  { ticker: "GOOGL", name: "Alphabet Inc." },
  { ticker: "AMZN", name: "Amazon.com Inc." },
  { ticker: "TSLA", name: "Tesla Inc." },
  { ticker: "NVDA", name: "NVIDIA Corp." },
  { ticker: "META", name: "Meta Platforms" },
  { ticker: "JPM", name: "JPMorgan Chase" },
  { ticker: "V", name: "Visa Inc." },
  { ticker: "JNJ", name: "Johnson & Johnson" },
  { ticker: "WMT", name: "Walmart Inc." },
  { ticker: "PG", name: "Procter & Gamble" },
];

const RISK_LEVELS = [
  {
    value: "conservative",
    label: "Conservative",
    description: "Only high-confidence signals. Lower false positives, may miss some opportunities.",
    icon: "🛡️",
  },
  {
    value: "moderate",
    label: "Moderate",
    description: "Balanced approach. Medium-confidence signals included. Good for most investors.",
    icon: "⚖️",
  },
  {
    value: "aggressive",
    label: "Aggressive",
    description: "All signals, even speculative ones. More alerts, higher chance of early action.",
    icon: "🚀",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Tickers
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [customTicker, setCustomTicker] = useState("");
  const [tickerError, setTickerError] = useState<string | null>(null);

  // Step 2: Notifications
  const [settings, setSettings] = useState<UserSettings>({
    riskTolerance: "moderate",
    notifyInApp: true,
    notifyEmail: false,
    notifyPhone: false,
  });
  const [tier, setTier] = useState<string>("free");

  // Step 3: Risk Tolerance
  const [riskTolerance, setRiskTolerance] = useState("moderate");

  useEffect(() => {
    // Check if user is authenticated and not already onboarded
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          // Not authenticated, redirect to login
          router.push("/auth/login");
          return;
        }
        setUser(data.user);

        // Check onboarding status
        fetch("/api/user/settings")
          .then((res) => res.json())
          .then((settingsData) => {
            if (settingsData.onboardingCompleted) {
              // Already onboarded, redirect to home
              router.push("/");
              return;
            }
            setTier(settingsData.tier || "free");
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
          });
      })
      .catch(() => {
        router.push("/auth/login");
      });
  }, [router]);

  function toggleTicker(ticker: string) {
    setSelectedTickers((prev) => {
      if (prev.includes(ticker)) {
        return prev.filter((t) => t !== ticker);
      }
      if (prev.length >= 10) {
        setTickerError("Maximum 10 tickers allowed");
        return prev;
      }
      setTickerError(null);
      return [...prev, ticker];
    });
  }

  function addCustomTicker() {
    const t = customTicker.trim().toUpperCase();
    if (!t) return;

    if (!/^[A-Z]{1,5}$/.test(t)) {
      setTickerError("Invalid ticker format. Must be 1-5 uppercase letters.");
      return;
    }

    if (selectedTickers.includes(t)) {
      setTickerError("Ticker already selected");
      return;
    }

    if (selectedTickers.length >= 10) {
      setTickerError("Maximum 10 tickers allowed");
      return;
    }

    setSelectedTickers([...selectedTickers, t]);
    setCustomTicker("");
    setTickerError(null);
  }

  function removeTicker(ticker: string) {
    setSelectedTickers(selectedTickers.filter((t) => t !== ticker));
    setTickerError(null);
  }

  async function saveTickers() {
    if (selectedTickers.length === 0) {
      setTickerError("Please select at least one ticker");
      return;
    }

    setSaving(true);
    try {
      // Add all selected tickers to watchlist
      for (const ticker of selectedTickers) {
        await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker }),
        });
      }
      setStep(2);
    } catch (err) {
      setError("Failed to save tickers. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function saveNotifications() {
    setSaving(true);
    try {
      await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notifyInApp: settings.notifyInApp,
          notifyEmail: settings.notifyEmail,
          notifyPhone: settings.notifyPhone,
        }),
      });
      setStep(3);
    } catch (err) {
      setError("Failed to save notification settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function completeOnboarding() {
    setSaving(true);
    try {
      // Save risk tolerance
      await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riskTolerance,
        }),
      });

      // Mark onboarding as complete
      await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });

      // Redirect to home
      router.push("/");
    } catch (err) {
      setError("Failed to complete onboarding. Please try again.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--white)]">
        <div className="text-center">
          <div className="mark-spinner border-[var(--ink-30)] border-t-[var(--orange)] w-8 h-8 mb-4" />
          <p className="text-[var(--ink-50)]">Loading...</p>
        </div>
      </main>
    );
  }

  const progressPercent = ((step - 1) / 3) * 100;

  return (
    <main className="min-h-screen bg-[var(--white)]">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[var(--ink-08)]">
        <div
          className="h-full bg-[var(--orange)] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Logo */}
        <div className="text-center mb-8">
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.5rem",
              fontStyle: "italic",
              color: "var(--orange)",
            }}
          >
            911stock
          </span>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                s === step
                  ? "bg-[var(--orange)] text-white"
                  : s < step
                  ? "bg-[var(--terra)] text-white"
                  : "bg-[var(--ink-08)] text-[var(--ink-50)]"
              }`}
            >
              {s < step ? "✓" : s}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Add Tickers */}
        {step === 1 && (
          <div className="mark-card p-8">
            <h1 className="mark-display text-2xl mb-2">Add your first tickers</h1>
            <p className="text-[var(--ink-50)] mb-6">
              Select 3-5 stocks you&apos;re tracking. You can add more later.
            </p>

            {/* Selected tickers */}
            {selectedTickers.length > 0 && (
              <div className="mb-6">
                <div className="text-sm text-[var(--ink-50)] mb-2">
                  Selected ({selectedTickers.length}/10):
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTickers.map((ticker) => (
                    <button
                      key={ticker}
                      onClick={() => removeTicker(ticker)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--orange-lt)] text-[var(--ink)] rounded-full text-sm font-medium hover:bg-[var(--orange)] hover:text-white transition-colors"
                    >
                      {ticker}
                      <span className="text-xs">×</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular tickers grid */}
            <div className="mb-6">
              <div className="text-sm text-[var(--ink-50)] mb-3">Popular tickers:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {POPULAR_TICKERS.map(({ ticker, name }) => {
                  const isSelected = selectedTickers.includes(ticker);
                  return (
                    <button
                      key={ticker}
                      onClick={() => toggleTicker(ticker)}
                      disabled={isSelected}
                      className={`p-3 rounded-md border text-left transition-all ${
                        isSelected
                          ? "border-[var(--orange)] bg-[var(--orange-lt)] opacity-50"
                          : "border-[var(--ink-08)] hover:border-[var(--terra)] hover:bg-[var(--paper)]"
                      }`}
                    >
                      <div className="font-medium text-[var(--ink)]">{ticker}</div>
                      <div className="text-xs text-[var(--ink-50)]">{name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom ticker input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={customTicker}
                onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && addCustomTicker()}
                placeholder="Add ticker (e.g., SMCI)"
                className="flex-1 px-3 py-2 border border-[var(--ink-08)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--terra)] focus:border-transparent uppercase"
              />
              <button
                onClick={addCustomTicker}
                className="px-4 py-2 bg-[var(--ink)] text-white rounded-md font-medium hover:bg-[var(--ink-70)] transition-colors"
              >
                Add
              </button>
            </div>

            {tickerError && (
              <p className="text-[var(--orange)] text-sm mb-4">{tickerError}</p>
            )}

            <button
              onClick={saveTickers}
              disabled={selectedTickers.length === 0 || saving}
              className="w-full mark-fire text-white px-4 py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="mark-spinner border-white/25 border-t-white" />
              ) : (
                `Continue with ${selectedTickers.length} ticker${selectedTickers.length !== 1 ? "s" : ""}`
              )}
            </button>
          </div>
        )}

        {/* Step 2: Notification Preferences */}
        {step === 2 && (
          <div className="mark-card p-8">
            <h1 className="mark-display text-2xl mb-2">Set notification preferences</h1>
            <p className="text-[var(--ink-50)] mb-6">
              Choose how you want to be alerted when important signals are detected.
            </p>

            <div className="space-y-4 mb-6">
              {/* In-app notifications */}
              <div className="flex items-center justify-between p-4 border border-[var(--ink-08)] rounded-md">
                <div>
                  <div className="font-medium text-[var(--ink)]">In-app notifications</div>
                  <div className="text-sm text-[var(--ink-50)]">See alerts when you&apos;re using the app</div>
                </div>
                <button
                  onClick={() => setSettings((s) => ({ ...s, notifyInApp: !s.notifyInApp }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.notifyInApp ? "bg-[var(--orange)]" : "bg-[var(--ink-30)]"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.notifyInApp ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Email notifications */}
              <div className="flex items-center justify-between p-4 border border-[var(--ink-08)] rounded-md">
                <div>
                  <div className="font-medium text-[var(--ink)]">Email notifications</div>
                  <div className="text-sm text-[var(--ink-50)]">Get alerts sent to your inbox</div>
                </div>
                <button
                  onClick={() => setSettings((s) => ({ ...s, notifyEmail: !s.notifyEmail }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.notifyEmail ? "bg-[var(--orange)]" : "bg-[var(--ink-30)]"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.notifyEmail ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Phone notifications */}
              <div className="flex items-center justify-between p-4 border border-[var(--ink-08)] rounded-md">
                <div className="flex items-center gap-2">
                  <div>
                    <div className="font-medium text-[var(--ink)] flex items-center gap-2">
                      Phone call alerts
                      {tier !== "premium" && (
                        <span className="px-2 py-0.5 bg-[var(--orange)] text-white text-xs rounded-full">
                          Premium
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-[var(--ink-50)]">
                      {tier === "premium"
                        ? "Receive AI-powered phone calls for high-priority signals"
                        : "Upgrade to Premium for phone call alerts"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (tier === "premium") {
                      setSettings((s) => ({ ...s, notifyPhone: !s.notifyPhone }));
                    }
                  }}
                  disabled={tier !== "premium"}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.notifyPhone && tier === "premium"
                      ? "bg-[var(--orange)]"
                      : "bg-[var(--ink-30)]"
                  } ${tier !== "premium" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.notifyPhone && tier === "premium" ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-3 border border-[var(--ink-08)] rounded-md font-medium text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
              >
                Back
              </button>
              <button
                onClick={saveNotifications}
                disabled={saving}
                className="flex-1 mark-fire text-white px-4 py-3 rounded-md font-medium disabled:opacity-50"
              >
                {saving ? (
                  <span className="mark-spinner border-white/25 border-t-white" />
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Risk Tolerance */}
        {step === 3 && (
          <div className="mark-card p-8">
            <h1 className="mark-display text-2xl mb-2">Set your risk tolerance</h1>
            <p className="text-[var(--ink-50)] mb-6">
              This affects how we score and filter signals for your portfolio.
            </p>

            <div className="space-y-3 mb-6">
              {RISK_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setRiskTolerance(level.value)}
                  className={`w-full p-4 border rounded-md text-left transition-all ${
                    riskTolerance === level.value
                      ? "border-[var(--orange)] bg-[var(--orange-lt)]"
                      : "border-[var(--ink-08)] hover:border-[var(--terra)] hover:bg-[var(--paper)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{level.icon}</span>
                    <div>
                      <div className="font-medium text-[var(--ink)]">{level.label}</div>
                      <div className="text-sm text-[var(--ink-50)]">{level.description}</div>
                    </div>
                    {riskTolerance === level.value && (
                      <span className="ml-auto text-[var(--orange)]">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-3 border border-[var(--ink-08)] rounded-md font-medium text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
              >
                Back
              </button>
              <button
                onClick={completeOnboarding}
                disabled={saving}
                className="flex-1 mark-fire text-white px-4 py-3 rounded-md font-medium disabled:opacity-50"
              >
                {saving ? (
                  <span className="mark-spinner border-white/25 border-t-white" />
                ) : (
                  "Complete Setup"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
