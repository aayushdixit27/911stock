import { auth } from "@/lib/auth";
import { getAccuracyStats, getSql } from "@/lib/db";
import Link from "next/link";
import PageClient from "./page-client";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  // If authenticated, check onboarding status
  if (session?.user?.id) {
    const sql = getSql();
    let onboardingCompleted = false;
    
    if (sql) {
      const rows = await sql<{ onboarding_completed: boolean }[]>`
        SELECT onboarding_completed FROM users WHERE id = ${session.user.id}
      `;
      onboardingCompleted = rows[0]?.onboarding_completed ?? false;
    }
    
    // Redirect to onboarding if not completed
    if (!onboardingCompleted) {
      redirect("/onboarding");
    }
    
    return <PageClient user={session.user} />;
  }

  // Fetch accuracy stats for the landing page
  let accuracyStats = { accuracy7d: 0, accuracy30d: 0, totalSignals: 0 };
  try {
    const stats = await getAccuracyStats();
    accuracyStats = {
      accuracy7d: stats.checked7d > 0 ? Math.round((stats.correct7d / stats.checked7d) * 100) : 0,
      accuracy30d: stats.checked30d > 0 ? Math.round((stats.correct30d / stats.checked30d) * 100) : 0,
      totalSignals: stats.totalSignals,
    };
  } catch {
    // If accuracy stats fail, show 0% - this is fine for new deployments
  }

  // If not authenticated, show the marketing landing page
  return (
    <main style={{ minHeight: "100vh", background: "var(--white)" }}>
      {/* Hero Section */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem 5vw",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(234,76,0,0.08) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", textAlign: "center", maxWidth: "800px" }}>
          {/* Logo */}
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.5rem",
              fontStyle: "italic",
              color: "var(--orange)",
              marginBottom: "2rem",
            }}
          >
            911stock
          </div>

          {/* Hero Headline */}
          <h1
            className="mark-display"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              lineHeight: 1.1,
              marginBottom: "1.5rem",
              color: "var(--ink)",
            }}
          >
            Your portfolio, watched.
          </h1>

          {/* Value Proposition */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(1.125rem, 2vw, 1.375rem)",
              color: "var(--ink-70)",
              lineHeight: 1.6,
              marginBottom: "2.5rem",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            AI monitors SEC filings and calls you when something matters.
            <br />
            Never miss an insider signal again.
          </p>

          {/* CTA Button */}
          <Link
            href="/auth/register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "var(--text-base)",
              letterSpacing: "0.02em",
              color: "var(--white)",
              background: "var(--orange)",
              padding: "1rem 2rem",
              borderRadius: "6px",
              textDecoration: "none",
              transition: "transform 0.15s, box-shadow 0.15s",
              boxShadow: "0 4px 14px rgba(234,76,0,0.25)",
            }}
          >
            Get started — it&apos;s free
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Already have account */}
          <p style={{ marginTop: "1.5rem", fontSize: "var(--text-sm)", color: "var(--ink-50)" }}>
            Already have an account?{" "}
            <Link
              href="/auth/login"
              style={{ color: "var(--terra)", textDecoration: "none", fontWeight: 500 }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>

      {/* Feature Highlights */}
      <section
        style={{
          padding: "6rem 5vw",
          background: "var(--paper)",
          borderTop: "1px solid var(--ink-08)",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div className="mark-eyebrow" style={{ marginBottom: "3rem", justifyContent: "center" }}>
            How it works
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2rem",
            }}
          >
            {/* Feature 1 */}
            <div
              style={{
                background: "var(--white)",
                border: "1px solid var(--ink-08)",
                borderRadius: "8px",
                padding: "2rem",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--orange)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.25rem",
                  fontWeight: 500,
                  marginBottom: "0.5rem",
                  color: "var(--ink)",
                }}
              >
                24/7 SEC Monitoring
              </h3>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.6 }}>
                Our AI watches Form 4 filings in real-time. Detect unscheduled insider sales,
                unusual patterns, and potential red flags before they hit the news.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              style={{
                background: "var(--white)",
                border: "1px solid var(--ink-08)",
                borderRadius: "8px",
                padding: "2rem",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--terra)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.25rem",
                  fontWeight: 500,
                  marginBottom: "0.5rem",
                  color: "var(--ink)",
                }}
              >
                AI Phone Calls
              </h3>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.6 }}>
                When a high-significance signal is detected, we call you immediately with a
                plain-English summary. No app to check, no email to miss.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              style={{
                background: "var(--white)",
                border: "1px solid var(--ink-08)",
                borderRadius: "8px",
                padding: "2rem",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--ink)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.25rem",
                  fontWeight: 500,
                  marginBottom: "0.5rem",
                  color: "var(--ink)",
                }}
              >
                Personalized Scoring
              </h3>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--ink-50)", lineHeight: 1.6 }}>
                Signals are scored relative to YOUR portfolio. A CEO sale matters more
                if you hold 1,000 shares than if you hold 10.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Accuracy Stats Section */}
      <section
        style={{
          padding: "4rem 5vw",
          background: "var(--ink)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              fontStyle: "italic",
              color: "var(--white)",
              marginBottom: "0.5rem",
            }}
          >
            Trusted by data
          </h2>
          <p
            style={{
              fontSize: "var(--text-base)",
              color: "rgba(255,255,255,0.6)",
              marginBottom: "2rem",
            }}
          >
            We track every prediction to continuously improve our AI models.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "3rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: 700,
                  color: accuracyStats.accuracy7d >= 60 ? "#22c55e" : "var(--orange)",
                }}
              >
                {accuracyStats.accuracy7d > 0 ? `${accuracyStats.accuracy7d}%` : "—"}
              </div>
              <div style={{ fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.6)" }}>
                7-day accuracy
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: 700,
                  color: accuracyStats.accuracy30d >= 60 ? "#22c55e" : "var(--orange)",
                }}
              >
                {accuracyStats.accuracy30d > 0 ? `${accuracyStats.accuracy30d}%` : "—"}
              </div>
              <div style={{ fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.6)" }}>
                30-day accuracy
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: 700,
                  color: "var(--white)",
                }}
              >
                {accuracyStats.totalSignals.toLocaleString()}
              </div>
              <div style={{ fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.6)" }}>
                signals tracked
              </div>
            </div>
          </div>

          <Link
            href="/accuracy"
            style={{
              display: "inline-block",
              marginTop: "2rem",
              fontSize: "var(--text-sm)",
              color: "var(--orange)",
              textDecoration: "none",
            }}
          >
            View full accuracy report →
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: "4rem 5vw",
          background: "var(--paper)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontStyle: "italic",
            color: "var(--ink)",
            marginBottom: "1rem",
          }}
        >
          Start watching your portfolio today
        </h2>
        <p
          style={{
            fontSize: "var(--text-base)",
            color: "var(--ink-70)",
            marginBottom: "2rem",
            maxWidth: "400px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Free tier includes SEC monitoring and email alerts. Upgrade for real-time signals and phone calls.
        </p>
        <Link
          href="/auth/register"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "var(--text-base)",
            color: "var(--white)",
            background: "var(--orange)",
            padding: "1rem 2rem",
            borderRadius: "6px",
            textDecoration: "none",
            transition: "transform 0.15s",
          }}
        >
          Create free account
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "2rem 5vw",
          background: "var(--ink)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            fontStyle: "italic",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          911stock
        </span>
        <p style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.2)" }}>
          Built for the Deep Agents Hackathon 2026
        </p>
      </footer>
    </main>
  );
}

