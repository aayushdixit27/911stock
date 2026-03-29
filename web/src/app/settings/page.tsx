"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Nav from "@/components/Nav";
import { GuardianEnroll } from "@/components/GuardianEnroll";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface AlpacaStatus {
  tier: string;
  isPremium: boolean;
  alpacaConnected: boolean;
  connectedAt: string | null;
}

interface BillingStatus {
  tier: string;
  isPremium: boolean;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
}

interface UserSettings {
  riskTolerance: string;
  notifyInApp: boolean;
  notifyEmail: boolean;
  notifyPhone: boolean;
}

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

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Settings state
  const [settings, setSettings] = useState<UserSettings>({
    riskTolerance: "moderate",
    notifyInApp: true,
    notifyEmail: false,
    notifyPhone: false,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  
  // Alpaca state
  const [alpacaStatus, setAlpacaStatus] = useState<AlpacaStatus | null>(null);
  const [alpacaLoading, setAlpacaLoading] = useState(false);
  const [alpacaError, setAlpacaError] = useState<string | null>(null);
  const [alpacaSuccess, setAlpacaSuccess] = useState<string | null>(null);
  
  // Billing state
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingSuccess, setBillingSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the current user session
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Fetch all settings when user is loaded
  useEffect(() => {
    if (user) {
      fetchAlpacaStatus();
      fetchBillingStatus();
      fetchUserSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Check for callback messages
  useEffect(() => {
    const url = new URL(window.location.href);
    const alpacaStatus = url.searchParams.get("alpaca");
    const alpacaError = url.searchParams.get("alpaca_error");
    const checkoutStatus = url.searchParams.get("checkout");
    
    if (alpacaStatus === "connected") {
      setAlpacaSuccess("Alpaca account connected successfully!");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (alpacaError) {
      const errorMessages: Record<string, string> = {
        access_denied: "You denied access to your Alpaca account.",
        denied: "You denied access to your Alpaca account.",
        invalid_state: "Security validation failed. Please try again.",
        no_code: "Authorization code not received. Please try again.",
        token_exchange: "Failed to exchange authorization code. Please try again.",
        server_config: "Server configuration error. Please contact support.",
        server_error: "An unexpected error occurred. Please try again.",
      };
      setAlpacaError(errorMessages[alpacaError] || `Connection failed: ${alpacaError}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
    
    if (checkoutStatus === "success") {
      setBillingSuccess("Welcome to Premium! Your subscription is now active.");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (checkoutStatus === "canceled") {
      setBillingError("Checkout was canceled. You can upgrade anytime.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const fetchUserSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/user/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          riskTolerance: data.riskTolerance || "moderate",
          notifyInApp: data.notifyInApp ?? true,
          notifyEmail: data.notifyEmail ?? false,
          notifyPhone: data.notifyPhone ?? false,
        });
      }
    } catch (err) {
      console.error("Failed to fetch user settings:", err);
    }
  }, []);

  const fetchAlpacaStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/alpaca/status");
      if (res.ok) {
        const data = await res.json();
        setAlpacaStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch Alpaca status:", err);
    }
  }, []);

  const fetchBillingStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/user/settings");
      if (res.ok) {
        const data = await res.json();
        setBillingStatus({
          tier: data.tier || "free",
          isPremium: data.tier === "premium",
          subscriptionStatus: data.stripeSubscriptionStatus,
          currentPeriodEnd: data.stripeCurrentPeriodEnd,
        });
      }
    } catch (err) {
      console.error("Failed to fetch billing status:", err);
    }
  }, []);

  async function saveSettings(updates: Partial<UserSettings>) {
    setSettingsLoading(true);
    setSettingsSaved(false);
    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          ...updates,
        }),
      });
      if (res.ok) {
        setSettings((prev) => ({ ...prev, ...updates }));
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleLogout() {
    await signOut({ callbackUrl: "/" });
  }

  async function connectAlpaca() {
    setAlpacaLoading(true);
    setAlpacaError(null);
    setAlpacaSuccess(null);
    window.location.href = "/api/alpaca/auth";
  }

  async function disconnectAlpaca() {
    setAlpacaLoading(true);
    setAlpacaError(null);
    setAlpacaSuccess(null);
    
    try {
      const res = await fetch("/api/alpaca/disconnect", { method: "POST" });
      if (res.ok) {
        setAlpacaSuccess("Alpaca account disconnected successfully.");
        await fetchAlpacaStatus();
      } else {
        const data = await res.json();
        setAlpacaError(data.error || "Failed to disconnect Alpaca account.");
      }
    } catch (_err) {
      setAlpacaError("Failed to disconnect. Please try again.");
    } finally {
      setAlpacaLoading(false);
    }
  }

  async function upgradeToPremium() {
    setBillingLoading(true);
    setBillingError(null);
    setBillingSuccess(null);
    
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setBillingError(data.error || data.message || "Failed to start checkout.");
        setBillingLoading(false);
      }
    } catch (_err) {
      setBillingError("Failed to start checkout. Please try again.");
      setBillingLoading(false);
    }
  }

  async function manageSubscription() {
    setBillingLoading(true);
    setBillingError(null);
    
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setBillingError(data.error || data.message || "Failed to open portal.");
        setBillingLoading(false);
      }
    } catch (_err) {
      setBillingError("Failed to open portal. Please try again.");
      setBillingLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--white)" }}>
      {user && <Nav user={user} />}

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "5rem 5vw 5rem" }}>
        <div className="mark-eyebrow" style={{ marginBottom: "1.5rem" }}>
          Settings
        </div>

        {/* Profile Section */}
        <div className="mark-card" style={{ padding: "1.5rem", overflow: "hidden", marginBottom: "1.5rem" }}>
          <div style={{ height: "3px", background: "linear-gradient(to right, var(--orange), var(--ember))", margin: "-1.5rem -1.5rem 1.5rem" }} />
          <div className="mark-eyebrow" style={{ marginBottom: "1rem" }}>Profile</div>
          
          {loading ? (
            <p className="text-[var(--ink-50)] text-sm">Loading...</p>
          ) : user ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--orange)] flex items-center justify-center text-white font-semibold">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <div className="font-medium text-[var(--ink)]">{user.name || user.email?.split("@")[0]}</div>
                  <div className="text-sm text-[var(--ink-50)]">{user.email}</div>
                </div>
              </div>
            </>
          ) : (
            <Link href="/auth/login" className="text-[var(--terra)] hover:text-[var(--orange)]">Sign in</Link>
          )}
        </div>

        {/* Notifications Section */}
        <div className="mark-card" style={{ padding: "1.5rem", overflow: "hidden", marginBottom: "1.5rem" }}>
          <div style={{ height: "3px", background: "linear-gradient(to right, var(--orange), var(--ember))", margin: "-1.5rem -1.5rem 1.5rem" }} />
          <div className="mark-eyebrow" style={{ marginBottom: "1rem" }}>Notifications</div>
          
          {loading ? (
            <p className="text-[var(--ink-50)] text-sm">Loading...</p>
          ) : user ? (
            <>
              <div className="space-y-4">
                {/* In-app */}
                <div className="flex items-center justify-between p-3 border border-[var(--ink-08)] rounded-md">
                  <div>
                    <div className="font-medium text-[var(--ink)] text-sm">In-app notifications</div>
                    <div className="text-xs text-[var(--ink-50)]">See alerts when you&apos;re using the app</div>
                  </div>
                  <button
                    onClick={() => saveSettings({ notifyInApp: !settings.notifyInApp })}
                    disabled={settingsLoading}
                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.notifyInApp ? "bg-[var(--orange)]" : "bg-[var(--ink-30)]"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.notifyInApp ? "translate-x-7" : "translate-x-1"}`} />
                  </button>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between p-3 border border-[var(--ink-08)] rounded-md">
                  <div>
                    <div className="font-medium text-[var(--ink)] text-sm">Email notifications</div>
                    <div className="text-xs text-[var(--ink-50)]">Get alerts sent to your inbox</div>
                  </div>
                  <button
                    onClick={() => saveSettings({ notifyEmail: !settings.notifyEmail })}
                    disabled={settingsLoading}
                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.notifyEmail ? "bg-[var(--orange)]" : "bg-[var(--ink-30)]"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.notifyEmail ? "translate-x-7" : "translate-x-1"}`} />
                  </button>
                </div>

                {/* Phone */}
                <div className="flex items-center justify-between p-3 border border-[var(--ink-08)] rounded-md">
                  <div>
                    <div className="font-medium text-[var(--ink)] text-sm flex items-center gap-2">
                      Phone call alerts
                      {billingStatus?.isPremium === false && (
                        <span className="px-2 py-0.5 bg-[var(--orange)] text-white text-xs rounded-full">Premium</span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--ink-50)]">
                      {billingStatus?.isPremium 
                        ? "Receive AI-powered phone calls for high-priority signals"
                        : "Upgrade to Premium for phone call alerts"}
                    </div>
                  </div>
                  <button
                    onClick={() => billingStatus?.isPremium && saveSettings({ notifyPhone: !settings.notifyPhone })}
                    disabled={settingsLoading || !billingStatus?.isPremium}
                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.notifyPhone && billingStatus?.isPremium ? "bg-[var(--orange)]" : "bg-[var(--ink-30)]"} ${!billingStatus?.isPremium ? "opacity-50" : ""}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.notifyPhone && billingStatus?.isPremium ? "translate-x-7" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>

              {settingsSaved && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
                  Settings saved successfully!
                </div>
              )}
            </>
          ) : (
            <Link href="/auth/login" className="text-[var(--terra)] hover:text-[var(--orange)]">Sign in</Link>
          )}
        </div>

        {/* Risk Tolerance Section */}
        <div className="mark-card" style={{ padding: "1.5rem", overflow: "hidden", marginBottom: "1.5rem" }}>
          <div style={{ height: "3px", background: "linear-gradient(to right, var(--orange), var(--ember))", margin: "-1.5rem -1.5rem 1.5rem" }} />
          <div className="mark-eyebrow" style={{ marginBottom: "1rem" }}>Risk Tolerance</div>
          
          {loading ? (
            <p className="text-[var(--ink-50)] text-sm">Loading...</p>
          ) : user ? (
            <>
              <p className="text-sm text-[var(--ink-50)] mb-4">
                This affects how we score and filter signals for your portfolio.
              </p>

              <div className="space-y-3">
                {RISK_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => saveSettings({ riskTolerance: level.value })}
                    disabled={settingsLoading}
                    className={`w-full p-4 border rounded-md text-left transition-all ${
                      settings.riskTolerance === level.value
                        ? "border-[var(--orange)] bg-[var(--orange-lt)]"
                        : "border-[var(--ink-08)] hover:border-[var(--terra)] hover:bg-[var(--paper)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{level.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-[var(--ink)]">{level.label}</div>
                        <div className="text-xs text-[var(--ink-50)]">{level.description}</div>
                      </div>
                      {settings.riskTolerance === level.value && (
                        <span className="text-[var(--orange)]">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <Link href="/auth/login" className="text-[var(--terra)] hover:text-[var(--orange)]">Sign in</Link>
          )}
        </div>

        {/* Billing Section */}
        <div className="mark-card" style={{ padding: "1.5rem", overflow: "hidden", marginBottom: "1.5rem" }}>
          <div style={{ height: "3px", background: "linear-gradient(to right, var(--orange), var(--ember))", margin: "-1.5rem -1.5rem 1.5rem" }} />
          <div className="mark-eyebrow" style={{ marginBottom: "1rem" }}>Plan & Billing</div>
          
          {billingError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {billingError}
            </div>
          )}
          {billingSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
              {billingSuccess}
            </div>
          )}
          
          {loading ? (
            <p className="text-[var(--ink-50)] text-sm">Loading...</p>
          ) : user ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-[var(--ink-50)]">Current Plan</span>
                <span className={`font-semibold text-sm ${billingStatus?.isPremium ? "text-green-600" : "text-[var(--ink)]"}`}>
                  {billingStatus?.isPremium ? "Premium" : "Free"}
                </span>
              </div>
              
              {billingStatus?.isPremium && billingStatus.currentPeriodEnd && (
                <p className="text-xs text-[var(--ink-50)] mb-4">
                  Renews on {new Date(billingStatus.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}

              {billingStatus?.isPremium ? (
                <button
                  onClick={manageSubscription}
                  disabled={billingLoading}
                  className="w-full py-2.5 border border-[var(--ink-08)] rounded-md text-sm font-semibold uppercase tracking-wider hover:bg-[var(--paper)] transition-colors disabled:opacity-50"
                >
                  {billingLoading ? "Loading..." : "Manage Subscription"}
                </button>
              ) : (
                <button
                  onClick={upgradeToPremium}
                  disabled={billingLoading}
                  className="w-full py-2.5 bg-[var(--orange)] text-white rounded-md text-sm font-semibold uppercase tracking-wider hover:bg-[var(--orange-dk)] transition-colors disabled:opacity-50"
                >
                  {billingLoading ? "Loading..." : "Upgrade to Premium"}
                </button>
              )}
            </>
          ) : (
            <Link href="/auth/login" className="text-[var(--terra)] hover:text-[var(--orange)]">Sign in</Link>
          )}
        </div>

        {/* Alpaca Section */}
        <div className="mark-card" style={{ padding: "1.5rem", overflow: "hidden", marginBottom: "1.5rem" }}>
          <div style={{ height: "3px", background: "linear-gradient(to right, var(--orange), var(--ember))", margin: "-1.5rem -1.5rem 1.5rem" }} />
          <div className="mark-eyebrow" style={{ marginBottom: "1rem" }}>Alpaca Trading</div>
          
          {alpacaError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {alpacaError}
            </div>
          )}
          {alpacaSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
              {alpacaSuccess}
            </div>
          )}
          
          {loading ? (
            <p className="text-[var(--ink-50)] text-sm">Loading...</p>
          ) : user ? (
            <>
              {alpacaStatus?.isPremium ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2 h-2 rounded-full ${alpacaStatus.alpacaConnected ? "bg-green-500" : "bg-[var(--ink-30)]"}`} />
                    <span className="text-sm text-[var(--ink)]">
                      {alpacaStatus.alpacaConnected ? "Connected" : "Not connected"}
                    </span>
                  </div>
                  
                  {alpacaStatus.alpacaConnected ? (
                    <button
                      onClick={disconnectAlpaca}
                      disabled={alpacaLoading}
                      className="w-full py-2.5 bg-red-600 text-white rounded-md text-sm font-semibold uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {alpacaLoading ? "Disconnecting..." : "Disconnect Alpaca"}
                    </button>
                  ) : (
                    <button
                      onClick={connectAlpaca}
                      disabled={alpacaLoading}
                      className="w-full py-2.5 bg-[var(--orange)] text-white rounded-md text-sm font-semibold uppercase tracking-wider hover:bg-[var(--orange-dk)] transition-colors disabled:opacity-50"
                    >
                      {alpacaLoading ? "Connecting..." : "Connect Alpaca Account"}
                    </button>
                  )}
                </>
              ) : (
                <div className="p-4 bg-[var(--ink-05)] rounded-md">
                  <p className="text-sm text-[var(--ink)] font-semibold mb-2">Premium Feature</p>
                  <p className="text-xs text-[var(--ink-50)] mb-3">
                    Alpaca integration is available for premium subscribers only.
                  </p>
                  <Link href="/settings" className="text-[var(--orange)] text-sm font-medium hover:underline">
                    Upgrade to Premium →
                  </Link>
                </div>
              )}
            </>
          ) : (
            <Link href="/auth/login" className="text-[var(--terra)] hover:text-[var(--orange)]">Sign in</Link>
          )}
        </div>

        {/* Sign Out */}
        {user && (
          <div className="mark-card" style={{ padding: "1.5rem", overflow: "hidden" }}>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 border border-[var(--ink-08)] rounded-md text-sm font-semibold uppercase tracking-wider text-[var(--ink-50)] hover:bg-[var(--paper)] transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
