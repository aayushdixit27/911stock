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

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [alpacaStatus, setAlpacaStatus] = useState<AlpacaStatus | null>(null);
  const [alpacaLoading, setAlpacaLoading] = useState(false);
  const [alpacaError, setAlpacaError] = useState<string | null>(null);
  const [alpacaSuccess, setAlpacaSuccess] = useState<string | null>(null);

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

  // Fetch Alpaca status when user is loaded
  useEffect(() => {
    if (user) {
      fetchAlpacaStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Check for OAuth callback messages
  useEffect(() => {
    const url = new URL(window.location.href);
    const alpacaStatus = url.searchParams.get("alpaca");
    const alpacaError = url.searchParams.get("alpaca_error");
    
    if (alpacaStatus === "connected") {
      setAlpacaSuccess("Alpaca account connected successfully!");
      // Clean up URL
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

  async function handleLogout() {
    await signOut({ callbackUrl: "/" });
  }

  async function connectAlpaca() {
    setAlpacaLoading(true);
    setAlpacaError(null);
    setAlpacaSuccess(null);
    
    try {
      // Initiate OAuth flow - this will redirect to Alpaca
      window.location.href = "/api/alpaca/auth";
    } catch (_err) {
      setAlpacaLoading(false);
      setAlpacaError("Failed to initiate connection. Please try again.");
    }
  }

  async function disconnectAlpaca() {
    setAlpacaLoading(true);
    setAlpacaError(null);
    setAlpacaSuccess(null);
    
    try {
      const res = await fetch("/api/alpaca/disconnect", {
        method: "POST",
      });
      
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

  return (
    <main style={{ minHeight: "100vh", background: "var(--white)" }}>
      {user && <Nav user={user} />}

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "5rem 5vw 5rem" }}>
        <div className="mark-eyebrow" style={{ marginBottom: "1.5rem" }}>
          Settings
        </div>

        {/* Alpaca Integration Section */}
        <div className="mark-card" style={{ padding: "1.5rem", overflow: "hidden", marginBottom: "1.5rem" }}>
          <div style={{ height: "3px", background: "linear-gradient(to right, var(--orange), var(--ember))", margin: "-1.5rem -1.5rem 1.5rem" }} />

          <div className="mark-eyebrow" style={{ marginBottom: "1rem" }}>
            Alpaca Trading
          </div>

          {loading ? (
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)" }}>
              Loading...
            </p>
          ) : user ? (
            <>
              {/* Alpaca Connection Status */}
              {alpacaStatus && (
                <div style={{ marginBottom: "1rem" }}>
                  {alpacaStatus.isPremium ? (
                    alpacaStatus.alpacaConnected ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink)", fontWeight: 600 }}>
                          Connected to Alpaca
                        </span>
                        {alpacaStatus.connectedAt && (
                          <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", color: "var(--ink-50)" }}>
                            (since {new Date(alpacaStatus.connectedAt).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ink-30)", flexShrink: 0 }} />
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", fontWeight: 600 }}>
                          Not connected
                        </span>
                      </div>
                    )
                  ) : (
                    <div style={{ 
                      padding: "1rem", 
                      background: "var(--ink-05)", 
                      borderRadius: "4px",
                      border: "1px solid var(--ink-08)"
                    }}>
                      <p style={{ 
                        fontFamily: "var(--font-body)", 
                        fontSize: "var(--text-sm)", 
                        color: "var(--ink)",
                        marginBottom: "0.75rem",
                        fontWeight: 600
                      }}>
                        Premium Feature
                      </p>
                      <p style={{ 
                        fontFamily: "var(--font-body)", 
                        fontSize: "var(--text-sm)", 
                        color: "var(--ink-50)",
                        marginBottom: "0.75rem",
                        lineHeight: 1.6
                      }}>
                        Alpaca integration is available for premium subscribers only. 
                        Connect your Alpaca paper trading account to execute trades directly from the app.
                      </p>
                      <Link
                        href="/upgrade"
                        style={{
                          display: "inline-block",
                          fontFamily: "var(--font-body)",
                          fontWeight: 700,
                          fontSize: "var(--text-xs)",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--white)",
                          background: "var(--orange)",
                          borderRadius: "4px",
                          padding: "0.625rem 1rem",
                          textDecoration: "none",
                        }}
                      >
                        Upgrade to Premium
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Error/Success Messages */}
              {alpacaError && (
                <div style={{ 
                  padding: "0.75rem 1rem", 
                  background: "#fef2f2", 
                  borderRadius: "4px",
                  border: "1px solid #fecaca",
                  marginBottom: "1rem"
                }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "#dc2626" }}>
                    {alpacaError}
                  </p>
                </div>
              )}

              {alpacaSuccess && (
                <div style={{ 
                  padding: "0.75rem 1rem", 
                  background: "#f0fdf4", 
                  borderRadius: "4px",
                  border: "1px solid #bbf7d0",
                  marginBottom: "1rem"
                }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "#16a34a" }}>
                    {alpacaSuccess}
                  </p>
                </div>
              )}

              {/* Connect/Disconnect Button */}
              {alpacaStatus?.isPremium && (
                <>
                  {alpacaStatus.alpacaConnected ? (
                    <button
                      onClick={disconnectAlpaca}
                      disabled={alpacaLoading}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "center",
                        fontFamily: "var(--font-body)",
                        fontWeight: 700,
                        fontSize: "var(--text-xs)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--white)",
                        background: "#dc2626",
                        borderRadius: "4px",
                        padding: "0.875rem 1rem",
                        border: "none",
                        cursor: alpacaLoading ? "not-allowed" : "pointer",
                        opacity: alpacaLoading ? 0.6 : 1,
                      }}
                    >
                      {alpacaLoading ? "Disconnecting..." : "Disconnect Alpaca"}
                    </button>
                  ) : (
                    <button
                      onClick={connectAlpaca}
                      disabled={alpacaLoading}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "center",
                        fontFamily: "var(--font-body)",
                        fontWeight: 700,
                        fontSize: "var(--text-xs)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--white)",
                        background: "var(--orange)",
                        borderRadius: "4px",
                        padding: "0.875rem 1rem",
                        border: "none",
                        cursor: alpacaLoading ? "not-allowed" : "pointer",
                        opacity: alpacaLoading ? 0.6 : 1,
                      }}
                    >
                      {alpacaLoading ? "Connecting..." : "Connect Alpaca Account"}
                    </button>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", marginBottom: "0.75rem", lineHeight: 1.6 }}>
                Sign in to connect your Alpaca paper trading account.
              </p>
              <Link
                href="/auth/login"
                style={{
                  display: "block",
                  textAlign: "center",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "var(--text-sm)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--white)",
                  background: "var(--ink)",
                  borderRadius: "4px",
                  padding: "0.875rem 1rem",
                  textDecoration: "none",
                }}
              >
                Sign in
              </Link>
            </>
          )}
        </div>

        {/* Auth0 Guardian Section */}
        <div className="mark-card" style={{ padding: "1.5rem", overflow: "hidden" }}>
          <div style={{ height: "3px", background: "linear-gradient(to right, var(--orange), var(--ember))", margin: "-1.5rem -1.5rem 1.5rem" }} />

          <div className="mark-eyebrow" style={{ marginBottom: "1rem" }}>
            Auth0 Guardian
          </div>

          {loading ? (
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)" }}>
              Loading...
            </p>
          ) : user ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1rem" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink)", fontWeight: 600 }}>
                  {user.email ?? user.name}
                </span>
              </div>

              <GuardianEnroll />

              <div style={{ height: "1px", background: "var(--ink-08)", margin: "1.25rem 0" }} />

              <button
                onClick={handleLogout}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "center",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: "var(--text-xs)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--ink-30)",
                  border: "1px solid var(--ink-08)",
                  borderRadius: "4px",
                  padding: "0.75rem 1rem",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", marginBottom: "0.75rem", lineHeight: 1.6 }}>
                Sign in to enable Guardian push notifications for CIBA trade approvals.
              </p>
              <Link
                href="/auth/login"
                style={{
                  display: "block",
                  textAlign: "center",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "var(--text-sm)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--white)",
                  background: "var(--ink)",
                  borderRadius: "4px",
                  padding: "0.875rem 1rem",
                  textDecoration: "none",
                }}
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

