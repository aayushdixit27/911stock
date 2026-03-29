"use client";

import { useEffect, useState } from "react";
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

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  async function handleLogout() {
    await signOut({ callbackUrl: "/" });
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--white)" }}>
      {user && <Nav user={user} />}

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "5rem 5vw 5rem" }}>
        <div className="mark-eyebrow" style={{ marginBottom: "1.5rem" }}>
          Settings
        </div>

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
